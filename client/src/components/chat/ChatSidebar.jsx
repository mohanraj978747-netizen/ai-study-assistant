import { motion } from 'framer-motion';
import { Plus, MessageCircle, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export default function ChatSidebar({
  conversations = [],
  activeId,
  onSelect,
  onCreate,
  onDelete,
  className = '',
}) {
  return (
    <div className={clsx('flex h-full flex-col', className)}>
      <div className="p-3">
        <button
          onClick={onCreate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-glow-sm transition-transform hover:scale-[1.01]"
        >
          <Plus size={16} />
          New chat
        </button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {conversations.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-slate-500">
            No conversations yet. Start one to begin studying with your tutor.
          </p>
        )}
        {conversations.map((conv) => (
          <motion.div
            key={conv._id || conv.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={clsx(
              'group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors',
              (conv._id || conv.id) === activeId
                ? 'bg-amber-500/15 text-parchment'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            )}
            onClick={() => onSelect(conv._id || conv.id)}
          >
            <MessageCircle size={15} className="shrink-0" />
            <span className="flex-1 truncate">{conv.title || 'New chat'}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conv._id || conv.id);
              }}
              className="shrink-0 rounded-lg p-1 text-slate-500 opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
              aria-label="Delete conversation"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
