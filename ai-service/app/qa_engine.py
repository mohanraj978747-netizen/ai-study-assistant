from typing import List, Optional

from fastapi import APIRouter, HTTPException
from google.genai import types
from pydantic import BaseModel

from .gemini_client import GEMINI_MODEL, get_client
from .web_search import search_web


router = APIRouter()


# ============================================================
# NOVA SYSTEM INSTRUCTION
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

    "Gemini is the underlying AI model used to power Nova's "
    "responses, but Gemini is not Nova's identity. "

    "Do not falsely claim that Mohan Raj trained the Gemini "
    "foundation model. "

    # ========================================================
    # WEB SEARCH
    # ========================================================

    "WEB SEARCH IMPLEMENTATION: "

    "This application has a web-search feature powered by Tavily. "

    "When the application determines that a question requires "
    "current or recent information, it calls the Tavily search "
    "service to retrieve web results. "

    "Those Tavily results are then provided to you so that you "
    "can analyze and synthesize the information. "

    "Tavily is the web-search and retrieval service used by "
    "this application. "

    "Gemini is the AI model that processes the retrieved "
    "information and generates the final response. "

    "If the student asks 'Do you use Tavily?', answer YES. "
    "Say that your application's web-search capability uses Tavily. "

    "If the student asks 'What search engine do you use?', "
    "do not claim that you use Google, Bing, Yahoo, Brave, "
    "or another search engine unless that service is actually "
    "configured in the application. "

    "Explain that Tavily is the search/retrieval service used "
    "by this application. "

    "Do not claim that you use Google's search tools or "
    "Gemini's built-in search tools for this application's "
    "web search. "

    "The websites appearing in search results are sources "
    "retrieved by Tavily. They are not necessarily the search "
    "engine or search service being used. "

    "When web search results are provided, use them as "
    "current information and do not pretend that you searched "
    "the web yourself. "

    # ========================================================
    # STUDY ASSISTANT
    # ========================================================

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
# REQUEST MODELS
# ============================================================

class HistoryTurn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[HistoryTurn]] = None


# ============================================================
# RESPONSE MODEL
# ============================================================

class Source(BaseModel):
    title: str
    url: str


class ChatResponse(BaseModel):
    reply: str
    sources: List[Source] = []


# ============================================================
# GEMINI HISTORY CONVERSION
# ============================================================

def _to_gemini_contents(history, message):

    contents = []

    for turn in history or []:

        role = (
            "model"
            if turn.role == "assistant"
            else "user"
        )

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

    # Current user message
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
# DETERMINE WHETHER WEB SEARCH IS NEEDED
# ============================================================

def should_search_web(message: str) -> bool:

    keywords = [
        "latest",
        "today",
        "current",
        "recent",
        "news",
        "this week",
        "this month",
        "this year",
        "2026",
        "price",
        "prices",
        "version",
        "weather",
        "update",
        "updates",
        "release",
        "released",
        "new",
        "now",
        "currently",
        "stock",
        "score",
        "live",
        "ranking",
        "rankings",
        "schedule",
        "event",
    ]

    message_lower = message.lower()

    return any(
        keyword in message_lower
        for keyword in keywords
    )


# ============================================================
# CHAT ENDPOINT
# ============================================================

@router.post(
    "/chat",
    response_model=ChatResponse
)
def chat(payload: ChatRequest):

    # --------------------------------------------------------
    # Validate message
    # --------------------------------------------------------

    if not payload.message or not payload.message.strip():

        raise HTTPException(
            status_code=400,
            detail="message is required"
        )

    # --------------------------------------------------------
    # Get Gemini client
    # --------------------------------------------------------

    try:

        client = get_client()

    except RuntimeError as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc)
        )

    # --------------------------------------------------------
    # WEB SEARCH
    # --------------------------------------------------------

    web_context = ""
    sources = []

    if should_search_web(payload.message):

        print("=================================")
        print("WEB SEARCH TRIGGERED")
        print("Query:", payload.message)
        print("=================================")

        try:

            results = search_web(payload.message)

            if results:

                web_context = (
                    "\n\n"
                    "IMPORTANT: The following information was "
                    "retrieved from the web using Tavily. "
                    "Use it to answer the student's question. "
                    "Do not say that you personally searched the web.\n\n"
                )

                for i, result in enumerate(
                    results,
                    start=1
                ):

                    title = result.get(
                        "title",
                        ""
                    )

                    url = result.get(
                        "url",
                        ""
                    )

                    content = result.get(
                        "content",
                        ""
                    )

                    web_context += (
                        f"Source {i}:\n"
                        f"Title: {title}\n"
                        f"URL: {url}\n"
                        f"Content: {content}\n\n"
                    )

                    # Return source information to frontend
                    if title and url:

                        sources.append(
                            {
                                "title": title,
                                "url": url
                            }
                        )

            else:

                print("Tavily returned no results.")

        except Exception as exc:

            print("=================================")
            print("WEB SEARCH FAILED")
            print(type(exc))
            print(exc)
            print("=================================")

            # Do not stop Nova completely if Tavily fails.
            web_context = ""

    # --------------------------------------------------------
    # Build message for Gemini
    # --------------------------------------------------------

    message_for_gemini = (
        payload.message
        + web_context
    )

    # --------------------------------------------------------
    # Send request to Gemini
    # --------------------------------------------------------

    try:

        response = client.models.generate_content(

            model=GEMINI_MODEL,

            contents=_to_gemini_contents(
                payload.history,
                message_for_gemini
            ),

            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION
            ),
        )

    except Exception as exc:

        import traceback

        traceback.print_exc()

        print("================================")
        print("GEMINI ERROR")
        print(type(exc))
        print(exc)
        print("================================")

        raise HTTPException(
            status_code=502,
            detail=str(exc)
        )

    # --------------------------------------------------------
    # Get Gemini response
    # --------------------------------------------------------

    reply = (
        response.text or ""
    ).strip()

    # --------------------------------------------------------
    # Check empty response
    # --------------------------------------------------------

    if not reply:

        raise HTTPException(
            status_code=502,
            detail="Gemini returned an empty reply"
        )

    # --------------------------------------------------------
    # Return reply + sources
    # --------------------------------------------------------

    return ChatResponse(
        reply=reply,
        sources=sources
    )