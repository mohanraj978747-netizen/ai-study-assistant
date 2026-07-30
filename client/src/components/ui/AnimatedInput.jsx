import { useId, useState } from 'react';
import clsx from 'clsx';

export default function AnimatedInput({
  label,
  type = 'text',
  value,
  onChange,
  icon: Icon,
  error,
  required = false,
  autoComplete,
  name,
  ...props
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && value !== '';

  return (
    <div className="w-full">
      <div
        className={clsx(
          'relative rounded-2xl border bg-white/5 transition-colors duration-200',
          error
            ? 'border-rose-500/60'
            : focused
            ? 'border-amber-400/70 shadow-glow-sm'
            : 'border-white/10 hover:border-white/20'
        )}
      >
        {Icon && (
          <Icon
            size={18}
            className={clsx(
              'absolute left-4 top-1/2 -translate-y-1/2 transition-colors',
              focused ? 'text-amber-300' : 'text-slate-500'
            )}
          />
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={clsx(
            'w-full bg-transparent rounded-2xl py-4 pb-2 text-parchment outline-none',
            Icon ? 'pl-11 pr-4' : 'px-4'
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={clsx(
            'pointer-events-none absolute transition-all duration-200',
            Icon ? 'left-11' : 'left-4',
            focused || hasValue
              ? 'top-2 text-[11px] text-amber-300'
              : 'top-1/2 -translate-y-1/2 text-sm text-slate-400'
          )}
        >
          {label}
        </label>
      </div>
      {error && <p className="mt-1.5 pl-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
