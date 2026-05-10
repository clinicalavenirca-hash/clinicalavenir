import { cn, initials } from '@/lib/utils';

const SIZE = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-xl'
} as const;

type Size = keyof typeof SIZE;

/**
 * Renders an uploaded image when `src` is provided, otherwise a deterministic
 * gradient + initials. We never reach for external avatar URLs.
 */
export function Avatar({
  name,
  src,
  size = 'md',
  className,
  ringClassName
}: {
  name: string;
  src?: string | null;
  size?: Size;
  className?: string;
  ringClassName?: string;
}) {
  const sizeCls = SIZE[size];
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover bg-ink-200', sizeCls, ringClassName, className)}
      />
    );
  }
  return (
    <span
      aria-label={name}
      className={cn(
        'rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-semibold flex-shrink-0 select-none',
        sizeCls,
        ringClassName,
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
