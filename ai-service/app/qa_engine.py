from typing import List, Optional

from fastapi import APIRouter, HTTPException
from google.genai import types
from pydantic import BaseModel

from .gemini_client import GEMINI_MODEL, get_client


router = APIRouter()


# ============================================================
# NOVA IDENTITY / SYSTEM INSTRUCTION
# ============================================================

SYSTEM_INSTRUCTION = (
    "You are Nova, a friendly and encouraging AI Study Assistant. "

    "Your name is Nova. "
    "Your creator is Mohan Raj. "

    "If the student asks 'Who are you?', say that you are "
    "Nova, an AI Study Assistant created by Mohan Raj. "

    "If the student asks 'Who created you?', say: "
    "'I was created by Mohan Raj as part of the Nova AI Study "
    "Assistant project.' "

    "If the student asks 'Who is your creator?', identify "
    "Mohan Raj as your creator. "

    "Do not identify yourself as ChatGPT. "
    "Do not say that Google created Nova. "
    "Do not say that OpenAI created Nova. "

    "Gemini is the underlying AI technology used to power "
    "Nova's responses, but Gemini is not Nova's identity. "

    "Do not falsely claim that Mohan Raj trained the Gemini "
    "foundation model. "

    "You are designed to help students with learning, "
    "academic explanations, note understanding, quizzes, "
    "study planning, and general educational questions. "

    "Answer the student's questions clearly and accurately "
    "on ANY topic they ask about, not only material they "
    "have uploaded. "

    "Explain concepts step by step when it helps understanding, "
    "and keep answers focused rather than unnecessarily long. "

    "Be friendly, encouraging, and helpful."
)


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class HistoryTurn(BaseModel):
    role: str
    # 'user' | 'assistant', as stored by the Node server
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[HistoryTurn]] = None


class ChatResponse(BaseModel):
    reply: str


# ============================================================
# CONVERT CHAT HISTORY TO GEMINI FORMAT
# ============================================================

def _to_gemini_contents(history, message):
    contents = []

    for turn in history or []:
        # Gemini uses 'model' where the rest of this app
        # says 'assistant'.
        role = "model" if turn.role == "assistant" else "user"

        contents.append(
            types.Content(
                role=role,
                parts=[
                    types.Part.from_text(
                        text=turn.content
                    )
                ],
            )
        )

    # Add the current student message
    contents.append(
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(
                    text=message
                )
            ],
        )
    )

    return contents


# ============================================================
# CHAT ENDPOINT
# ============================================================

@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):

    # Validate message
    if not payload.message or not payload.message.strip():
        raise HTTPException(
            status_code=400,
            detail="message is required"
        )

    # Get Gemini client
    try:
        client = get_client()

    except RuntimeError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc)
        )

    # Send request to Gemini
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=_to_gemini_contents(
                payload.history,
                payload.message
            ),
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION
            ),
        )

    except Exception as exc:
        import traceback

        traceback.print_exc()

        print("================================")
        print(type(exc))
        print(exc)
        print("================================")

        raise HTTPException(
            status_code=502,
            detail=str(exc)
        )

    # Get Gemini response
    reply = (response.text or "").strip()

    # Make sure Gemini actually returned something
    if not reply:
        raise HTTPException(
            status_code=502,
            detail="Gemini returned an empty reply"
        )

    return ChatResponse(reply=reply)