import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vehicleService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import type { Vehicle } from '@/types';
import { Button } from '@/components/ui';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatMileage(value: number) {
  return new Intl.NumberFormat('en-US').format(value) + ' mi';
}

// ─── Stock Badge ──────────────────────────────────────────────────────────────

function StockBadge({ quantity }: { quantity: number }) {
  if (quantity === 0)
    return <span className="badge-red px-3 py-1 text-sm">Out of Stock</span>;
  if (quantity <= 5)
    return (
      <span className="badge-yellow px-3 py-1 text-sm">
        Low Stock · {quantity} left
      </span>
    );
  return (
    <span className="badge-green px-3 py-1 text-sm">
      In Stock · {quantity} available
    </span>
  );
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-72 sm:h-96 rounded-2xl bg-surface-800/80 flex flex-col items-center justify-center text-surface-500">
        <svg className="w-20 h-20 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1" />
        </svg>
        <p className="text-sm font-medium uppercase tracking-widest opacity-40">No Images Available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-surface-800 border border-white/10 relative group">
        <img
          src={images[active]}
          alt={`${alt} — image ${active + 1}`}
          className="w-full h-full object-cover transition-all duration-500"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface-900/80 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-800"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={() => setActive((p) => (p + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface-900/80 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-800"
              aria-label="Next image"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === active ? 'bg-white w-5' : 'bg-white/40'}`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === active ? 'border-brand-500 opacity-100' : 'border-white/10 opacity-50 hover:opacity-80'
              }`}
            >
              <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Spec Item ────────────────────────────────────────────────────────────────

function SpecItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="glass px-4 py-3 flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-surface-500">{label}</span>
      <span className="text-sm font-semibold text-white">{value || '—'}</span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="page-container animate-pulse">
      <div className="h-4 w-40 bg-surface-800 rounded mb-6" />
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="h-96 bg-surface-800 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-surface-800 rounded" />
          <div className="h-5 w-1/2 bg-surface-800 rounded" />
          <div className="h-12 w-1/3 bg-surface-800 rounded" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-surface-800 rounded-xl" />
            ))}
          </div>
          <div className="h-12 bg-surface-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [vehicle, setVehicle]       = useState<Vehicle | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseMsg, setPurchaseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Fetch vehicle ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    vehicleService
      .getById(id)
      .then(setVehicle)
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.message || 'Failed to load vehicle.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ── Purchase handler ────────────────────────────────────────────────────────

  const handlePurchase = useCallback(async () => {
    if (!vehicle || vehicle.quantity <= 0 || purchasing) return;
    setPurchasing(true);
    setPurchaseMsg(null);
    try {
      const updated = await vehicleService.purchase(vehicle.id);
      setVehicle(updated);
      setPurchaseMsg({ type: 'success', text: 'Purchase successful! Enjoy your new vehicle.' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Purchase failed. Please try again.';
      setPurchaseMsg({ type: 'error', text: msg });
    } finally {
      setPurchasing(false);
      setTimeout(() => setPurchaseMsg(null), 5000);
    }
  }, [vehicle, purchasing]);

  // ── Render states ──────────────────────────────────────────────────────────

  if (loading) return <DetailSkeleton />;

  if (error || !vehicle) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="glass p-10 max-w-md">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Vehicle Not Found</h2>
          <p className="text-surface-400 text-sm mb-6">{error || 'This vehicle does not exist or has been removed.'}</p>
          <Button variant="primary" onClick={() => navigate('/vehicles')}>← Back to Vehicles</Button>
        </div>
      </div>
    );
  }

  const isOutOfStock = vehicle.quantity <= 0;
  const hasVin       = Boolean(vehicle.vin);
  const hasColor     = Boolean(vehicle.color);

  return (
    <div className="page-container">
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm text-surface-400 mb-8" aria-label="Breadcrumb">
        <Link to="/vehicles" className="hover:text-white transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Vehicles
        </Link>
        <span className="text-surface-600">/</span>
        <span className="text-surface-300 font-medium truncate">{vehicle.make} {vehicle.model}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">
        {/* ── Left: Gallery ─────────────────────────────────────────────── */}
        <div>
          <ImageGallery images={vehicle.imageUrls} alt={`${vehicle.make} ${vehicle.model}`} />
        </div>

        {/* ── Right: Details & Actions ───────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="badge-blue text-xs px-2.5 py-0.5 uppercase tracking-wide font-bold">
                {vehicle.category}
              </span>
              <span className="badge-gray text-xs px-2.5 py-0.5 font-medium">
                {vehicle.powertrain}
              </span>
              <StockBadge quantity={vehicle.quantity} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {vehicle.year} {vehicle.make}{' '}
              <span className="text-gradient">{vehicle.model}</span>
            </h1>

            {vehicle.description && (
              <p className="mt-3 text-surface-400 text-sm leading-relaxed">
                {vehicle.description}
              </p>
            )}
          </div>

          {/* Price Block */}
          <div className="glass p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-surface-500 font-semibold mb-0.5">Listed Price</p>
              <p className="text-4xl font-extrabold text-white tracking-tight">
                {formatCurrency(vehicle.price)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-widest text-surface-500 font-semibold mb-0.5">Mileage</p>
              <p className="text-xl font-bold text-surface-200">{formatMileage(vehicle.mileage)}</p>
            </div>
          </div>

          {/* Specs Grid */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-surface-500 mb-3">Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <SpecItem label="Year"      value={vehicle.year} />
              <SpecItem label="Category"  value={vehicle.category} />
              <SpecItem label="Powertrain" value={vehicle.powertrain} />
              {hasColor && <SpecItem label="Color"  value={vehicle.color} />}
              {hasVin   && <SpecItem label="VIN"    value={<span className="font-mono text-xs">{vehicle.vin}</span>} />}
              <SpecItem label="Status"    value={
                <span className={vehicle.status === 'available' ? 'text-emerald-400' : 'text-amber-400'}>
                  {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                </span>
              } />
            </div>
          </div>

          {/* Feedback */}
          {purchaseMsg && (
            <div
              className={`p-4 rounded-xl text-sm font-medium border animate-in ${
                purchaseMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/25 text-red-300'
              }`}
              role="alert"
            >
              {purchaseMsg.text}
            </div>
          )}

          {/* Purchase CTA */}
          <div className="space-y-3">
            <Button
              id="purchase-vehicle-btn"
              variant="primary"
              fullWidth
              onClick={handlePurchase}
              isLoading={purchasing}
              disabled={isOutOfStock || purchasing}
              className="py-3.5 text-base font-bold tracking-wide"
            >
              {purchasing ? 'Processing…' : isOutOfStock ? 'Sold Out' : '🔑 Purchase Vehicle'}
            </Button>

            <Button
              variant="ghost"
              fullWidth
              onClick={() => navigate('/vehicles')}
              className="text-sm"
            >
              ← Back to Inventory
            </Button>
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="glass p-4 border-l-4 border-brand-500/50">
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400 mb-2.5">Admin Actions</p>
              <div className="flex gap-2">
                <Link to="/admin">
                  <Button variant="ghost" className="text-xs py-1.5 px-3">
                    ✏️ Edit in Admin Panel
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Metadata footer */}
          <div className="text-[11px] text-surface-600 flex gap-4 pt-2 border-t border-white/5">
            <span>Added: {new Date(vehicle.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span>Updated: {new Date(vehicle.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* ── Related / Similar vehicles placeholder ──────────────────────────── */}
      <div className="mt-16 pt-10 border-t border-white/5">
        <h2 className="text-xl font-bold text-white mb-1">Explore More Vehicles</h2>
        <p className="text-sm text-surface-400 mb-4">Browse the full catalog and find your perfect match.</p>
        <Link to="/vehicles">
          <Button variant="ghost" className="text-sm px-5">
            View All Vehicles →
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default VehicleDetailPage;
