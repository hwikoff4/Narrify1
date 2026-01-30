import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export default function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white',
    success: 'bg-gradient-to-r from-success-500 to-success-600 text-white',
    warning: 'bg-gradient-to-r from-warning-500 to-warning-600 text-white',
    error: 'bg-gradient-to-r from-error-500 to-error-600 text-white',
    info: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    neutral: 'bg-neutral-200 text-neutral-700',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg font-bold shadow-sm',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
      )}
      {children}
    </span>
  );
}
