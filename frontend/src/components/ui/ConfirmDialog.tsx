import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const getButtonVariant = () => {
    if (variant === 'danger') return 'danger';
    return 'primary';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              variant === 'danger'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-sm text-surface-300 leading-relaxed pt-1">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-xs">
            {cancelText}
          </Button>
          <Button
            variant={getButtonVariant()}
            onClick={handleConfirm}
            isLoading={isLoading}
            className="text-xs"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
