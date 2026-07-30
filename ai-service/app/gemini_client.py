"""Shared Gemini client setup. Every other module in app/ imports get_client()
and GEMINI_MODEL from here instead of constructing its own client, so the API
key is read from the environment in exactly one place.
"""
import os
from google import genai

_client = None


def get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Add it to ai-service/.env - see .env.example."
            )
        _client = genai.Client(api_key=api_key)
    return _client


GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
