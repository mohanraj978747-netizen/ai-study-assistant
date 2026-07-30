from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .gemini_client import get_client, GEMINI_MODEL

router = APIRouter()

# Keep prompts within a sane size for a student's free-tier key.
MAX_CHARS = 20000


class SummarizeRequest(BaseModel):
    text: str


class SummarizeResponse(BaseModel):
    summary: str


@router.post("/summarize", response_model=SummarizeResponse)
def summarize(payload: SummarizeRequest):
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="No text provided to summarize")

    prompt = (
        "You are a helpful study assistant. Summarize the following notes for a "
        "student who wants to revise before an exam. Keep it clear and structured "
        "with short paragraphs or bullet points, and focus on the key concepts.\n\n"
        f"NOTES:\n{text[:MAX_CHARS]}"
    )

    try:
        client = get_client()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {exc}")

    summary = (response.text or "").strip()
    if not summary:
        raise HTTPException(status_code=502, detail="Gemini returned an empty summary")

    return SummarizeResponse(summary=summary)
