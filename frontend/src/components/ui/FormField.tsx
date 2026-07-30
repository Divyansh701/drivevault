import type { InputHTMLAttributes, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FormField({
  id,
  label,
  error,
  hint,
  leftIcon,
  rightElement,
  className = '',
  ...inputProps
}: FormFieldProps) {
  const inputId = id || `field-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <label htmlFor={inputId} className="text-sm font-medium text-surface-300">
        {label}
        {inputProps.required && (
          <span className="ml-1 text-red-400" aria-hidden="true">*</span>
        )}
      </label>

      {/* Input wrapper */}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-surface-500">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={Boolean(error)}
          className={[
            'input',
            leftIcon  ? 'pl-10'  : '',
            rightElement ? 'pr-12' : '',
            error ? 'border-red-500/60 focus:ring-red-500' : '',
            className,
          ].join(' ')}
          {...inputProps}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-red-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Hint */}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-xs text-surface-500">{hint}</p>
      )}
    </div>
  );
}
