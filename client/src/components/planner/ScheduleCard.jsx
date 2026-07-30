import { motion } from 'framer-motion';
import { Clock, Trash2, CheckCircle2, Circle } from 'lucide-react';
import clsx from 'clsx';

export default function ScheduleCard({ task, onToggle, onDelete }) {
  const done = task.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
        done ? 'border-white/5 bg-white/[0.02] opacity-60' : 'border-white/10 bg-white/[0.04]'
      )}
    >
      <button onClick={() => onToggle(task._id || task.id)} className="shrink-0 text-amber-300">
        {done ? <CheckCircle2 size={20} /> : <Circle size={20} className="text-slate-500" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={clsx('truncate text-sm font-medium', done ? 'text-slate-500 line-through' : 'text-slate-100')}>
          {task.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2 font-mono text-xs text-slate-500">
          {task.time && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {task.time}
            </span>
          )}
          {task.subject && (
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 font-body text-indigo-300">{task.subject}</span>
          )}
        </div>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(task._id || task.id)}
          className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
          aria-label="Delete task"
        >
          <Trash2 size={14} />
        </button>
      )}
    </motion.div>
  );
}
