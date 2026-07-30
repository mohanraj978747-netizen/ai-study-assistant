import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import Loader from './Loader';

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-amber-500 to-indigo-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30',
  secondary:
    'bg-white/5 backdrop-blur-md border border-white/10 text-parchment hover:bg-white/10 hover:border-white/20',
  ghost: 'text-slate-300 hover:text-parchment hover:bg-white/5',
  danger: 'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20',
};

const SIZES = {
  sm: 'px-3.5 py-1.5 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-2xl',
  lg: 'px-7 py-3.5 text-base rounded-2xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  type = 'button',
  loading = false,
  disabled = false,
  icon: Icon,
  className,
  onClick,
  ...props
}) {
  const classes = clsx(
    'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
    VARIANTS[variant],
    SIZES[size],
    className
  );

  const content = (
    <>
      {loading ? <Loader size="sm" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </>
  );

  const motionProps = {
    whileHover: disabled ? {} : { scale: 1.02 },
    whileTap: disabled ? {} : { scale: 0.97 },
  };

  if (to) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link to={to} className={classes}>
          {content}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    const isExternal = /^https?:\/\//.test(href);
    return (
      <motion.a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noreferrer' : undefined}
        className={classes}
        {...motionProps}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...motionProps}
      {...props}
    >
      {content}
    </motion.button>
  );
}
