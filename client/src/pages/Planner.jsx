import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import PageTransition from '../components/layout/PageTransition';
import PlannerCalendar from '../components/planner/PlannerCalendar';
import ScheduleCard from '../components/planner/ScheduleCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import * as plannerService from '../services/plannerService';

export default function Planner() {
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', time: '', subject: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    plannerService
      .getTasks()
      .then((data) => !cancelled && setTasks(data))
      .catch(() => !cancelled && setError('Could not load your study plan.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const tasksForDay = tasks.filter((t) => t.date && isSameDay(new Date(t.date), selectedDate));
  const taskDates = tasks.map((t) => t.date).filter(Boolean);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const task = await plannerService.createTask({
        title: form.title.trim(),
        time: form.time,
        subject: form.subject,
        date: selectedDate.toISOString(),
        completed: false,
      });
      setTasks((prev) => [...prev, task]);
      setForm({ title: '', time: '', subject: '' });
      setShowForm(false);
    } catch {
      setError('Could not add that task. Please try again.');
    }
  };

  const handleToggle = async (id) => {
    const task = tasks.find((t) => (t._id || t.id) === id);
    if (!task) return;
    const updated = { ...task, completed: !task.completed };
    setTasks((prev) => prev.map((t) => ((t._id || t.id) === id ? updated : t)));
    try {
      await plannerService.updateTask(id, { completed: updated.completed });
    } catch {
      setTasks((prev) => prev.map((t) => ((t._id || t.id) === id ? task : t)));
    }
  };

  const handleDelete = async (id) => {
    const prev = tasks;
    setTasks((t) => t.filter((task) => (task._id || task.id) !== id));
    try {
      await plannerService.deleteTask(id);
    } catch {
      setTasks(prev);
      setError('Could not delete that task.');
    }
  };

  if (loading) return <Loader fullScreen label="Loading your planner..." />;

  return (
    <PageTransition className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-parchment sm:text-3xl">Study planner</h1>
        <p className="mt-1 text-sm text-slate-400">Plan your sessions and build a routine that sticks.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        <Card hover={false}>
          <PlannerCalendar
            month={month}
            onMonthChange={setMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            taskDates={taskDates}
          />
        </Card>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-parchment">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h2>
              <p className="text-xs text-slate-500">
                {tasksForDay.length} session{tasksForDay.length === 1 ? '' : 's'} planned
              </p>
            </div>
            <Button size="sm" icon={showForm ? X : Plus} onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Cancel' : 'Add session'}
            </Button>
          </div>

          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleAddTask}
              className="mb-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="What are you studying?"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-parchment outline-none placeholder:text-slate-500 focus:border-amber-400/60"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  placeholder="Time, e.g. 6:00 PM"
                  className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-parchment outline-none placeholder:text-slate-500 focus:border-amber-400/60"
                />
                <input
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Subject"
                  className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-parchment outline-none placeholder:text-slate-500 focus:border-amber-400/60"
                />
              </div>
              <Button type="submit" size="sm" className="w-full">
                Save session
              </Button>
            </motion.form>
          )}

          {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}

          <div className="space-y-2.5">
            {tasksForDay.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">Nothing planned for this day yet.</p>
            ) : (
              tasksForDay.map((task) => (
                <ScheduleCard key={task._id || task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
              ))
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
