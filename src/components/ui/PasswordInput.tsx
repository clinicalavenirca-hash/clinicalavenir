'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = React.InputHTMLAttributes<HTMLInputElement> & { className?: string };

export function PasswordInput({ className, ...rest }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        autoComplete={rest.autoComplete ?? 'current-password'}
        className={cn('input pr-11', className)}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute inset-y-0 right-0 px-3 flex items-center text-ink-400 hover:text-ink-700"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
