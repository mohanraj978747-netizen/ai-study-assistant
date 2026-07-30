import { motion } from 'framer-motion';
import {
  MessageSquare,
  NotebookText,
  Brain,
  CalendarDays,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import GlassPanel from '../components/ui/GlassPanel';
import HeroScene from '../three/HeroScene';
import { staggerContainer, staggerItem } from '../animations/stagger';
import { fadeIn } from '../animations/fadeIn';
import { APP_NAME } from '../utils/constants';

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Ask anything, anytime',
    desc: 'Chat with your AI tutor about any subject, not just what you upload. Get real explanations, not canned answers.',
  },
  {
    icon: NotebookText,
    title: 'Smart note summaries',
    desc: 'Upload your notes and instantly get clear, structured summaries you can revisit before exams.',
  },
  {
    icon: Brain,
    title: 'AI-generated quizzes',
    desc: 'Every quiz is freshly written by AI based on your topic or notes, never the same repeated set.',
  },
  {
    icon: CalendarDays,
    title: 'Personal study planner',
    desc: 'Organize sessions on a visual calendar and build a routine that actually sticks.',
  },
];

const STEPS = [
  { title: 'Create your account', desc: 'Sign up in seconds with a secure, encrypted login.' },
  { title: 'Upload notes, or just ask', desc: 'Bring your own material, or start chatting about any topic.' },
  { title: 'Study smarter', desc: 'Get summaries, quizzes and a plan tailored to how you learn.' },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-void">
      <Navbar />

      {/* Hero: full-bleed constellation, centered thesis statement */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <HeroScene className="absolute inset-0 -z-20 opacity-70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-void/30 via-void/70 to-void" />
        <div className="absolute inset-0 -z-10 bg-grid-glow" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer(0.12)}
          className="mx-auto max-w-3xl px-6 text-center"
        >
          <motion.div variants={staggerItem}>
            <GlassPanel className="mx-auto mb-6 inline-flex items-center gap-2 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300">
              <Sparkles size={12} />
              AI Personal Tutor
            </GlassPanel>
          </motion.div>
          <motion.h1
            variants={staggerItem}
            className="font-display text-4xl font-semibold leading-[1.1] text-parchment sm:text-5xl lg:text-6xl"
          >
            Ask anything.
            <br />
            Remember <em className="italic text-amber-300">everything.</em>
          </motion.h1>
          <motion.p variants={staggerItem} className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
            {APP_NAME} turns your notes into clear summaries, answers any question, not just
            what you've uploaded, and keeps every conversation exactly where you left it.
          </motion.p>
          <motion.div variants={staggerItem} className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" to="/register" icon={ArrowRight}>
              Start studying free
            </Button>
            <Button size="lg" variant="secondary" href="#features">
              See how it works
            </Button>
          </motion.div>
          <motion.div variants={staggerItem} className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-emerald-400" /> Secure JWT login
            </span>
            <span className="flex items-center gap-1.5">
              <Zap size={15} className="text-amber-400" /> Instant AI answers
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeIn}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-semibold text-parchment sm:text-4xl">
            Everything you need to actually learn
          </h2>
          <p className="mt-4 text-slate-400">
            Built for students who want a study partner, not just another note-taking app.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer(0.1)}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={staggerItem}>
              <Card className="h-full">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                  <Icon size={20} />
                </div>
                <h3 className="mb-2 font-display text-base font-semibold text-parchment">{title}</h3>
                <p className="text-sm text-slate-400">{desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative mx-auto max-w-5xl px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeIn}
          className="mb-14 text-center"
        >
          <h2 className="font-display text-3xl font-semibold text-parchment sm:text-4xl">How it works</h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer(0.15)}
          className="grid grid-cols-1 gap-8 sm:grid-cols-3"
        >
          {STEPS.map((step, i) => (
            <motion.div key={step.title} variants={staggerItem} className="relative text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 font-mono text-lg font-semibold text-amber-300">
                {i + 1}
              </div>
              <h3 className="mb-2 font-medium text-parchment">{step.title}</h3>
              <p className="text-sm text-slate-400">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-5xl px-6 pb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-600/15 via-void to-indigo-600/15 px-8 py-16 text-center"
        >
          <h2 className="font-display text-3xl font-semibold text-parchment sm:text-4xl">
            Ready to change how you study?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-slate-400">
            Create your free account and start chatting with your AI tutor in under a minute.
          </p>
          <div className="mt-8">
            <Button size="lg" to="/register" icon={ArrowRight}>
              Get started, it's free
            </Button>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {APP_NAME}. Built for students, by a student.
      </footer>
    </div>
  );
}
