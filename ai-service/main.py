import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.qa_engine import router as qa_router
from app.quiz_generator import router as quiz_router
from app.recommender import router as recommender_router
from app.summarizer import router as summarizer_router

app = FastAPI(
    title="Nova AI Study Assistant - AI Service",
    description="Python microservice wrapping the Gemini API for the Node server.",
)

# Only the Node server calls this service (never the browser directly), but
# CORS is left open here since it's simplest for local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(summarizer_router)
app.include_router(qa_router)
app.include_router(quiz_router)
app.include_router(recommender_router)


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
