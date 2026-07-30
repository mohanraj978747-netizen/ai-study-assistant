from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .gemini_client import GEMINI_MODEL, get_client

router = APIRouter(prefix="/quiz")

# Keep note-derived context within a sane size for a student's free-tier key.
MAX_SOURCE_CHARS = 8000


class QuizGenerateRequest(BaseModel):
    topic: Optional[str] = None
    noteText: Optional[str] = None
    difficulty: str = "medium"
    numQuestions: int = 5


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correctIndex: int


class QuizGenerateResponse(BaseModel):
    questions: List[QuizQuestion]


@router.post("/generate", response_model=QuizGenerateResponse)
def generate_quiz(payload: QuizGenerateRequest):
    if not payload.topic and not payload.noteText:
        raise HTTPException(status_code=400, detail="Provide a topic or noteText")

    n = max(1, min(payload.numQuestions or 5, 20))

    prompt_lines = [
        f"Write {n} multiple-choice quiz questions at {payload.difficulty} difficulty.",
        "Each question needs exactly 4 answer options and exactly one correct answer.",
        "correctIndex is the zero-based index (0-3) of the correct option.",
        "Do not repeat the same question twice, and do not reuse the same wording as the source text.",
    ]
    if payload.noteText:
        prompt_lines.append(f"Base the questions on this material:\n{payload.noteText[:MAX_SOURCE_CHARS]}")
    elif payload.topic:
        prompt_lines.append(f"Topic: {payload.topic}")

    try:
        client = get_client()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents="\n".join(prompt_lines),
            config={
                "response_mime_type": "application/json",
                "response_schema": list[QuizQuestion],
            },
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {exc}")

    questions = response.parsed or []
    # Defensive filter: even with a schema, keep only answers that are
    # actually usable (in range) before handing them back to the server.
    valid = [q for q in questions if q.options and 0 <= q.correctIndex < len(q.options)]

    if not valid:
        raise HTTPException(status_code=502, detail="Gemini did not return any valid questions")

    return QuizGenerateResponse(questions=valid)
