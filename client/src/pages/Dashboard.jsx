import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NotebookText, Brain, MessageSquare, Flame } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import StatsCard from '../components/dashboard/StatsCard';
import ActivityChart from '../components/dashboard/ActivityChart';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { getNotes } from '../services/noteService';
import { getQuizzes } from '../services/quizService';
import { getConversations } from '../services/chatService';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ notes: 0, quizzes: 0, avgScore: 0, chats: 0 });
  const [chartData, setChartData] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [notes, quizzes, conversations] = await Promise.all([
          getNotes().catch(() => []),
          getQuizzes().catch(() => []),
          getConversations().catch(() => []),
        ]);
        if (cancelled) return;

        const scored = quizzes.filter((q) => typeof q.score === 'number' && typeof q.total === 'number');
        const avgScore = scored.length
          ? Math.round((scored.reduce((acc, q) => acc + q.score / q.total, 0) / scored.length) * 100)
          : 0;

        setStats({
          notes: notes.length,
          quizzes: quizzes.length,
          avgScore,
          chats: conversations.length,
        });
        setRecentNotes(notes.slice(0, 4));

        const trend = scored
          .slice(-7)
          .map((q, i) => ({ label: `Q${i + 1}`, value: Math.round((q.score / q.total) * 100) }));
        setChartData(trend);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loader fullScreen label="Loading your dashboard..." />;

  return (
    <PageTransition className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-parchment sm:text-3xl">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-sm text-slate-400">Here's a snapshot of your studying so far.</p>
        </div>
        <Button to="/chat">Ask your tutor something</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard label="Notes uploaded" value={stats.notes} icon={NotebookText} accent="indigo" />
        <StatsCard label="Quizzes taken" value={stats.quizzes} icon={Brain} accent="brass" />
        <StatsCard label="Average score" value={stats.avgScore} suffix="%" icon={Flame} accent="emerald" />
        <StatsCard label="Tutor chats" value={stats.chats} icon={MessageSquare} accent="rose" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <ActivityChart data={chartData} title="Recent quiz performance" />
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-parchment">Recent notes</h2>
          <Button variant="ghost" size="sm" to="/notes">
            View all
          </Button>
        </div>
        {recentNotes.length === 0 ? (
          <Card hover={false}>
            <p className="text-sm text-slate-400">
              You haven't uploaded any notes yet.{' '}
              <Link to="/notes" className="text-amber-300 hover:text-amber-200">
                Upload your first one
              </Link>
              .
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentNotes.map((note) => (
              <Card key={note._id || note.id}>
                <p className="truncate text-sm font-medium text-slate-100">{note.title || note.filename}</p>
                <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{note.summary || 'Summary pending...'}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
