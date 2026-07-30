import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Card({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={clsx(
        'rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 shadow-lg shadow-black/20',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
