import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'icon' | 'demo-lifter' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-display font-bold tracking-tight rounded-pill transition-all duration-fast select-none cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  let sizeStyles = 'px-7 py-3.5 text-sm';
  if (size === 'sm') sizeStyles = 'px-4 py-2 text-xs min-h-[40px]';
  if (size === 'lg') sizeStyles = 'px-8 py-4 text-base min-h-[52px]';
  if (variant === 'icon') sizeStyles = 'p-2.5 w-11 h-11 min-h-[44px] min-w-[44px] rounded-full';

  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles =
        'bg-accent text-on-accent shadow-[0_4px_20px_var(--accent-glow)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_var(--accent-glow)] active:translate-y-0';
      break;
    case 'ghost':
      variantStyles =
        'bg-transparent border border-border text-text hover:border-accent hover:text-accent hover:bg-accent/5 active:bg-accent/10';
      break;
    case 'secondary':
      variantStyles =
        'bg-surface-card border border-border text-text hover:bg-surface-hover hover:border-border-strong active:scale-[0.98]';
      break;
    case 'demo-lifter':
      variantStyles =
        'bg-accent/10 border-2 border-accent text-text animate-pulse-glow hover:bg-accent hover:text-on-accent hover:shadow-[0_0_24px_var(--accent-glow)]';
      break;
    case 'danger':
      variantStyles =
        'bg-danger/15 border border-danger/40 text-danger hover:bg-danger hover:text-white';
      break;
    case 'icon':
      variantStyles =
        'bg-surface-card border border-border text-text hover:border-accent hover:text-accent hover:bg-surface-hover';
      break;
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {icon && <span className="inline-flex shrink-0">{icon}</span>}
          {children}
        </span>
      )}
    </button>
  );
};
