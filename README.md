# AI Personal Study Assistant

Full-stack study companion with an AI chat, note summarization, auto-generated quizzes, and a study planner — built on the MERN stack with Google Gemini.

## Tech stack

| Layer     | Choice |
|-----------|--------|
| Frontend  | React 19 + Vite + Tailwind CSS v4 + Motion (animations) |
| Backend   | Node.js + Express |
| Database  | MongoDB Atlas (Mongoose) |
| Auth      | JWT |
| AI        | Google Gemini API (`@google/genai`) |

## Features

- **Chat** — general-purpose AI chat (not limited to notes), with full history that persists across logins instead of resetting
- **Notes** — upload notes, get an AI summary, ask the chat follow-up doubts grounded in a specific note
- **Quiz** — Gemini generates multiple-choice quizzes from a note; answers are graded and scored
- **Planner** — study plan / task tracking by subject and date

## Project structure

```
frontend/   React SPA (pages, components, context, services)
backend/    Express API (routes, controllers, models, JWT auth, services/aiService/)
```

## Getting started

**Backend**
```
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm run dev
```

**Frontend**
```
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Status

Structure + config scaffolded and wired together. Feature logic (auth, Gemini prompts, DB queries, real UI) is stubbed with TODOs as the next step.
