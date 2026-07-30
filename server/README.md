# Nova — AI Study Assistant (Server)

Node.js / Express backend, built to match the `client/` app exactly (same
routes, same response shapes) and to hand off all AI work — chat replies,
note summaries, quiz generation — to your Python `ai-service`.

## Architecture

    client  --HTTP-->  server (this)  --HTTP-->  ai-service (Python/FastAPI)  --> Gemini

The server never talks to Gemini directly and never holds the Gemini API
key. It only knows how to reach `ai-service` over HTTP. This keeps secrets
scoped to the one place that actually needs them.

## Stack

Express, Mongoose (MongoDB Atlas), JWT auth (jsonwebtoken + bcryptjs),
Multer for uploads, pdfjs-dist + mammoth for PDF/DOCX text extraction,
Axios for calling ai-service.

## Getting started

    npm install
    cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, AI_SERVICE_URL
    npm run dev

`npm run dev` uses Node's built-in `--watch` flag, so no nodemon dependency
is needed. `npm start` runs it once without watching.

## Environment variables

| Variable | Description |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign tokens (`openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | Token lifetime, defaults to `30d` |
| `AI_SERVICE_URL` | Base URL of your Python ai-service, e.g. `http://localhost:8000` |
| `PORT` | Defaults to `5000` |

No Gemini key here — that belongs in `ai-service/.env` only.

## API routes (all mounted under `/api`, all except register/login require `Authorization: Bearer <token>`)

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | `{ token, user }` |
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` |
| GET | `/auth/me` | — | `{ user }` |
| GET | `/notes` | — | `{ notes }` |
| POST | `/notes/upload` | multipart, field `note` | `{ note }` |
| GET | `/notes/:id` | — | `{ note }` |
| DELETE | `/notes/:id` | — | `{ message }` |
| GET | `/quiz` | — | `{ quizzes }` |
| POST | `/quiz/generate` | `{ topic, noteId, difficulty, numQuestions }` | `{ quiz }` |
| POST | `/quiz/:id/submit` | `{ answers: [{questionId, selectedIndex}] }` | `{ result: { score, total } }` |
| DELETE | `/quiz/:id` | — | `{ message }` |
| GET | `/chat/conversations` | — | `{ conversations }` |
| POST | `/chat/conversations` | `{ title }` | `{ conversation }` |
| GET | `/chat/conversations/:id/messages` | — | `{ messages }` |
| POST | `/chat/conversations/:id/messages` | `{ content }` | `{ message }` (tutor's reply) |
| DELETE | `/chat/conversations/:id` | — | `{ message }` |
| GET | `/planner` | — | `{ tasks }` |
| POST | `/planner` | `{ title, subject, time, date, completed }` | `{ task }` |
| PUT | `/planner/:id` | any subset of the above | `{ task }` |
| DELETE | `/planner/:id` | — | `{ message }` |

This lines up exactly with what `client/src/services/*.js` expects — you
should be able to point the client's `VITE_API_URL` at this server and have
everything work without touching the frontend.

## Assumed ai-service contract

`utils/aiServiceClient.js` is the only file that calls your Python service.
It currently assumes:

    POST {AI_SERVICE_URL}/summarize        { text }                                    -> { summary }
    POST {AI_SERVICE_URL}/chat              { message, history }                        -> { reply }
    POST {AI_SERVICE_URL}/quiz/generate     { topic, noteText, difficulty, numQuestions } -> { questions }

`questions` should be an array of `{ question, options: string[], correctIndex }`.

**If your actual `ai-service/main.py` routes are named differently, only
`utils/aiServiceClient.js` needs to change** — nothing else in the server
depends on those exact paths. Share your real route names and I'll adjust it.

## Note on quiz answers

`correctIndex` is included in the quiz object returned to the client so the
results screen can highlight right/wrong answers client-side. That's a
reasonable simplification for a self-study practice tool (nobody is being
proctored), but it does mean a determined user could read answers from the
network tab before submitting. If you ever need this for something
higher-stakes (like your SIEMS exam system), the fix is to strip
`correctIndex` from what's sent before the quiz is taken and only reveal it
per-question in the `/submit` response.

## What was validated in this sandbox

No live MongoDB or real Gemini-backed ai-service was available here, so:
- Confirmed with an in-memory mock: JWT sign/verify, bcrypt hash/compare,
  full Express routing (401s on missing/bad tokens, 404 on unknown routes,
  graceful error responses), and the complete upload -> text-extraction ->
  AI-summarize pipeline using real generated PDF/DOCX/TXT files.
- **Not tested here:** actual MongoDB reads/writes against your real Atlas
  cluster, and your real ai-service/Gemini responses. Please do a quick
  smoke test (register a user, upload a note, generate a quiz) once your
  `.env` is filled in.
