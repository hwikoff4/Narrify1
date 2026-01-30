import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  onClose?: () => void;
  closable?: boolean;
}

export default function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  closable = false,
  className,
  ...props
}: AlertProps) {
  const variants = {
    success: {
      container: 'bg-success-50 border-success-200/50 text-success-800',
      icon: CheckCircle2,
      iconColor: 'text-success-500',
    },
    warning: {
      container: 'bg-warning-50 border-warning-200/50 text-warning-800',
      icon: AlertTriangle,
      iconColor: 'text-warning-500',
    },
    error: {
      container: 'bg-error-50 border-error-200/50 text-error-800',
      icon: XCircle,
      iconColor: 'text-error-500',
    },
    info: {
      container: 'bg-primary-50 border-primary-200/50 text-primary-800',
      icon: Info,
      iconColor: 'text-primary-500',
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'px-6 py-4 rounded-xl border shadow-glass animate-fade-down',
        config.container,
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title && <h3 className="font-bold mb-1">{title}</h3>}
          <div className="text-sm font-medium">{children}</div>
        </div>
        {closable && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 p-1 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Close alert"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
