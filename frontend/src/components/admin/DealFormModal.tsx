import React, { useState, useEffect } from 'react';
import { Modal, FormField, Button, Alert } from '@/components/ui';
import { dealService } from '@/services';
import { vehicleService } from '@/services/vehicleService';
import type { Deal, CreateDealDto, UpdateDealDto, Vehicle } from '@/types';

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dealToEdit?: Deal | null;
}

const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED'] as const;

export const DealFormModal: React.FC<DealFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  dealToEdit = null,
}) => {
  const isEditing = Boolean(dealToEdit);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vehicleId: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: 0,
    originalPrice: 0,
    offerPrice: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isFeatured: false,
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  // Load vehicles for the dropdown
  useEffect(() => {
    if (isOpen) {
      vehicleService.getAll({ limit: 100, sortBy: 'createdAt', sortOrder: 'desc' })
        .then((res) => setVehicles(res.vehicles))
        .catch(() => { /* silent — dropdown will just be empty */ });
    }
  }, [isOpen]);

  // Populate form data if editing an existing deal
  useEffect(() => {
    if (dealToEdit) {
      setFormData({
        title: dealToEdit.title,
        description: dealToEdit.description || '',
        vehicleId: dealToEdit.vehicleId || '',
        discountType: dealToEdit.discountType,
        discountValue: dealToEdit.discountValue,
        originalPrice: dealToEdit.originalPrice,
        offerPrice: dealToEdit.offerPrice,
        startDate: new Date(dealToEdit.startDate).toISOString().split('T')[0],
        endDate: new Date(dealToEdit.endDate).toISOString().split('T')[0],
        isFeatured: dealToEdit.isFeatured,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        vehicleId: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        originalPrice: 0,
        offerPrice: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isFeatured: false,
      });
    }
    setErrors({});
    setApiError(null);
  }, [dealToEdit, isOpen]);

  // Auto-populate vehicle info when a vehicle is selected
  useEffect(() => {
    if (formData.vehicleId && !isEditing) {
      const selected = vehicles.find((v) => v.id === formData.vehicleId);
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          originalPrice: Number(selected.price),
        }));
      }
    }
  }, [formData.vehicleId, vehicles, isEditing]);

  // Auto-calculate offer price
  useEffect(() => {
    if (formData.originalPrice > 0 && formData.discountValue > 0) {
      let offerPrice: number;
      if (formData.discountType === 'PERCENTAGE') {
        offerPrice = formData.originalPrice * (1 - formData.discountValue / 100);
      } else {
        offerPrice = formData.originalPrice - formData.discountValue;
      }
      setFormData((prev) => ({
        ...prev,
        offerPrice: Math.max(0, Math.round(offerPrice * 100) / 100),
      }));
    }
  }, [formData.discountType, formData.discountValue, formData.originalPrice]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    if (formData.originalPrice <= 0) e.originalPrice = 'Original price must be positive';
    if (formData.offerPrice <= 0) e.offerPrice = 'Offer price must be positive';
    if (formData.offerPrice > formData.originalPrice) e.offerPrice = 'Offer price cannot exceed original price';
    if (formData.discountValue <= 0) e.discountValue = 'Discount value must be positive';
    if (formData.discountType === 'PERCENTAGE' && formData.discountValue > 100) e.discountValue = 'Percentage cannot exceed 100';
    if (!formData.startDate) e.startDate = 'Start date is required';
    if (!formData.endDate) e.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) e.endDate = 'End date must be after start date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);

    try {
      const payload: CreateDealDto = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        vehicleId: formData.vehicleId || undefined,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        originalPrice: formData.originalPrice,
        offerPrice: formData.offerPrice,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isFeatured: formData.isFeatured,
      };

      if (isEditing && dealToEdit) {
        await dealService.update(dealToEdit.id, payload as UpdateDealDto);
      } else {
        await dealService.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setApiError(err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(8,12,24,0.8)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  };

  const set = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Deal' : 'Create New Deal'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {apiError && <Alert type="error" onClose={() => setApiError(null)}>{apiError}</Alert>}

        {/* Title */}
        <div>
          <label style={labelStyle}>Deal Title</label>
          <input style={{ ...fieldStyle, borderColor: errors.title ? 'rgba(239,68,68,0.6)' : undefined }}
            value={formData.title} onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Summer Sale — 20% Off All SUVs" />
          {errors.title && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description (Optional)</label>
          <textarea style={{ ...fieldStyle, minHeight: 60, resize: 'vertical' }}
            value={formData.description} onChange={(e) => set('description', e.target.value)}
            placeholder="Deal description..." />
        </div>

        {/* Vehicle Selection */}
        <div>
          <label style={labelStyle}>Link to Vehicle (Optional)</label>
          <select style={{ ...fieldStyle, cursor: 'pointer' }}
            value={formData.vehicleId} onChange={(e) => set('vehicleId', e.target.value)}>
            <option value="">— Generic Deal (No Vehicle) —</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.year} {v.make} {v.model} — ${Number(v.price).toLocaleString()}</option>
            ))}
          </select>
        </div>

        {/* Pricing Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Original Price</label>
            <input type="number" style={{ ...fieldStyle, borderColor: errors.originalPrice ? 'rgba(239,68,68,0.6)' : undefined }}
              value={formData.originalPrice || ''} onChange={(e) => set('originalPrice', Number(e.target.value))} />
            {errors.originalPrice && <p style={{ color: '#ef4444', fontSize: 10, marginTop: 4 }}>{errors.originalPrice}</p>}
          </div>
          <div>
            <label style={labelStyle}>Discount</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <select style={{ ...fieldStyle, width: 90 }}
                value={formData.discountType} onChange={(e) => set('discountType', e.target.value)}>
                {DISCOUNT_TYPES.map((t) => <option key={t} value={t}>{t === 'PERCENTAGE' ? '%' : '$'}</option>)}
              </select>
              <input type="number" style={{ ...fieldStyle, borderColor: errors.discountValue ? 'rgba(239,68,68,0.6)' : undefined }}
                value={formData.discountValue || ''} onChange={(e) => set('discountValue', Number(e.target.value))} />
            </div>
            {errors.discountValue && <p style={{ color: '#ef4444', fontSize: 10, marginTop: 4 }}>{errors.discountValue}</p>}
          </div>
          <div>
            <label style={labelStyle}>Offer Price</label>
            <input type="number" style={{ ...fieldStyle, background: 'rgba(52,211,153,0.08)', borderColor: errors.offerPrice ? 'rgba(239,68,68,0.6)' : 'rgba(52,211,153,0.2)' }}
              value={formData.offerPrice || ''} onChange={(e) => set('offerPrice', Number(e.target.value))} />
            {errors.offerPrice && <p style={{ color: '#ef4444', fontSize: 10, marginTop: 4 }}>{errors.offerPrice}</p>}
          </div>
        </div>

        {/* Dates Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Start Date</label>
            <input type="date" style={{ ...fieldStyle, borderColor: errors.startDate ? 'rgba(239,68,68,0.6)' : undefined }}
              value={formData.startDate} onChange={(e) => set('startDate', e.target.value)} />
            {errors.startDate && <p style={{ color: '#ef4444', fontSize: 10, marginTop: 4 }}>{errors.startDate}</p>}
          </div>
          <div>
            <label style={labelStyle}>End Date</label>
            <input type="date" style={{ ...fieldStyle, borderColor: errors.endDate ? 'rgba(239,68,68,0.6)' : undefined }}
              value={formData.endDate} onChange={(e) => set('endDate', e.target.value)} />
            {errors.endDate && <p style={{ color: '#ef4444', fontSize: 10, marginTop: 4 }}>{errors.endDate}</p>}
          </div>
        </div>

        {/* Featured Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
          <input type="checkbox" checked={formData.isFeatured}
            onChange={(e) => set('isFeatured', e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#C9A84C', cursor: 'pointer' }} />
          Mark as Featured Deal
        </label>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onClose} disabled={isLoading}
            style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isLoading}
            style={{ padding: '10px 24px', background: isLoading ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #C9A84C, #E2C97E)',
              border: 'none', color: '#020617', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
              cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700,
              boxShadow: '0 0 20px rgba(201,168,76,0.2)' }}>
            {isLoading ? 'Saving…' : isEditing ? 'Update Deal' : 'Create Deal'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
