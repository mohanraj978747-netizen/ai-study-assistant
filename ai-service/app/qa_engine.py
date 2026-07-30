from typing import List, Optional

from fastapi import APIRouter, HTTPException
from google.genai import types
from pydantic import BaseModel

from .gemini_client import GEMINI_MODEL, get_client

router = APIRouter()

SYSTEM_INSTRUCTION = (
    "You are Nova, a friendly, encouraging AI study tutor. Answer the "
    "student's questions clearly and accurately on ANY topic they ask about, "
    "not only material they've uploaded - you are a general-purpose tutor. "
    "Explain concepts step by step when it helps understanding, and keep "
    "answers focused rather than overly long."
)


class HistoryTurn(BaseModel):
    role: str  # 'user' | 'assistant', as stored by the Node server
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[HistoryTurn]] = None


class ChatResponse(BaseModel):
    reply: str


def _to_gemini_contents(history, message):
    contents = []
    for turn in history or []:
        # Gemini uses 'model' where the rest of this app says 'assistant'.
        role = "model" if turn.role == "assistant" else "user"
        contents.append(types.Content(role=role, parts=[types.Part.from_text(text=turn.content)]))
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=message)]))
    return contents


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="message is required")

    try:
        client = get_client()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=_to_gemini_contents(payload.history, payload.message),
            config=types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTION),
        )
    except Exception as exc:
        import traceback
        traceback.print_exc()
        print("================================")
        print(type(exc))
        print(exc)
        print("================================")
        raise HTTPException(status_code=502, detail=str(exc))

    reply = (response.text or "").strip()
    if not reply:
        raise HTTPException(status_code=502, detail="Gemini returned an empty reply")

    return ChatResponse(reply=reply)
