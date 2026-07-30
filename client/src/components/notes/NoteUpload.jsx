import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import { ACCEPTED_NOTE_TYPES, MAX_UPLOAD_SIZE_MB } from '../../utils/constants';

export default function NoteUpload({ onUpload }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFiles = useCallback(
    async (files) => {
      const file = files?.[0];
      if (!file) return;
      setError('');

      if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
        setError(`File is too large. Max size is ${MAX_UPLOAD_SIZE_MB}MB.`);
        return;
      }

      setUploading(true);
      setProgress(0);
      try {
        await onUpload(file, setProgress);
      } catch (err) {
        setError(err?.response?.data?.message || 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
        setProgress(0);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [onUpload]
  );

  return (
    <div>
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        animate={{ scale: dragging ? 1.01 : 1 }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragging ? 'border-amber-400 bg-amber-500/5' : 'border-white/15 hover:border-white/25'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_NOTE_TYPES.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <>
            <Loader2 size={28} className="animate-spin text-amber-300" />
            <p className="text-sm text-slate-300">Uploading &amp; summarizing... {progress}%</p>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-300">
              <UploadCloud size={26} />
            </div>
            <p className="text-sm font-medium text-slate-200">
              Drag &amp; drop a file, or click to browse
            </p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <FileText size={13} />
              {ACCEPTED_NOTE_TYPES.join(', ')} · up to {MAX_UPLOAD_SIZE_MB}MB
            </p>
          </>
        )}
      </motion.div>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
    </div>
  );
}
