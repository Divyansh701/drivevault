import React, { useState, useEffect } from 'react';
import { Modal, FormField, Button, Alert } from '@/components/ui';
import { vehicleService } from '@/services/vehicleService';
import type { Vehicle, CreateVehicleDto, UpdateVehicleDto } from '@/types';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicleToEdit?: Vehicle | null;
}

const CATEGORIES = [
  'SEDAN', 'SUV', 'TRUCK', 'HATCHBACK',
  'CONVERTIBLE', 'COUPE', 'VAN', 'MOTORCYCLE', 'SUPERCAR',
];

const POWERTRAINS = [
  'PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PHEV', 'HYDROGEN', 'OTHER',
];

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  vehicleToEdit = null,
}) => {
  const isEditing = Boolean(vehicleToEdit);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    category: 'SEDAN',
    powertrain: 'PETROL',
    price: '',
    quantity: 1,
    vin: '',
    color: '',
    mileage: 0,
    description: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  // Populate form data if editing an existing vehicle
  useEffect(() => {
    if (vehicleToEdit) {
      setFormData({
        make: vehicleToEdit.make || '',
        model: vehicleToEdit.model || '',
        year: vehicleToEdit.year || new Date().getFullYear(),
        category: vehicleToEdit.category || 'SEDAN',
        powertrain: vehicleToEdit.powertrain || 'PETROL',
        price: vehicleToEdit.price || '',
        quantity: vehicleToEdit.quantity ?? 1,
        vin: vehicleToEdit.vin || '',
        color: vehicleToEdit.color || '',
        mileage: vehicleToEdit.mileage ?? 0,
        description: vehicleToEdit.description || '',
        imageUrl: vehicleToEdit.imageUrls && vehicleToEdit.imageUrls.length > 0 ? vehicleToEdit.imageUrls[0] : '',
      });
    } else {
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        category: 'SEDAN',
        powertrain: 'PETROL',
        price: '',
        quantity: 1,
        vin: '',
        color: '',
        mileage: 0,
        description: '',
        imageUrl: '',
      });
    }
    setErrors({});
    setApiError(null);
  }, [vehicleToEdit, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.make.trim()) errs['make'] = 'Make is required';
    if (!formData.model.trim()) errs['model'] = 'Model is required';

    const yearNum = Number(formData.year);
    const maxYear = new Date().getFullYear() + 2;
    if (!yearNum || yearNum < 1886 || yearNum > maxYear) {
      errs['year'] = `Year must be between 1886 and ${maxYear}`;
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errs['price'] = 'Price must be a positive number (e.g. 25000.00)';
    }

    if (!isEditing && (formData.quantity === undefined || formData.quantity < 0)) {
      errs['quantity'] = 'Quantity cannot be negative';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      if (isEditing && vehicleToEdit) {
        const updatePayload: UpdateVehicleDto = {
          make: formData.make.trim(),
          model: formData.model.trim(),
          year: Number(formData.year),
          category: formData.category,
          powertrain: formData.powertrain,
          price: formData.price.toString(),
          quantity: Number(formData.quantity),
          vin: formData.vin.trim() || undefined,
          color: formData.color.trim() || undefined,
          mileage: Number(formData.mileage) || 0,
          description: formData.description.trim() || undefined,
          imageUrls: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
        };

        await vehicleService.update(vehicleToEdit.id, updatePayload);
      } else {
        const createPayload: CreateVehicleDto = {
          make: formData.make.trim(),
          model: formData.model.trim(),
          year: Number(formData.year),
          category: formData.category,
          powertrain: formData.powertrain,
          price: formData.price.toString(),
          quantity: Number(formData.quantity),
          vin: formData.vin.trim() || undefined,
          color: formData.color.trim() || undefined,
          mileage: Number(formData.mileage) || 0,
          description: formData.description.trim() || undefined,
          imageUrls: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
        };

        await vehicleService.create(createPayload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        `Failed to ${isEditing ? 'update' : 'create'} vehicle.`;
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Vehicle: ${vehicleToEdit?.make} ${vehicleToEdit?.model}` : 'Add New Vehicle'}
      subtitle={isEditing ? 'Update vehicle details and specifications' : 'Create a new vehicle record in the inventory'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <Alert type="error" onClose={() => setApiError(null)}>
            {apiError}
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Make *"
            error={errors['make']}
            placeholder="e.g. Tesla, BMW, Toyota"
            value={formData.make}
            onChange={(e) => handleChange('make', e.target.value)}
          />

          <FormField
            label="Model *"
            error={errors['model']}
            placeholder="e.g. Model 3, X5, Camry"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
          />

          <FormField
            label="Year *"
            type="number"
            error={errors['year']}
            placeholder="e.g. 2024"
            value={formData.year}
            onChange={(e) => handleChange('year', e.target.value)}
          />

          <FormField
            label="Price ($) *"
            type="text"
            error={errors['price']}
            placeholder="e.g. 45000.00"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
          />

          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-surface-400 block mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="input cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-surface-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-surface-400 block mb-1">
              Powertrain *
            </label>
            <select
              value={formData.powertrain}
              onChange={(e) => handleChange('powertrain', e.target.value)}
              className="input cursor-pointer"
            >
              {POWERTRAINS.map((p) => (
                <option key={p} value={p} className="bg-surface-900 text-white">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <FormField
            label="Quantity *"
            type="number"
            error={errors['quantity']}
            placeholder="Initial stock quantity"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
          />

          <FormField
            label="Mileage (miles)"
            type="number"
            placeholder="e.g. 15000"
            value={formData.mileage}
            onChange={(e) => handleChange('mileage', e.target.value)}
          />

          <FormField
            label="VIN"
            placeholder="Vehicle Identification Number"
            value={formData.vin}
            onChange={(e) => handleChange('vin', e.target.value)}
          />

          <FormField
            label="Color"
            placeholder="e.g. Metallic Silver"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
          />
        </div>

        <FormField
          label="Image URL"
          placeholder="https://example.com/vehicle-image.jpg"
          value={formData.imageUrl}
          onChange={(e) => handleChange('imageUrl', e.target.value)}
        />

        <div>
          <label className="text-[11px] font-medium uppercase tracking-wider text-surface-400 block mb-1">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Optional detailed notes or specifications..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="input resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {isEditing ? 'Update Vehicle' : 'Create Vehicle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VehicleFormModal;
