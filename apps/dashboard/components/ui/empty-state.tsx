import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import Button from './button';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center animate-fade-up',
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center mb-6 shadow-lg">
          <Icon className="w-8 h-8 text-neutral-400" aria-hidden="true" />
        </div>
      )}

      <h3 className="text-2xl font-display font-bold text-neutral-900 mb-3">
        {title}
      </h3>

      <p className="text-neutral-600 max-w-md mb-8 leading-relaxed">
        {description}
      </p>

      {action && (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={action.onClick}
            leftIcon={action.icon}
          >
            {action.label}
          </Button>

          {secondaryAction && (
            <Button
              variant="ghost"
              size="lg"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
