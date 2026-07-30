import { useEffect, useState } from 'react';
import Card from '../ui/Card';

function useCountUp(target = 0, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

const ACCENTS = {
  brass: 'from-amber-500/20 to-amber-500/0 text-amber-300',
  indigo: 'from-indigo-500/20 to-indigo-500/0 text-indigo-300',
  emerald: 'from-emerald-500/20 to-emerald-500/0 text-emerald-300',
  rose: 'from-rose-500/20 to-rose-500/0 text-rose-300',
};

export default function StatsCard({ label, value = 0, icon: Icon, accent = 'brass', suffix = '' }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  const display = typeof value === 'number' ? animated : value;
  const accentClasses = ACCENTS[accent] ?? ACCENTS.brass;

  return (
    <Card className="relative overflow-hidden">
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl ${accentClasses}`} />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-parchment">
            {display}
            {suffix}
          </p>
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ${accentClasses}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </Card>
  );
}
