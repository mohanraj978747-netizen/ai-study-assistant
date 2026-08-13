import { motion } from 'framer-motion';
import { Sparkles, User, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

export default function ChatBubble({
  role = 'assistant',
  content = '',
  timestamp,
  sources = [],
}) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={clsx(
        'flex w-full gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-white/10 text-slate-200'
            : 'bg-gradient-to-br from-amber-500 to-indigo-500 text-white'
        )}
      >
        {isUser ? <User size={15} /> : <Sparkles size={15} />}
      </div>

      {/* Message content */}
      <div
        className={clsx(
          'flex max-w-[80%] flex-col gap-2',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Message bubble */}
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

        {/* Web Sources */}
        {!isUser && sources?.length > 0 && (
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                🔎 Sources
              </span>
            </div>

            <div className="space-y-2">
              {sources.map((source, index) => (
                <a
                  key={`${source.url}-${index}`}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 transition hover:border-amber-400/30 hover:bg-white/[0.06]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-200 group-hover:text-amber-300">
                      {source.title || 'Web source'}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                      {source.url}
                    </p>
                  </div>

                  <ExternalLink
                    size={14}
                    className="shrink-0 text-slate-500 group-hover:text-amber-300"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <span className="px-1 font-mono text-[11px] text-slate-500">
            {timestamp}
          </span>
        )}
      </div>
    </motion.div>
  );
}