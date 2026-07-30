import clsx from 'clsx';

export default function GlassPanel({ children, className, as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={clsx(
        'rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
