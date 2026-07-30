import axios from 'axios';

// URL of your deployed AI service
const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

console.log("=================================");
console.log("AI_SERVICE_URL =", AI_SERVICE_URL);
console.log("=================================");

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000,
});

export async function summarizeText(text) {
  try {
    const { data } = await aiClient.post("/summarize", { text });

    console.log("Summarize Response:", data);

    return data?.summary ?? data;
  } catch (err) {
    console.error("===== SUMMARIZE ERROR =====");
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    console.error("Message:", err.message);
    throw err;
  }
}

export async function askTutor(message, history = []) {
  try {
    const { data } = await aiClient.post("/chat", {
      message,
      history,
    });

    console.log("===== CHAT RESPONSE =====");
    console.log(data);

    return data?.reply ?? data?.message ?? data;
  } catch (err) {
    console.error("===== CHAT ERROR =====");
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    throw err;
  }
}

export async function generateQuizQuestions({
  topic,
  noteText,
  difficulty,
  numQuestions,
}) {
  try {
    const { data } = await aiClient.post("/quiz/generate", {
      topic,
      noteText,
      difficulty,
      numQuestions,
    });

    console.log("===== QUIZ RESPONSE =====");
    console.log(data);

    return data?.questions ?? data;
  } catch (err) {
    console.error("===== QUIZ ERROR =====");
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    console.error("Message:", err.message);
    throw err;
  }
}

export default aiClient;