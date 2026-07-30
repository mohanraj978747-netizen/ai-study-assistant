"""Not currently called by server/ or the client - kept for parity with the
original project structure and ready for a future "recommended next topics"
feature (e.g. on the dashboard). Wire it up by adding a call to POST
/recommend from utils/aiServiceClient.js when you're ready to use it.
"""
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .gemini_client import GEMINI_MODEL, get_client

router = APIRouter()


class RecommendRequest(BaseModel):
    topic: Optional[str] = None
    weakAreas: Optional[List[str]] = None


class RecommendResponse(BaseModel):
    recommendations: List[str]


@router.post("/recommend", response_model=RecommendResponse)
def recommend(payload: RecommendRequest):
    focus = payload.topic or ", ".join(payload.weakAreas or []) or "general study skills"

    prompt = (
        f"A student wants study recommendations for: {focus}. "
        "Give 3 to 5 short, concrete, actionable study tips (max one sentence "
        "each). Return each tip on its own line, with no numbering or bullets."
    )

    try:
        client = get_client()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    try:
        response = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {exc}")

    lines = [line.strip("-• \t") for line in (response.text or "").splitlines() if line.strip()]
    if not lines:
        raise HTTPException(status_code=502, detail="Gemini returned no recommendations")

    return RecommendResponse(recommendations=lines[:5])
