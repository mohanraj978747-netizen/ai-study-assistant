import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PlannerCalendar({ month, onMonthChange, selectedDate, onSelectDate, taskDates = [] }) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const hasTasks = (day) => taskDates.some((d) => isSameDay(new Date(d), day));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-parchment">{format(month, 'MMMM yyyy')}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMonthChange(subMonths(month, 1))}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-parchment"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => onMonthChange(addMonths(month, 1))}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-parchment"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-slate-500">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1.5">
            {d}
          </div>
        ))}
      </div>

      <motion.div
        key={format(month, 'yyyy-MM')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-7 gap-1"
      >
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl font-mono text-sm transition-colors ${
                selected
                  ? 'bg-gradient-to-br from-amber-500 to-indigo-500 text-white shadow-glow-sm'
                  : inMonth
                  ? 'text-slate-300 hover:bg-white/5'
                  : 'text-slate-700 hover:bg-white/[0.02]'
              } ${today && !selected ? 'ring-1 ring-indigo-400/60' : ''}`}
            >
              {format(day, 'd')}
              {hasTasks(day) && (
                <span
                  className={`absolute bottom-1.5 h-1 w-1 rounded-full ${
                    selected ? 'bg-white' : 'bg-amber-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
