import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, Trash2 } from 'lucide-react';
import Card from '../ui/Card';

export default function NoteSummary({ note, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const createdAt = note.createdAt ? new Date(note.createdAt).toLocaleDateString() : '';

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
          <FileText size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="truncate font-medium text-slate-100">{note.title || note.filename || 'Untitled note'}</h4>
            {onDelete && (
              <button
                onClick={() => onDelete(note._id || note.id)}
                className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
                aria-label="Delete note"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          {createdAt && <p className="font-mono text-xs text-slate-500">{createdAt}</p>}

          <p className={`mt-2 text-sm text-slate-400 ${expanded ? '' : 'line-clamp-3'}`}>
            {note.summary || 'Summary will appear here once processing is complete.'}
          </p>

          {note.summary && note.summary.length > 160 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-300 hover:text-amber-200"
            >
              {expanded ? 'Show less' : 'Read full summary'}
              <motion.span animate={{ rotate: expanded ? 180 : 0 }}>
                <ChevronDown size={13} />
              </motion.span>
            </button>
          )}

          <AnimatePresence>
            {expanded && note.content && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-400">
                  {note.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}
