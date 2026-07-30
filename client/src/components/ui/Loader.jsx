import { motion } from 'framer-motion';

const SIZE_MAP = { sm: 14, md: 24, lg: 40 };

export default function Loader({ size = 'md', fullScreen = false, label }) {
  const px = SIZE_MAP[size] ?? SIZE_MAP.md;

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        style={{ width: px, height: px }}
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-amber-400 border-r-indigo-400 border-b-transparent border-l-transparent" />
      </motion.div>
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="flex min-h-screen w-full items-center justify-center">{spinner}</div>;
  }

  return spinner;
}
