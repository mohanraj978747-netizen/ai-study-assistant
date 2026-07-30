import api from './api';

export async function getNotes() {
  const { data } = await api.get('/notes');
  return data?.notes ?? data ?? [];
}

export async function getNoteById(id) {
  const { data } = await api.get(`/notes/${id}`);
  return data?.note ?? data;
}

export async function uploadNote(file, onProgress) {
  const formData = new FormData();
  formData.append('note', file);
  const { data } = await api.post('/notes/upload', formData, {
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
  return data?.note ?? data;
}

export async function deleteNote(id) {
  const { data } = await api.delete(`/notes/${id}`);
  return data;
}
