import { motion } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';
import clsx from 'clsx';

export default function ChatBubble({ role = 'assistant', content = '', timestamp }) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={clsx('flex w-full gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={clsx(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-white/10 text-slate-200' : 'bg-gradient-to-br from-amber-500 to-indigo-500 text-white'
        )}
      >
        {isUser ? <User size={15} /> : <Sparkles size={15} />}
      </div>
      <div className={clsx('flex max-w-[80%] flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        <div
          className={clsx(
            'whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'rounded-tr-sm bg-gradient-to-r from-amber-500 to-indigo-500 text-white'
              : 'rounded-tl-sm border border-white/10 bg-white/[0.04] text-slate-100'
          )}
        >
          {content}
        </div>
        {timestamp && <span className="px-1 font-mono text-[11px] text-slate-500">{timestamp}</span>}
      </div>
    </motion.div>
  );
}
