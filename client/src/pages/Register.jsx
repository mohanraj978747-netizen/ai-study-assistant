import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import AnimatedInput from '../components/ui/AnimatedInput';
import Button from '../components/ui/Button';
import ParticleBackground from '../three/ParticleBackground';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../utils/constants';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-void">
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden border-r border-white/10 lg:flex">
        <ParticleBackground density={350} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-950/30 via-void to-amber-950/20" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-sm px-10 text-center"
        >
          <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-amber-500 shadow-glow-indigo">
            <Sparkles size={26} className="text-white" />
          </span>
          <h2 className="font-display text-2xl font-semibold text-parchment">Join {APP_NAME} today</h2>
          <p className="mt-3 text-sm text-slate-400">
            Free to start. Your personal AI tutor is ready whenever you are.
          </p>
        </motion.div>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-16 sm:px-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-sm"
        >
          <Link to="/" className="mb-8 inline-flex items-center gap-2 font-display text-lg font-semibold text-parchment">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-indigo-500">
              <Sparkles size={16} className="text-white" />
            </span>
            {APP_NAME}
          </Link>

          <h1 className="font-display text-2xl font-semibold text-parchment">Create your account</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Already have one?{' '}
            <Link to="/login" className="font-medium text-amber-300 hover:text-amber-200">
              Log in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <AnimatedInput label="Full name" icon={User} value={form.name} onChange={update('name')} autoComplete="name" required />
            <AnimatedInput
              label="Email address"
              type="email"
              icon={Mail}
              value={form.email}
              onChange={update('email')}
              autoComplete="email"
              required
            />
            <AnimatedInput
              label="Password"
              type="password"
              icon={Lock}
              value={form.password}
              onChange={update('password')}
              autoComplete="new-password"
              required
            />
            <AnimatedInput
              label="Confirm password"
              type="password"
              icon={Lock}
              value={form.confirm}
              onChange={update('confirm')}
              autoComplete="new-password"
              required
            />

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-rose-400">
                {error}
              </motion.p>
            )}

            <Button type="submit" loading={loading} icon={ArrowRight} className="w-full">
              Create account
            </Button>
            <p className="text-center text-xs text-slate-500">
              By continuing you agree to study hard and be kind to future-you.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
