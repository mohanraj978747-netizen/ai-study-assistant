// Note: this file was not in the original folder structure but is added
// here because the Planner page needs it to talk to plannerController /
// plannerRoutes on the backend.
import api from './api';

export async function getTasks() {
  const { data } = await api.get('/planner');
  return data?.tasks ?? data ?? [];
}

export async function createTask(task) {
  const { data } = await api.post('/planner', task);
  return data?.task ?? data;
}

export async function updateTask(id, updates) {
  const { data } = await api.put(`/planner/${id}`, updates);
  return data?.task ?? data;
}

export async function deleteTask(id) {
  const { data } = await api.delete(`/planner/${id}`);
  return data;
}
