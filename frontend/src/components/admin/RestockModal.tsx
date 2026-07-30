import React, { useState, useEffect } from 'react';
import { Modal, FormField, Button, Alert } from '@/components/ui';
import { vehicleService } from '@/services/vehicleService';
import type { Vehicle } from '@/types';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle: Vehicle | null;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  vehicle,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setError(null);
    setApiError(null);
  }, [isOpen, vehicle]);

  if (!vehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setError(null);

    const qty = Number(quantity);
    if (isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
      setError('Restock quantity must be a positive whole number (at least 1)');
      return;
    }

    setLoading(true);

    try {
      await vehicleService.restock(vehicle.id, { quantity: qty });
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to restock vehicle.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Restock: ${vehicle.make} ${vehicle.model} (${vehicle.year})`}
      subtitle="Increase inventory count for this vehicle"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <Alert type="error" onClose={() => setApiError(null)}>
            {apiError}
          </Alert>
        )}

        <div className="p-4 bg-surface-950/60 rounded-xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-surface-400">Current Stock:</span>
            <span className="font-bold text-white text-sm">{vehicle.quantity} units</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-surface-400">Status:</span>
            <span
              className={`font-semibold uppercase tracking-wider ${
                vehicle.quantity > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {vehicle.quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        <FormField
          label="Quantity to Add *"
          type="number"
          min="1"
          error={error || undefined}
          placeholder="e.g. 5"
          value={quantity}
          onChange={(e) => {
            setQuantity(Number(e.target.value));
            if (error) setError(null);
          }}
          hint="Enter the number of units to add to the existing stock."
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Add to Inventory
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RestockModal;
