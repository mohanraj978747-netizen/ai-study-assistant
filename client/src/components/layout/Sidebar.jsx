import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  NotebookText,
  Brain,
  CalendarDays,
  Sparkles,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { APP_NAME } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Tutor Chat', path: '/chat', icon: MessageSquare },
  { label: 'Notes', path: '/notes', icon: NotebookText },
  { label: 'Quizzes', path: '/quiz', icon: Brain },
  { label: 'Planner', path: '/planner', icon: CalendarDays },
];

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1.5 px-3">
      {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-amber-500/15 text-parchment shadow-glow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={18} className={isActive ? 'text-amber-300' : 'text-slate-500 group-hover:text-slate-300'} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-void/60 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-2 px-6 py-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-indigo-500 shadow-glow-sm">
            <Sparkles size={18} className="text-white" />
          </span>
          <span className="font-display text-lg font-semibold text-parchment">{APP_NAME}</span>
        </div>

        <NavLinks />

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/40 to-indigo-500/40 text-sm font-semibold text-white">
              {(user?.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-100">{user?.name || 'Student'}</p>
              <p className="truncate text-xs text-slate-500">{user?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-rose-400"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-void/80 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-indigo-500">
            <Sparkles size={16} className="text-white" />
          </span>
          <span className="font-display text-base font-semibold text-parchment">{APP_NAME}</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-slate-300 hover:bg-white/5"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-void lg:hidden"
            >
              <div className="flex items-center justify-between px-5 py-5">
                <span className="font-display text-lg font-semibold text-parchment">{APP_NAME}</span>
                <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5">
                  <X size={20} />
                </button>
              </div>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
              <div className="border-t border-white/10 p-4">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-white/10 bg-void/90 px-2 backdrop-blur-xl lg:hidden">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-amber-300' : 'text-slate-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]' : ''} />
                {label.split(' ')[0]}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
