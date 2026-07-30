import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  isLoading = false,
  leftIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === 'primary' ? 'btn-primary' :
    variant === 'ghost'   ? 'btn-ghost'   :
                            'btn-danger';

  return (
    <button
      disabled={disabled || isLoading}
      className={[variantClass, fullWidth ? 'w-full' : '', className].join(' ')}
      {...props}
    >
      {isLoading ? (
        <span className="spinner" aria-hidden="true" />
      ) : leftIcon ? (
        <span aria-hidden="true">{leftIcon}</span>
      ) : null}
      {children}
    </button>
  );
}
