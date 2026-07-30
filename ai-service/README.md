# Nova — AI Study Assistant (AI Service)

Python/FastAPI microservice that wraps the Gemini API. This is the only
piece of the whole project that holds the Gemini API key, and the only
piece that talks to Google directly.

    server (Node)  --HTTP-->  ai-service (this)  --HTTPS-->  Gemini API

## Stack

FastAPI, `google-genai` (Google's current official Gemini SDK — the older
`google-generativeai` package is legacy and not used here), Pydantic for
request/response validation and structured output.

## Getting started

    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt
    cp .env.example .env   # paste your real Gemini key into .env, NOT .env.example
    .venv/bin/python main.py

Or with auto-reload for development: `.venv/bin/uvicorn main:app --reload --port 8000`.

Get a free API key at https://aistudio.google.com/apikey. Paste it into
`ai-service/.env` only — never into `client/.env` or `server/.env`, and
never commit `.env` to git (it's already in `.gitignore`).

## Routes

All routes match exactly what `server/utils/aiServiceClient.js` expects.

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/health` | — | `{ status: "ok" }` |
| POST | `/summarize` | `{ text }` | `{ summary }` |
| POST | `/chat` | `{ message, history: [{role, content}] }` | `{ reply }` |
| POST | `/quiz/generate` | `{ topic, noteText, difficulty, numQuestions }` | `{ questions: [{question, options, correctIndex}] }` |
| POST | `/recommend` | `{ topic, weakAreas }` | `{ recommendations: string[] }` |

`/recommend` exists (matching `recommender.py` in the original structure)
but isn't called by the server yet — it's a ready-to-wire extension point
for a future "recommended topics" feature.

## How each endpoint works

- **`/summarize`** — one Gemini call, plain text in, plain text summary out. Notes are trimmed to 20,000 characters so a huge PDF doesn't blow past context limits or cost.
- **`/chat`** — stateless by design: the Node server owns conversation history in MongoDB and sends the relevant recent turns on every call. This service just replays that history into Gemini's `contents` (mapping the server's `assistant` role to Gemini's `model` role) plus a system instruction that explicitly tells the model to answer *any* topic, not just uploaded notes.
- **`/quiz/generate`** — uses Gemini's structured output (`response_schema` with a Pydantic model), so the response is guaranteed valid JSON matching `{question, options, correctIndex}` rather than hoping the model formats it correctly. A second, defensive pass filters out any question whose `correctIndex` would be out of range before returning.

## Model

Defaults to `gemini-2.5-flash` — a good cost/quality balance for a
student project with a free-tier key. Override it with `GEMINI_MODEL` in
`.env` if you want to try a newer model (e.g. `gemini-3.5-flash`) without
touching any code.

## What was validated in this sandbox (and what wasn't)

This sandbox has no route to `generativelanguage.googleapis.com`, and I
never had a real API key, so an actual successful Gemini response was
never something I could see here. What I did verify directly:

- `google-genai` installs cleanly and all imports resolve
- Every endpoint's input validation (missing text/message/topic all return
  clean 400s; malformed JSON returns FastAPI's automatic 422)
- Missing `GEMINI_API_KEY` fails fast with a clear 500 config error instead
  of a confusing crash
- A real outbound call with an invalid key correctly produced a graceful
  502 with a readable error message, and the server stayed up afterward
  (this is as close to testing a live failure path as was possible here)

**Please do a real smoke test once your key is in `.env`:** start this
service, start `server/`, start `client/`, register an account, and try
the chat, a note upload, and a generated quiz. If `/quiz/generate` ever
returns a 502 saying Gemini didn't return valid JSON, it's almost always
the model being verbose around the JSON rather than a code problem — the
structured-output config should prevent that, but it's worth knowing.
