import type { ReactNode } from 'react';

interface AlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  onClose?: () => void;
  className?: string;
}

const CONFIG = {
  error:   { bg: 'bg-red-500/10',     border: 'border-red-500/25',   text: 'text-red-400',    icon: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z' },
  success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z' },
  warning: { bg: 'bg-amber-500/10',   border: 'border-amber-500/25',  text: 'text-amber-400',  icon: 'M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z' },
  info:    { bg: 'bg-brand-500/10',   border: 'border-brand-500/25',  text: 'text-brand-400',  icon: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z' },
};

export function Alert({ type, title, children, onDismiss, onClose, className = '' }: AlertProps) {
  const { bg, border, text, icon } = CONFIG[type];
  const handleDismiss = onDismiss || onClose;

  return (
    <div
      role="alert"
      className={`flex gap-3 rounded-xl border p-4 text-sm ${bg} ${border} ${text} animate-in ${className}`}
    >
      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d={icon} clipRule="evenodd" />
      </svg>
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p className="leading-relaxed">{children}</p>
      </div>
      {handleDismiss && (
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="opacity-60 hover:opacity-100 transition-opacity self-start"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
