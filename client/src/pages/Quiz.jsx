import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import QuizGenerator from '../components/quiz/QuizGenerator';
import QuizAttempt from '../components/quiz/QuizAttempt';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import * as quizService from '../services/quizService';
import * as noteService from '../services/noteService';

export default function Quiz() {
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([noteService.getNotes().catch(() => []), quizService.getQuizzes().catch(() => [])]).then(
      ([n, q]) => {
        if (cancelled) return;
        setNotes(n);
        setQuizzes(q);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenerate = async (params) => {
    setGenerating(true);
    setError('');
    try {
      const quiz = await quizService.generateQuiz(params);
      setQuizzes((prev) => [quiz, ...prev]);
      setActiveQuiz(quiz);
    } catch {
      setError('Could not generate a quiz right now. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (answers) => {
    const formatted = Object.entries(answers).map(([questionId, selectedIndex]) => ({
      questionId,
      selectedIndex,
    }));
    return quizService.submitQuizAttempt(activeQuiz._id || activeQuiz.id, formatted);
  };

  const handleDeleteQuiz = async (id) => {
    const prev = quizzes;
    setQuizzes((qs) => qs.filter((q) => (q._id || q.id) !== id));
    try {
      await quizService.deleteQuiz(id);
    } catch {
      setQuizzes(prev);
      setError('Could not delete that quiz.');
    }
  };

  if (loading) return <Loader fullScreen label="Preparing your quizzes..." />;

  return (
    <PageTransition className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {activeQuiz ? (
        <div>
          <button
            onClick={() => setActiveQuiz(null)}
            className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-parchment"
          >
            <ArrowLeft size={15} /> Back to quizzes
          </button>
          <Card hover={false}>
            <QuizAttempt quiz={activeQuiz} onSubmit={handleSubmit} onRetake={() => setActiveQuiz(null)} />
          </Card>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="font-display text-2xl font-semibold text-parchment sm:text-3xl">Quizzes</h1>
            <p className="mt-1 text-sm text-slate-400">
              Generate a fresh, AI-written quiz on any topic or one of your notes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
            <Card hover={false}>
              <h2 className="mb-4 font-display text-base font-semibold text-parchment">New quiz</h2>
              <QuizGenerator notes={notes} onGenerate={handleGenerate} generating={generating} />
              {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
            </Card>

            <div>
              <h2 className="mb-4 font-display text-base font-semibold text-parchment">Past quizzes</h2>
              {quizzes.length === 0 ? (
                <Card hover={false}>
                  <p className="text-sm text-slate-500">
                    You haven't taken a quiz yet. Generate one to get started.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((q) => (
                    <motion.div
                      key={q._id || q.id}
                      whileHover={{ x: 4 }}
                      className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left transition-colors hover:border-white/20"
                    >
                      <button onClick={() => setActiveQuiz(q)} className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-medium text-slate-100">
                          {q.topic || q.title || 'Untitled quiz'}
                        </p>
                        <p className="mt-0.5 font-mono text-xs capitalize text-slate-500">
                          {q.difficulty || 'medium'} · {q.questions?.length || 0} questions
                        </p>
                      </button>
                      <div className="flex shrink-0 items-center gap-2">
                        {typeof q.score === 'number' && (
                          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-medium text-amber-300">
                            {Math.round((q.score / q.total) * 100)}%
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuiz(q._id || q.id);
                          }}
                          className="rounded-lg p-1.5 text-slate-500 opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                          aria-label="Delete quiz"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </PageTransition>
  );
}
