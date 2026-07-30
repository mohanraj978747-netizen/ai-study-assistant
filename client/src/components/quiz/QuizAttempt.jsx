import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';
import GlassPanel from '../ui/GlassPanel';

export default function QuizAttempt({ quiz, onSubmit, onRetake }) {
  const questions = quiz?.questions || [];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const current = questions[index];
  const progress = questions.length ? ((index + 1) / questions.length) * 100 : 0;
  const allAnswered = useMemo(
    () => questions.length > 0 && questions.every((q) => answers[q._id || q.id] !== undefined),
    [answers, questions]
  );

  const selectAnswer = (choiceIndex) => {
    setAnswers((prev) => ({ ...prev, [current._id || current.id]: choiceIndex }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await onSubmit(answers);
      setResult(
        res || {
          score: questions.reduce(
            (acc, q) => acc + (answers[q._id || q.id] === q.correctIndex ? 1 : 0),
            0
          ),
          total: questions.length,
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!current && !result) {
    return <p className="text-sm text-slate-500">This quiz has no questions yet.</p>;
  }

  if (result) {
    const pct = Math.round((result.score / (result.total || questions.length)) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 py-8 text-center"
      >
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-indigo-500/20">
          <span className="font-mono text-3xl font-bold text-parchment">{pct}%</span>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-parchment">
            {pct >= 80 ? 'Excellent work!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!'}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            You scored {result.score} out of {result.total || questions.length}
          </p>
        </div>
        <div className="w-full max-w-md space-y-2 text-left">
          {questions.map((q, i) => {
            const userAnswer = answers[q._id || q.id];
            const correct = userAnswer === q.correctIndex;
            return (
              <GlassPanel key={q._id || q.id || i} className="flex items-start gap-2 p-3 text-sm">
                {correct ? (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
                )}
                <span className="text-slate-300">{q.question}</span>
              </GlassPanel>
            );
          })}
        </div>
        {onRetake && (
          <Button variant="secondary" icon={RotateCcw} onClick={onRetake}>
            Try another quiz
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between font-mono text-xs text-slate-500">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span className="capitalize">{quiz.difficulty || 'medium'}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-indigo-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <h3 className="mb-5 font-display text-lg font-medium text-parchment">{current.question}</h3>
          <div className="space-y-2.5">
            {current.options?.map((option, i) => {
              const selected = answers[current._id || current.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    selected
                      ? 'border-amber-400/70 bg-amber-500/10 text-parchment'
                      : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] ${
                      selected ? 'border-amber-400 bg-amber-500 text-white' : 'border-white/20 text-slate-500'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Back
        </Button>
        {index < questions.length - 1 ? (
          <Button
            icon={ArrowRight}
            disabled={answers[current._id || current.id] === undefined}
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
          >
            Next
          </Button>
        ) : (
          <Button loading={submitting} disabled={!allAnswered} onClick={handleSubmit}>
            Submit quiz
          </Button>
        )}
      </div>
    </div>
  );
}
