import React, { useState, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { VehicleCard, SearchFilters, FilterValues } from '@/components/vehicle';
import { Alert, Button } from '@/components/ui';
import { useVehicles } from '@/hooks/useVehicles';
import { vehicleService } from '@/services/vehicleService';
import type { VehicleQueryParams } from '@/types';

export const DashboardPage: React.FC = () => {
  const [params, setParams] = useState<VehicleQueryParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { vehicles, total, totalPages, page, isLoading, error, refetch } = useVehicles(params);

  // Handle filter changes emitted by SearchFilters (already debounced by SearchFilters)
  const handleFilterChange = useCallback((filters: FilterValues) => {
    setParams((prev) => ({
      ...prev,
      page: 1, // reset page to 1 on filter change
      make: filters.make.trim() || undefined,
      model: filters.model.trim() || undefined,
      category: filters.category || undefined,
      minPrice: filters.minPrice ? filters.minPrice : undefined,
      maxPrice: filters.maxPrice ? filters.maxPrice : undefined,
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc',
    }));
  }, []);

  // Pagination navigation
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setParams((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle vehicle purchase action
  const handlePurchase = async (vehicleId: string) => {
    setPurchasingId(vehicleId);
    setActionMessage(null);
    try {
      await vehicleService.purchase(vehicleId);
      setActionMessage({
        type: 'success',
        text: 'Vehicle purchased successfully! Inventory updated.',
      });
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to purchase vehicle.';
      setActionMessage({
        type: 'error',
        text: msg,
      });
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col font-sans">
      <Navbar />

      <main className="page-container space-y-8 flex-1">
        {/* Header Hero Banner */}
        <div className="glass p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="badge-gold uppercase tracking-widest text-[11px] font-semibold">
              Live Showroom & Inventory
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              DIVI <span className="text-gradient-gold">Collection</span>
            </h1>
            <p className="text-surface-300 text-sm sm:text-base leading-relaxed">
              Browse and acquire from our curated selection of premium vehicles. Filter by make, model, category, and price.
            </p>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface-900/40 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-surface-400 block">Total Vehicles</span>
              <span className="text-xl font-bold text-white">{total}</span>
            </div>
            <div className="bg-surface-900/40 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-surface-400 block">In Stock</span>
              <span className="text-xl font-bold text-emerald-400">
                {vehicles.filter((v) => v.quantity > 0).length}
              </span>
            </div>
            <div className="bg-surface-900/40 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-surface-400 block">Current Page</span>
              <span className="text-xl font-bold text-brand-400">
                {page} / {totalPages || 1}
              </span>
            </div>
            <div className="bg-surface-900/40 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-surface-400 block">Limit Per Page</span>
              <span className="text-xl font-bold text-surface-300">{params.limit}</span>
            </div>
          </div>
        </div>

        {/* Global Action Notification */}
        {actionMessage && (
          <Alert
            type={actionMessage.type}
            onClose={() => setActionMessage(null)}
            className="animate-in"
          >
            {actionMessage.text}
          </Alert>
        )}

        {/* Global Error Banner */}
        {error && (
          <Alert type="error" className="animate-in">
            <div className="flex items-center justify-between w-full">
              <span>{error.message || 'Failed to load vehicle inventory from server.'}</span>
              <Button variant="ghost" className="text-xs py-1 px-3" onClick={refetch}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Search & Filters UI Component */}
        <SearchFilters
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
          totalCount={total}
        />

        {/* Main Content Area */}
        {isLoading ? (
          /* Loading State — Skeleton Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass h-80 animate-pulse p-5 flex flex-col justify-between">
                <div className="w-full h-36 bg-surface-800 rounded-xl" />
                <div className="space-y-2 mt-4">
                  <div className="h-5 bg-surface-800 rounded w-3/4" />
                  <div className="h-4 bg-surface-800 rounded w-1/2" />
                </div>
                <div className="h-10 bg-surface-800 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          /* Empty State */
          <div className="glass p-12 text-center max-w-lg mx-auto my-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center mx-auto text-surface-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">No vehicles match your search</h3>
            <p className="text-sm text-surface-400">
              No results were returned from the server for the selected make, model, category, or price range.
            </p>
          </div>
        ) : (
          /* Vehicle Cards Grid */
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onPurchase={handlePurchase}
                  isPurchasing={purchasingId === vehicle.id}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs">
                <span className="text-surface-400">
                  Page <strong className="text-white">{page}</strong> of{' '}
                  <strong className="text-white">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1 || isLoading}
                    className="text-xs py-1.5 px-3"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages || isLoading}
                    className="text-xs py-1.5 px-3"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
