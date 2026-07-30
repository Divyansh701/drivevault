import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { VehicleFormModal, RestockModal } from '@/components/admin';
import { Alert, Button, ConfirmDialog } from '@/components/ui';
import { useVehicles } from '@/hooks/useVehicles';
import { vehicleService } from '@/services/vehicleService';
import type { Vehicle, VehicleQueryParams } from '@/types';

export const AdminDashboardPage: React.FC = () => {
  const [params] = useState<VehicleQueryParams>({
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal State Control
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);

  const [isRestockModalOpen, setRestockModalOpen] = useState(false);
  const [vehicleToRestock, setVehicleToRestock] = useState<Vehicle | null>(null);

  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [isDeleting, setDeleting] = useState(false);

  // Global Action Banner State
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { vehicles, total, isLoading, error, refetch } = useVehicles(params);

  // Stats Calculations
  const stats = useMemo(() => {
    const totalCount = total || vehicles.length;
    const inStock = vehicles.filter((v) => v.quantity > 0).length;
    const lowStock = vehicles.filter((v) => v.quantity > 0 && v.quantity <= 5).length;
    const outOfStock = vehicles.filter((v) => v.quantity === 0).length;
    const totalInventoryValue = vehicles.reduce(
      (sum, v) => sum + Number(v.price) * v.quantity,
      0
    );

    return { totalCount, inStock, lowStock, outOfStock, totalInventoryValue };
  }, [vehicles, total]);

  // Client-side quick filter for instantaneous responsiveness
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchCat = !categoryFilter || v.category.toLowerCase() === categoryFilter.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.year.toString().includes(q) ||
        (v.vin && v.vin.toLowerCase().includes(q));

      return matchCat && matchQuery;
    });
  }, [vehicles, searchQuery, categoryFilter]);

  // Modal Triggers
  const handleOpenAddModal = () => {
    setVehicleToEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setFormModalOpen(true);
  };

  const handleOpenRestockModal = (vehicle: Vehicle) => {
    setVehicleToRestock(vehicle);
    setRestockModalOpen(true);
  };

  const handleOpenDeleteConfirm = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteConfirmOpen(true);
  };

  // Execute Vehicle Deletion
  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    setDeleting(true);
    setActionAlert(null);
    try {
      await vehicleService.remove(vehicleToDelete.id);
      setActionAlert({
        type: 'success',
        text: `Vehicle "${vehicleToDelete.make} ${vehicleToDelete.model}" was deleted successfully.`,
      });
      setDeleteConfirmOpen(false);
      setVehicleToDelete(null);
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete vehicle.';
      setActionAlert({
        type: 'error',
        text: msg,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setActionAlert({
      type: 'success',
      text: vehicleToEdit ? 'Vehicle updated successfully!' : 'New vehicle created successfully!',
    });
    refetch();
  };

  const handleRestockSuccess = () => {
    setActionAlert({
      type: 'success',
      text: `Inventory restocked for "${vehicleToRestock?.make} ${vehicleToRestock?.model}".`,
    });
    refetch();
  };

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(stats.totalInventoryValue);

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col font-sans">
      <Navbar />

      <main className="page-container space-y-8 flex-1">
        {/* Admin Header & Stats */}
        <div className="glass p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <span className="badge-gold uppercase tracking-widest text-[11px] font-semibold">
                DIVI Control Panel
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Inventory <span className="text-gradient-gold">Management</span>
              </h1>
              <p className="text-surface-300 text-sm">
                Add, update, restock, or remove vehicles from the DIVI catalog with role-based access.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleOpenAddModal}
              className="py-3 px-5 shadow-lg shadow-brand-600/30 whitespace-nowrap self-start sm:self-auto"
            >
              <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Vehicle
            </Button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface-900/40 p-4 rounded-xl border border-white/5">
              <span className="text-xs text-surface-400 uppercase tracking-wider block mb-1">
                Total Catalog Count
              </span>
              <span className="text-2xl font-extrabold text-white">{stats.totalCount}</span>
            </div>
            <div className="bg-surface-900/40 p-4 rounded-xl border border-white/5">
              <span className="text-xs text-surface-400 uppercase tracking-wider block mb-1">
                Estimated Inventory Value
              </span>
              <span className="text-2xl font-extrabold text-brand-400">{formattedValue}</span>
            </div>
            <div className="bg-surface-900/40 p-4 rounded-xl border border-white/5">
              <span className="text-xs text-surface-400 uppercase tracking-wider block mb-1">
                Low Stock Alert (≤5)
              </span>
              <span className="text-2xl font-extrabold text-amber-400">{stats.lowStock}</span>
            </div>
            <div className="bg-surface-900/40 p-4 rounded-xl border border-white/5">
              <span className="text-xs text-surface-400 uppercase tracking-wider block mb-1">
                Out of Stock
              </span>
              <span className="text-2xl font-extrabold text-red-400">{stats.outOfStock}</span>
            </div>
          </div>
        </div>

        {/* Global Action Notification Banner */}
        {actionAlert && (
          <Alert
            type={actionAlert.type}
            onClose={() => setActionAlert(null)}
            className="animate-in"
          >
            {actionAlert.text}
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert type="error">
            <div className="flex items-center justify-between w-full">
              <span>{error.message || 'Failed to fetch vehicles from server.'}</span>
              <Button variant="ghost" className="text-xs py-1 px-3" onClick={refetch}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Filter by make, model, category, or VIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
            <svg
              className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input cursor-pointer py-2.5 max-w-[200px]"
            >
              <option value="" className="bg-surface-900 text-white">
                All Categories
              </option>
              <option value="SEDAN" className="bg-surface-900 text-white">Sedan</option>
              <option value="SUV" className="bg-surface-900 text-white">SUV</option>
              <option value="TRUCK" className="bg-surface-900 text-white">Truck</option>
              <option value="HATCHBACK" className="bg-surface-900 text-white">Hatchback</option>
              <option value="CONVERTIBLE" className="bg-surface-900 text-white">Convertible</option>
              <option value="COUPE" className="bg-surface-900 text-white">Coupe</option>
              <option value="VAN" className="bg-surface-900 text-white">Van</option>
              <option value="MOTORCYCLE" className="bg-surface-900 text-white">Motorcycle</option>
            </select>
          </div>
        </div>

        {/* Vehicles Data Table */}
        <div className="glass overflow-hidden border border-white/10 rounded-2xl">
          {isLoading ? (
            <div className="p-12 text-center text-surface-400 flex items-center justify-center gap-3">
              <span className="spinner w-6 h-6 text-brand-500" />
              <span>Loading inventory records...</span>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="p-12 text-center text-surface-400 space-y-3">
              <p className="text-lg font-bold text-white">No vehicles found</p>
              <p className="text-sm">Try clearing your search filters or click "Add New Vehicle" above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-surface-950/60 text-[11px] font-bold uppercase tracking-wider text-surface-400">
                    <th className="py-4 px-6">Vehicle</th>
                    <th className="py-4 px-4">Category & Powertrain</th>
                    <th className="py-4 px-4">Price</th>
                    <th className="py-4 px-4">Stock</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredVehicles.map((v) => {
                    const priceFormatted = new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0,
                    }).format(Number(v.price));

                    return (
                      <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Vehicle info */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-white group-hover:text-brand-300 transition-colors">
                            {v.make} {v.model}
                          </div>
                          <div className="text-xs text-surface-400 font-mono">
                            Year: {v.year} {v.vin && `• VIN: ${v.vin}`}
                          </div>
                        </td>

                        {/* Category & Powertrain */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="badge-blue text-[10px] font-bold px-2 py-0.5 uppercase">
                              {v.category}
                            </span>
                            {v.powertrain && (
                              <span className="badge-gray text-[10px] font-medium px-2 py-0.5">
                                {v.powertrain}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-4 font-bold text-white whitespace-nowrap">
                          {priceFormatted}
                        </td>

                        {/* Stock */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {v.quantity === 0 ? (
                            <span className="badge-red font-bold text-[11px] px-2.5 py-0.5 uppercase">
                              Out of stock
                            </span>
                          ) : v.quantity <= 5 ? (
                            <span className="badge-yellow font-bold text-[11px] px-2.5 py-0.5">
                              Low Stock ({v.quantity})
                            </span>
                          ) : (
                            <span className="badge-green font-bold text-[11px] px-2.5 py-0.5">
                              {v.quantity} units
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="text-xs font-medium text-surface-300 capitalize">
                            {v.status}
                          </span>
                        </td>

                        {/* Admin Action Buttons */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {/* Restock Button */}
                            <button
                              onClick={() => handleOpenRestockModal(v)}
                              title="Restock Inventory"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Restock
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(v)}
                              title="Edit Vehicle"
                              className="px-2.5 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/20 text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleOpenDeleteConfirm(v)}
                              title="Delete Vehicle"
                              className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Vehicle Modal */}
      <VehicleFormModal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        vehicleToEdit={vehicleToEdit}
      />

      {/* Restock Vehicle Modal */}
      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        onSuccess={handleRestockSuccess}
        vehicle={vehicleToRestock}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteVehicle}
        title="Delete Vehicle"
        message={`Are you sure you want to delete "${vehicleToDelete?.make} ${vehicleToDelete?.model}" (${vehicleToDelete?.year})? This action will remove the record from active inventory.`}
        confirmText="Delete Vehicle"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminDashboardPage;
