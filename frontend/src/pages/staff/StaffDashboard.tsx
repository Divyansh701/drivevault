import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context';
import { vehicleService } from '@/services/vehicleService';
import { VehicleFormModal, RestockModal } from '@/components/admin';
import { Alert, ConfirmDialog, MetricCard, ActionBtn } from '@/components/ui';
import type { Vehicle, VehicleQueryParams } from '@/types';
import { useVehicles } from '@/hooks/useVehicles';

const NAV = [
  { label: 'Overview', href: '/staff', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg> },
  { label: 'Inventory', href: '/staff/inventory', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1" /></svg> },
  { label: 'Bookings', href: '/staff/bookings', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
  { label: 'Enquiries', href: '/staff/enquiries', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> },
  { label: 'Analytics', href: '/staff/analytics', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg> },
];



export default function StaffDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [params] = useState<VehicleQueryParams>({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' });
  const { vehicles, total, isLoading, error, refetch } = useVehicles(params);
  const [search, setSearch] = useState('');
  const [isFormOpen, setFormOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [restockVehicle, setRestockVehicle] = useState<Vehicle | null>(null);
  const [isRestockOpen, setRestockOpen] = useState(false);
  const [deleteVehicle, setDeleteVehicle] = useState<Vehicle | null>(null);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const stats = useMemo(() => {
    const inStock = vehicles.filter(v => v.quantity > 0).length;
    const lowStock = vehicles.filter(v => v.quantity > 0 && v.quantity <= 5).length;
    const outOfStock = vehicles.filter(v => v.quantity === 0).length;
    const value = vehicles.reduce((s, v) => s + Number(v.price) * v.quantity, 0);
    return { total: total || vehicles.length, inStock, lowStock, outOfStock, value };
  }, [vehicles, total]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return vehicles;
    return vehicles.filter(v =>
      v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) || v.year.toString().includes(q) ||
      (v.vin && v.vin.toLowerCase().includes(q))
    );
  }, [vehicles, search]);

  const handleDelete = async () => {
    if (!deleteVehicle) return;
    setDeleting(true);
    try {
      await vehicleService.remove(deleteVehicle.id);
      setAlert({ type: 'success', text: `"${deleteVehicle.make} ${deleteVehicle.model}" removed from inventory.` });
      setDeleteOpen(false); setDeleteVehicle(null); refetch();
    } catch (e: any) {
      setAlert({ type: 'error', text: e?.message || 'Delete failed.' });
    } finally { setDeleting(false); }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <DashboardLayout navItems={NAV} role="STAFF" title="Staff Portal" subtitle="Inventory Management">
      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>

        {/* Header */}
        <div style={{ marginBottom: 24, padding: '24px 28px', background: 'rgba(8,12,24,0.8)',
          border: '1px solid rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ color: '#C9A84C', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>Staff Portal</div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fff', fontSize: 26, fontWeight: 700, margin: 0 }}>
              Inventory Management
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '4px 0 0' }}>Welcome, {user?.name}</p>
          </div>
          <button onClick={() => { setEditVehicle(null); setFormOpen(true); }} style={{
            background: 'linear-gradient(135deg, #C9A84C, #E2C97E)', color: '#020617', border: 'none',
            padding: '11px 24px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s',
            boxShadow: '0 0 20px rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Vehicle
          </button>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 24 }}>
          <MetricCard label="Total Vehicles" value={stats.total} color="#C9A84C"
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1" /></svg>} />
          <MetricCard label="In Stock" value={stats.inStock} color="#34d399"
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <MetricCard label="Low Stock" value={stats.lowStock} sub={stats.lowStock > 0 ? '⚠ Attention' : undefined} color="#f59e0b"
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>} />
          <MetricCard label="Out of Stock" value={stats.outOfStock} color="#ef4444"
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>} />
          <MetricCard label="Inventory Value" value={fmt(stats.value)} color="#e879f9"
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>} />
        </div>

        {/* Alert */}
        {alert && <div style={{ marginBottom: 16 }}><Alert type={alert.type} onClose={() => setAlert(null)}>{alert.text}</Alert></div>}
        {error && <div style={{ marginBottom: 16 }}><Alert type="error">Failed to load inventory.</Alert></div>}

        {/* Search bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} viewBox="0 0 24 24"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by make, model, category, VIN..."
              style={{ width: '100%', padding: '10px 12px 10px 34px', background: 'rgba(8,12,24,0.8)',
                border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 12,
                fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{filtered.length} of {stats.total} vehicles</div>
        </div>

        {/* Inventory Table */}
        <div style={{ background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ width: 28, height: 28, border: '2px solid rgba(201,168,76,0.3)', borderTopColor: '#C9A84C',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              Loading inventory...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No vehicles found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    {['Vehicle', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.35)',
                        fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', textAlign: h === 'Actions' ? 'right' : 'left', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(v => {
                    const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v.price));
                    return (
                      <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ color: '#fff', fontWeight: 600 }}>{v.make} {v.model}</div>
                          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 2 }}>{v.year}{v.vin && ` · ${v.vin.slice(0,10)}…`}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                            color: '#C9A84C', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px' }}>
                            {v.category}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#E2C97E', fontWeight: 600 }}>{price}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {v.quantity === 0
                            ? <span style={{ color: '#ef4444', fontSize: 10, fontWeight: 600 }}>Out of Stock</span>
                            : v.quantity <= 5
                              ? <span style={{ color: '#f59e0b', fontSize: 10 }}>Low ({v.quantity})</span>
                              : <span style={{ color: '#34d399', fontSize: 10 }}>{v.quantity} units</span>
                          }
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'capitalize' }}>{v.status}</span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            {isAdmin && (
                              <ActionBtn color="#34d399" label="Restock" onClick={() => { setRestockVehicle(v); setRestockOpen(true); }} icon={<svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>} />
                            )}
                            <ActionBtn color="#C9A84C" label="Edit" onClick={() => { setEditVehicle(v); setFormOpen(true); }} icon={<svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>} />
                            <ActionBtn color="#ef4444" label="Delete" onClick={() => { setDeleteVehicle(v); setDeleteOpen(true); }} icon={<svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>} />
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
      </div>

      <VehicleFormModal isOpen={isFormOpen} onClose={() => setFormOpen(false)} vehicleToEdit={editVehicle}
        onSuccess={() => { setAlert({ type: 'success', text: editVehicle ? 'Vehicle updated!' : 'Vehicle added!' }); refetch(); }} />
      <RestockModal isOpen={isRestockOpen} onClose={() => setRestockOpen(false)} vehicle={restockVehicle}
        onSuccess={() => { setAlert({ type: 'success', text: 'Inventory restocked successfully!' }); refetch(); }} />
      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Delete Vehicle" message={`Remove "${deleteVehicle?.make} ${deleteVehicle?.model}" from inventory?`}
        confirmText="Delete" variant="danger" isLoading={isDeleting} />
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}

