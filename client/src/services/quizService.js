import api from './api';

export async function getQuizzes() {
  const { data } = await api.get('/quiz');
  return data?.quizzes ?? data ?? [];
}

export async function generateQuiz({ noteId, topic, difficulty, numQuestions }) {
  const { data } = await api.post('/quiz/generate', {
    noteId,
    topic,
    difficulty,
    numQuestions,
  });
  return data?.quiz ?? data;
}

export async function submitQuizAttempt(quizId, answers) {
  const { data } = await api.post(`/quiz/${quizId}/submit`, { answers });
  return data?.result ?? data;
}

export async function deleteQuiz(id) {
  const { data } = await api.delete(`/quiz/${id}`);
  return data;
}
