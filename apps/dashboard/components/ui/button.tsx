import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

    const variants = {
      primary:
        'bg-gradient-primary text-white shadow-lg hover:shadow-glow-lg hover:scale-[1.02] focus:ring-primary-500 active:scale-[0.98]',
      secondary:
        'bg-white border-2 border-neutral-300 text-neutral-900 shadow-sm hover:shadow-md hover:border-primary-500 focus:ring-primary-500 active:scale-[0.98]',
      ghost:
        'bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500 active:scale-[0.98]',
      danger:
        'bg-gradient-to-r from-error-500 to-error-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] focus:ring-error-500 active:scale-[0.98]',
      success:
        'bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] focus:ring-success-500 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
