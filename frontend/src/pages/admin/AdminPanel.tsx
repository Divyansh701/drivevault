import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context';
import { VehicleFormModal, RestockModal } from '@/components/admin';
import { Alert, Button, ConfirmDialog } from '@/components/ui';
import { useVehicles } from '@/hooks/useVehicles';
import { vehicleService } from '@/services/vehicleService';
import type { Vehicle, VehicleQueryParams } from '@/types';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5" /></svg> },
  { label: 'Inventory', href: '/admin/inventory', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1" /></svg> },
  { label: 'Users', href: '/admin/users', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
  { label: 'Brands', href: '/admin/brands', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /></svg> },
  { label: 'Bookings', href: '/admin/bookings', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
  { label: 'Analytics', href: '/admin/analytics', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg> },
  { label: 'Reports', href: '/admin/reports', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
  { label: 'Settings', href: '/admin/settings', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function KPI({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div style={{ padding: '20px 22px', background: 'rgba(8,12,24,0.85)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display',Georgia,serif", color, fontSize: 28, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ABtn({ label, color, onClick, icon }: { label: string; color: string; onClick: () => void; icon: React.ReactNode }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: '5px 10px', background: h ? `${color}22` : `${color}10`, border: `1px solid ${color}30`,
        color, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer',
        fontFamily: 'Inter,sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s' }}>
      {icon}{label}
    </button>
  );
}

// ─── User Management mock data ────────────────────────────────────────────────
const MOCK_USERS = [
  { id: '1', name: 'John Carter', email: 'john@divi.com', role: 'VIEWER', status: 'Active', joined: '2024-01-15' },
  { id: '2', name: 'Sarah Blake', email: 'sarah@divi.com', role: 'STAFF', status: 'Active', joined: '2024-02-20' },
  { id: '3', name: 'Michael Ross', email: 'michael@divi.com', role: 'VIEWER', status: 'Active', joined: '2024-03-10' },
  { id: '4', name: 'Emma Wilson', email: 'emma@divi.com', role: 'VIEWER', status: 'Inactive', joined: '2024-04-05' },
  { id: '5', name: 'David Chen', email: 'david@divi.com', role: 'STAFF', status: 'Active', joined: '2024-05-18' },
];

// ─── Inventory sub-view ───────────────────────────────────────────────────────
function InventoryView() {
  const [params] = React.useState<VehicleQueryParams>({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' });
  const { vehicles, total, isLoading, refetch } = useVehicles(params);
  const [search, setSearch] = React.useState('');
  const [isFormOpen, setFormOpen] = React.useState(false);
  const [editV, setEditV] = React.useState<Vehicle | null>(null);
  const [restockV, setRestockV] = React.useState<Vehicle | null>(null);
  const [isRestockOpen, setRestockOpen] = React.useState(false);
  const [deleteV, setDeleteV] = React.useState<Vehicle | null>(null);
  const [isDeleteOpen, setDeleteOpen] = React.useState(false);
  const [isDeleting, setDeleting] = React.useState(false);
  const [alert, setAlert] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    return vehicles.filter(v => !q || v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.year.toString().includes(q));
  }, [vehicles, search]);

  const handleDelete = async () => {
    if (!deleteV) return;
    setDeleting(true);
    try { await vehicleService.remove(deleteV.id); setAlert({ type: 'success', text: `"${deleteV.make} ${deleteV.model}" deleted.` }); setDeleteOpen(false); setDeleteV(null); refetch(); }
    catch (e: any) { setAlert({ type: 'error', text: e?.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      {alert && <div style={{ marginBottom: 16 }}><Alert type={alert.type} onClose={() => setAlert(null)}>{alert.text}</Alert></div>}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vehicles..."
            style={{ width: '100%', padding: '10px 12px 10px 14px', background: 'rgba(8,12,24,0.8)',
              border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, fontFamily: 'Inter,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <button onClick={() => { setEditV(null); setFormOpen(true); }} style={{
          background: 'linear-gradient(135deg,#e879f9,#a855f7)', color: '#fff', border: 'none',
          padding: '10px 20px', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
          fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Vehicle
        </button>
      </div>
      <div style={{ background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Vehicle', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.35)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', textAlign: h === 'Actions' ? 'right' : 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px' }}><div style={{ color: '#fff', fontWeight: 600 }}>{v.make} {v.model}</div><div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{v.year}</div></td>
                  <td style={{ padding: '12px 16px' }}><span style={{ background: 'rgba(232,121,249,0.1)', border: '1px solid rgba(232,121,249,0.2)', color: '#e879f9', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px' }}>{v.category}</span></td>
                  <td style={{ padding: '12px 16px', color: '#E2C97E', fontWeight: 600 }}>{fmt(Number(v.price))}</td>
                  <td style={{ padding: '12px 16px' }}>{v.quantity === 0 ? <span style={{ color: '#ef4444' }}>Out of Stock</span> : v.quantity <= 5 ? <span style={{ color: '#f59e0b' }}>Low ({v.quantity})</span> : <span style={{ color: '#34d399' }}>{v.quantity} units</span>}</td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'capitalize' }}>{v.status}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <ABtn color="#34d399" label="Restock" onClick={() => { setRestockV(v); setRestockOpen(true); }} icon={<svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>} />
                      <ABtn color="#e879f9" label="Edit" onClick={() => { setEditV(v); setFormOpen(true); }} icon={<svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>} />
                      <ABtn color="#ef4444" label="Delete" onClick={() => { setDeleteV(v); setDeleteOpen(true); }} icon={<svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <VehicleFormModal isOpen={isFormOpen} onClose={() => setFormOpen(false)} vehicleToEdit={editV} onSuccess={() => { setAlert({ type: 'success', text: editV ? 'Updated!' : 'Vehicle added!' }); refetch(); }} />
      <RestockModal isOpen={isRestockOpen} onClose={() => setRestockOpen(false)} vehicle={restockV} onSuccess={() => { setAlert({ type: 'success', text: 'Restocked!' }); refetch(); }} />
      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Delete Vehicle" message={`Remove "${deleteV?.make} ${deleteV?.model}"?`} confirmText="Delete" variant="danger" isLoading={isDeleting} />
    </div>
  );
}

// ─── Users sub-view ───────────────────────────────────────────────────────────
function UsersView() {
  const ROLE_COL: Record<string, string> = { ADMIN: '#e879f9', STAFF: '#C9A84C', VIEWER: '#38bdf8' };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{MOCK_USERS.length} registered users</div>
        <button style={{ background: 'linear-gradient(135deg,#e879f9,#a855f7)', color: '#fff', border: 'none',
          padding: '9px 18px', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
          fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
          Invite User
        </button>
      </div>
      <div style={{ background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.35)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', textAlign: h === 'Actions' ? 'right' : 'left', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${ROLE_COL[u.role]}20`, border: `1px solid ${ROLE_COL[u.role]}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ROLE_COL[u.role], fontSize: 12, fontWeight: 700 }}>{u.name.charAt(0)}</div>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.45)' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ background: `${ROLE_COL[u.role]}15`, border: `1px solid ${ROLE_COL[u.role]}25`, color: ROLE_COL[u.role], fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', padding: '2px 8px' }}>{u.role}</span></td>
                <td style={{ padding: '12px 16px' }}><span style={{ color: u.status === 'Active' ? '#34d399' : '#ef4444', fontSize: 11, fontWeight: 600 }}>● {u.status}</span></td>
                <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{u.joined}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <ABtn color="#e879f9" label="Edit" onClick={() => {}} icon={<svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>} />
                    <ABtn color="#ef4444" label="Remove" onClick={() => {}} icon={<svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Analytics sub-view ───────────────────────────────────────────────────────
function AnalyticsView({ vehicles }: { vehicles: Vehicle[] }) {
  const cats = ['SEDAN','SUV','TRUCK','HATCHBACK','CONVERTIBLE','COUPE'];
  const maxQty = Math.max(...vehicles.map(v => v.quantity), 1);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div style={{ padding: '24px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>Stock by Category</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cats.map(cat => {
            const count = vehicles.filter(v => v.category === cat).reduce((s, v) => s + v.quantity, 0);
            const pct = Math.round((count / (maxQty * vehicles.length || 1)) * 100);
            return (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{cat}</span>
                  <span style={{ color: '#E2C97E', fontSize: 11, fontWeight: 600 }}>{count} units</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${Math.min(pct + 10, 100)}%`, background: 'linear-gradient(90deg,#e879f9,#C9A84C)', borderRadius: 2, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding: '24px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>Inventory Health</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Fully Stocked (>5)', value: vehicles.filter(v => v.quantity > 5).length, color: '#34d399' },
            { label: 'Low Stock (1-5)', value: vehicles.filter(v => v.quantity > 0 && v.quantity <= 5).length, color: '#f59e0b' },
            { label: 'Out of Stock', value: vehicles.filter(v => v.quantity === 0).length, color: '#ef4444' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{item.label}</span>
              <span style={{ color: item.color, fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings sub-view ────────────────────────────────────────────────────────
function SettingsView() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {[
        { section: 'Platform', fields: ['Site Name: DIVI Luxury Automotive', 'Currency: USD', 'Timezone: UTC', 'Language: English'] },
        { section: 'Security', fields: ['JWT Expiry: 15 minutes', 'Session Timeout: 7 days', 'Bcrypt Rounds: 10', '2FA: Disabled'] },
        { section: 'Notifications', fields: ['Email Alerts: Enabled', 'Low Stock Alert: ≤5 units', 'New Booking: Notify', 'Daily Report: 08:00'] },
        { section: 'Roles & Permissions', fields: ['ADMIN: Full Access', 'STAFF: Inventory + Bookings', 'VIEWER: Browse + Purchase', 'Guest: Landing Page'] },
      ].map(s => (
        <div key={s.section} style={{ padding: '24px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, background: '#e879f9', borderRadius: '50%' }} />
            {s.section}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {s.fields.map(f => {
              const [k, v] = f.split(': ');
              return (
                <div key={f} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{k}</span>
                  <span style={{ color: '#E2C97E', fontSize: 11, fontWeight: 600 }}>{v}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main AdminPanel export ───────────────────────────────────────────────────
export default function AdminPanel() {
  const { user } = useAuth();
  const [params] = useState<VehicleQueryParams>({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' });
  const { vehicles, total, isLoading } = useVehicles(params);
  const [activeSection, setActiveSection] = useState<'overview' | 'inventory' | 'users' | 'analytics' | 'settings'>('overview');

  const stats = useMemo(() => {
    const value = vehicles.reduce((s, v) => s + Number(v.price) * v.quantity, 0);
    const inStock = vehicles.filter(v => v.quantity > 0).length;
    const lowStock = vehicles.filter(v => v.quantity > 0 && v.quantity <= 5).length;
    return { total: total || vehicles.length, inStock, lowStock, value };
  }, [vehicles, total]);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);

  // Map nav hrefs to section keys
  const navWithAction = NAV.map(n => ({
    ...n,
    // We handle clicks via activeSection state to avoid full page nav for sub-pages
  }));

  const SECTION_TITLES: Record<string, string> = {
    overview: 'Command Center', inventory: 'Vehicle Inventory', users: 'User Management',
    brands: 'Brand Management', bookings: 'Bookings', analytics: 'Analytics', reports: 'Reports', settings: 'System Settings'
  };

  return (
    <DashboardLayout navItems={navWithAction} role="ADMIN" title="Admin Portal" subtitle="Full System Control">
      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
        {/* Section picker tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0, flexWrap: 'wrap' }}>
          {([['overview', 'Dashboard'], ['inventory', 'Inventory'], ['users', 'Users'], ['analytics', 'Analytics'], ['settings', 'Settings']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveSection(key)} style={{
              padding: '10px 20px', background: 'transparent', border: 'none',
              borderBottom: activeSection === key ? '2px solid #e879f9' : '2px solid transparent',
              color: activeSection === key ? '#e879f9' : 'rgba(255,255,255,0.4)',
              fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: 'Inter,sans-serif', fontWeight: activeSection === key ? 700 : 400, transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeSection === 'overview' && (
          <div>
            {/* Welcome */}
            <div style={{ marginBottom: 24, padding: '24px 28px', background: 'rgba(8,12,24,0.85)',
              border: '1px solid rgba(232,121,249,0.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, background: 'rgba(232,121,249,0.06)', borderRadius: '50%', filter: 'blur(40px)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ color: '#e879f9', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>Administrator</div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>Welcome, {user?.name}</h1>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>Full system access — manage every aspect of the DIVI platform.</p>
              </div>
            </div>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 24 }}>
              <KPI label="Total Vehicles" value={stats.total} color="#e879f9" />
              <KPI label="In Stock" value={stats.inStock} color="#34d399" />
              <KPI label="Low Stock" value={stats.lowStock} color="#f59e0b" sub={stats.lowStock > 0 ? '⚠ Review needed' : 'All good'} />
              <KPI label="Total Users" value={MOCK_USERS.length} color="#38bdf8" />
              <KPI label="Inventory Value" value={fmt(stats.value)} color="#C9A84C" />
              <KPI label="Active Staff" value={MOCK_USERS.filter(u => u.role === 'STAFF').length} color="#e879f9" />
            </div>
            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {[
                { label: 'Manage Inventory', desc: 'Add, edit, restock vehicles', action: () => setActiveSection('inventory'), color: '#e879f9' },
                { label: 'Manage Users', desc: 'View, edit, remove users', action: () => setActiveSection('users'), color: '#38bdf8' },
                { label: 'View Analytics', desc: 'Stock levels, performance', action: () => setActiveSection('analytics'), color: '#C9A84C' },
                { label: 'System Settings', desc: 'Configure platform options', action: () => setActiveSection('settings'), color: '#34d399' },
              ].map(qa => {
                const [h, setH] = React.useState(false);
                return (
                  <div key={qa.label} onClick={qa.action} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                    style={{ padding: '20px 22px', background: h ? `${qa.color}10` : 'rgba(8,12,24,0.7)',
                      border: `1px solid ${h ? qa.color + '40' : 'rgba(255,255,255,0.06)'}`,
                      cursor: 'pointer', transition: 'all 0.3s', transform: h ? 'translateY(-2px)' : 'none' }}>
                    <div style={{ color: qa.color, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{qa.label}</div>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>{qa.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSection === 'inventory' && <InventoryView />}
        {activeSection === 'users' && <UsersView />}
        {activeSection === 'analytics' && <AnalyticsView vehicles={vehicles} />}
        {activeSection === 'settings' && <SettingsView />}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}
