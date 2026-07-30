import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Vehicle } from '@/types';
import { Button } from '@/components/ui';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase?: (vehicleId: string) => Promise<void>;
  isPurchasing?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPurchase,
  isPurchasing = false,
}) => {
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(vehicle.price));

  const isOutOfStock = vehicle.quantity <= 0;

  const handlePurchase = async () => {
    if (!onPurchase || isOutOfStock || purchaseLoading || isPurchasing) return;

    setPurchaseLoading(true);
    setPurchaseError(null);
    setPurchaseSuccess(null);

    try {
      await onPurchase(vehicle.id);
      setPurchaseSuccess('Vehicle purchased successfully!');
      setTimeout(() => setPurchaseSuccess(null), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to purchase vehicle.';
      setPurchaseError(msg);
      setTimeout(() => setPurchaseError(null), 4000);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const hasImage = vehicle.imageUrls && vehicle.imageUrls.length > 0;
  const mainImage = hasImage ? vehicle.imageUrls[0] : null;

  return (
    <div className="glass overflow-hidden flex flex-col justify-between hover:border-brand-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-brand-500/5">
      {/* Top Image / Graphic Banner — clickable to detail page */}
      <Link to={`/vehicles/${vehicle.id}`} className="block relative h-44 bg-surface-800/80 overflow-hidden flex items-center justify-center" tabIndex={0} aria-label={`View ${vehicle.make} ${vehicle.model} details`}>
        {mainImage ? (
          <img
            src={mainImage}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-surface-500 group-hover:scale-105 transition-transform duration-300">
            <svg
              className="w-16 h-16 mb-1 stroke-current opacity-40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1"
              />
            </svg>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-60">DriveVault</span>
          </div>
        )}

        {/* Category & Status Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="badge-blue uppercase tracking-wider text-[10px] font-bold px-2 py-0.5">
            {vehicle.category}
          </span>
          {vehicle.powertrain && (
            <span className="badge-gray text-[10px] font-medium px-2 py-0.5">
              {vehicle.powertrain}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="badge-red text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Out of Stock
            </span>
          ) : (
            <span className="badge-green text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              In Stock ({vehicle.quantity})
            </span>
          )}
        </div>
      </Link>

      {/* Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
              {vehicle.make} {vehicle.model}
            </h3>
            <span className="text-xs text-surface-400 font-mono font-medium">{vehicle.year}</span>
          </div>

          {vehicle.description && (
            <p className="text-xs text-surface-400 mt-1.5 line-clamp-2 leading-relaxed">
              {vehicle.description}
            </p>
          )}

          <Link
            to={`/vehicles/${vehicle.id}`}
            className="inline-flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 font-semibold mt-2 transition-colors"
          >
            View Details <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Specs & Pricing Grid */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-surface-400 uppercase tracking-wider block">Price</span>
            <span className="text-xl font-extrabold text-white tracking-tight">{formattedPrice}</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-surface-400 uppercase tracking-wider block">Quantity</span>
            <span
              className={`text-sm font-semibold ${
                isOutOfStock ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {vehicle.quantity} available
            </span>
          </div>
        </div>

        {/* Feedback alerts */}
        {purchaseError && (
          <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-lg animate-in">
            {purchaseError}
          </div>
        )}
        {purchaseSuccess && (
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-lg animate-in">
            {purchaseSuccess}
          </div>
        )}

        {/* Purchase Action Button */}
        <Button
          variant="primary"
          fullWidth
          onClick={handlePurchase}
          isLoading={purchaseLoading || isPurchasing}
          disabled={isOutOfStock || purchaseLoading || isPurchasing}
          className="mt-2"
        >
          {isOutOfStock ? 'Sold Out' : 'Purchase Vehicle'}
        </Button>
      </div>
    </div>
  );
};

export default VehicleCard;
