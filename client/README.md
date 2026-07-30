# Nova — AI Study Assistant (Client)

Premium, animated React front end for the AI Personal Study Assistant MCA
project. Built with React + Vite + Tailwind CSS, Framer Motion, and a
lightweight custom Three.js "illuminated constellation" background.

## Stack

- React 18 + Vite
- Tailwind CSS (dark, glassmorphic theme — void/brass/indigo/parchment palette)
- Framer Motion for animation
- Three.js (vanilla, via `src/three/useThreeSetup.js`) for the constellation backgrounds
- React Router v6, Axios, Recharts, date-fns

## Getting started

    npm install
    cp .env.example .env   # then set VITE_API_URL to your backend
    npm run dev

Build for production:

    npm run build
    npm run preview

## Environment variables

Only one variable is needed on the client:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of your Node/Express backend, e.g. `http://localhost:5000/api` |

**Important:** your MongoDB Atlas URI and Gemini API key should live only in
`server/.env` and `ai-service/.env`, never in the client. Anything prefixed
`VITE_` gets bundled into the JavaScript shipped to the browser, so it is
effectively public. The client never talks to MongoDB or Gemini directly —
only to your own backend.

## Expected backend API

The client is written against the following REST shape, matching your
`authController` / `noteController` / `quizController` / `chatController`
naming. Adjust either side if your actual routes differ.

| Area | Method & path | Notes |
|---|---|---|
| Auth | `POST /auth/register` | `{ name, email, password }` → `{ token, user }` |
| Auth | `POST /auth/login` | `{ email, password }` → `{ token, user }` |
| Auth | `GET /auth/me` | returns `{ user }` for the current token |
| Notes | `GET /notes` | list notes |
| Notes | `POST /notes/upload` | multipart, field name `note` |
| Notes | `DELETE /notes/:id` | |
| Quiz | `GET /quiz` | list past quizzes |
| Quiz | `POST /quiz/generate` | `{ topic, noteId, difficulty, numQuestions }` |
| Quiz | `POST /quiz/:id/submit` | `{ answers }` → `{ score, total }` |
| Chat | `GET /chat/conversations` | list conversations |
| Chat | `POST /chat/conversations` | `{ title }` |
| Chat | `GET /chat/conversations/:id/messages` | |
| Chat | `POST /chat/conversations/:id/messages` | `{ content }` → tutor's reply message |
| Chat | `DELETE /chat/conversations/:id` | |
| Planner | `GET /planner` | list tasks |
| Planner | `POST /planner` | create task |
| Planner | `PUT /planner/:id` | update task |
| Planner | `DELETE /planner/:id` | |

A `services/plannerService.js` file was added on the client side — it
wasn't in the folder structure you shared, but the Planner page needs it to
talk to your `plannerController` / `plannerRoutes`.

## Notes on the AI tutor

The chat screen is built to feel like a general-purpose tutor: empty
states, placeholder text, etc. don't imply "notes-only" Q&A. Whether it
actually answers general questions depends on how `ai-service` prompts
Gemini — as long as it isn't restricted to retrieval only from uploaded
notes, this UI supports that experience as-is. Conversations and messages
are always loaded from the backend on mount, so refreshing the page never
loses history or starts a blank chat while saved conversations exist.

## Folder structure

Matches the structure you shared, with `plannerService.js` added under
`src/services/`. `public/models/` is ready for any `.glb` files you want to
load into `HeroScene.jsx` later — it currently renders a fully procedural
network sphere, so no external assets are required.
