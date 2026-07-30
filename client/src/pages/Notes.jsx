import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import NoteUpload from '../components/notes/NoteUpload';
import NoteSummary from '../components/notes/NoteSummary';
import Loader from '../components/ui/Loader';
import { useFetch } from '../hooks/useFetch';
import * as noteService from '../services/noteService';

export default function Notes() {
  const { data, loading, error: loadError, setData: setNotes } = useFetch(() => noteService.getNotes(), []);
  const notes = data || [];
  const [error, setError] = useState('');

  const handleUpload = async (file, onProgress) => {
    // No try/catch here on purpose: NoteUpload owns its own inline error UX
    // right at the dropzone, so we let failures propagate back to it.
    const note = await noteService.uploadNote(file, onProgress);
    setNotes((prev) => [note, ...(prev || [])]);
  };

  const handleDelete = async (id) => {
    const prevNotes = notes;
    setNotes((n) => (n || []).filter((note) => (note._id || note.id) !== id));
    try {
      await noteService.deleteNote(id);
    } catch {
      setNotes(prevNotes);
      setError('Could not delete that note.');
    }
  };

  return (
    <PageTransition className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-parchment sm:text-3xl">Your notes</h1>
        <p className="mt-1 text-sm text-slate-400">
          Upload notes to get instant AI summaries. They're saved here for good.
        </p>
      </div>

      <div className="mb-8">
        <NoteUpload onUpload={handleUpload} />
      </div>

      {(loadError || error) && (
        <p className="mb-4 text-sm text-rose-400">{error || 'Could not load your notes.'}</p>
      )}

      {loading ? (
        <Loader label="Loading your notes..." />
      ) : notes.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">
          No notes yet. Upload your first file above to get an AI summary.
        </p>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {notes.map((note) => (
              <NoteSummary key={note._id || note.id} note={note} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </PageTransition>
  );
}
