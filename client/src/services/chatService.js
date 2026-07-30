import api from './api';

export async function getConversations() {
  const { data } = await api.get('/chat/conversations');
  return data?.conversations ?? data ?? [];
}

export async function createConversation(title = 'New chat') {
  const { data } = await api.post('/chat/conversations', { title });
  return data?.conversation ?? data;
}

export async function getMessages(conversationId) {
  const { data } = await api.get(`/chat/conversations/${conversationId}/messages`);
  return data?.messages ?? data ?? [];
}

// Expects the backend to persist the user's message and return the tutor's
// reply in one round trip, e.g. { message: { role: 'assistant', content, createdAt } }
export async function sendMessage(conversationId, content) {
  const { data } = await api.post(`/chat/conversations/${conversationId}/messages`, {
    content,
  });
  return data?.message ?? data;
}

export async function deleteConversation(conversationId) {
  const { data } = await api.delete(`/chat/conversations/${conversationId}`);
  return data;
}
