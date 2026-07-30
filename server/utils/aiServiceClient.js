import axios from 'axios';

// This is the ONLY file that talks to your Python ai-service. The Gemini
// API key itself should live in ai-service/.env and never touch this
// server - we just call the microservice over plain HTTP.
//
// Assumed contract (adjust the paths below if your main.py routes differ):
//   POST {AI_SERVICE_URL}/summarize        { text }                          -> { summary }
//   POST {AI_SERVICE_URL}/chat              { message, history }             -> { reply }
//   POST {AI_SERVICE_URL}/quiz/generate     { topic, noteText, difficulty,
//                                             numQuestions }                 -> { questions }

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000,
});

export async function summarizeText(text) {
  const { data } = await aiClient.post('/summarize', { text });
  return data?.summary ?? data;
}

export async function askTutor(message, history = []) {
  const { data } = await aiClient.post('/chat', { message, history });
  try {
  const { data } = await aiClient.post('/chat', { message, history });
  console.log("AI Response:", data);
  return data.reply;
} catch (err) {
  console.log("Status:", err.response?.status);
  console.log("Response:", err.response?.data);
  console.log("Message:", err.message);
  throw err;
}
  return data?.reply ?? data?.message ?? data;
}

export async function generateQuizQuestions({ topic, noteText, difficulty, numQuestions }) {
  const { data } = await aiClient.post('/quiz/generate', {
    topic,
    noteText,
    difficulty,
    numQuestions,
  });
  return data?.questions ?? data;
}

export default aiClient;
