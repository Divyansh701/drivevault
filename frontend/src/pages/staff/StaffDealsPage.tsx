import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context';
import { dealService } from '@/services';
import { Alert, ConfirmDialog, MetricCard, ActionBtn } from '@/components/ui';
import { DealFormModal } from '@/components/admin';
import type { Deal, DealQueryParams, DealStatus } from '@/types';

const NAV = [
  { label: 'Overview', href: '/staff', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg> },
  { label: 'Inventory', href: '/staff/inventory', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1" /></svg> },
  { label: 'Deals', href: '/staff/deals', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg> },
  { label: 'Bookings', href: '/staff/bookings', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
  { label: 'Enquiries', href: '/staff/enquiries', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> },
  { label: 'Analytics', href: '/staff/analytics', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg> },
];



export default function StaffDealsPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'ALL'>('ALL');
  const [isFormOpen, setFormOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dealService.getMyDeals({ page: 1, limit: 100 });
      setDeals(result.deals);
    } catch (e: any) {
      setError(e?.message || 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDeals(); }, []);

  const stats = useMemo(() => {
    const draft = deals.filter(d => d.status === 'DRAFT').length;
    const published = deals.filter(d => d.status === 'PUBLISHED').length;
    const expired = deals.filter(d => d.status === 'EXPIRED').length;
    const featured = deals.filter(d => d.isFeatured).length;
    return { total: deals.length, draft, published, expired, featured };
  }, [deals]);

  const filtered = useMemo(() => {
    let result = deals;
    if (statusFilter !== 'ALL') result = result.filter(d => d.status === statusFilter);
    const q = search.toLowerCase().trim();
    if (q) result = result.filter(d =>
      d.title.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q)) ||
      (d.vehicleMake && d.vehicleMake.toLowerCase().includes(q)) ||
      (d.vehicleModel && d.vehicleModel.toLowerCase().includes(q))
    );
    return result;
  }, [deals, statusFilter, search]);

  const handlePublish = async (id: string) => {
    try {
      await dealService.publish(id);
      setAlert({ type: 'success', text: 'Deal published successfully!' });
      loadDeals();
    } catch (e: any) {
      setAlert({ type: 'error', text: e?.message || 'Failed to publish deal' });
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await dealService.unpublish(id);
      setAlert({ type: 'success', text: 'Deal unpublished' });
      loadDeals();
    } catch (e: any) {
      setAlert({ type: 'error', text: e?.message || 'Failed to unpublish deal' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await dealService.remove(deleteId);
      setAlert({ type: 'success', text: 'Deal deleted successfully' });
      setDeleteOpen(false);
      setDeleteId(null);
      loadDeals();
    } catch (e: any) {
      setAlert({ type: 'error', text: e?.message || 'Delete failed' });
    } finally {
      setDeleting(false);
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <DashboardLayout navItems={NAV} role="STAFF" title="Staff Portal" subtitle="Deals Management">
      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
        {/* Header */}
        <div style={{ marginBottom: 24, padding: '24px 28px', background: 'rgba(8,12,24,0.8)',
          border: '1px solid rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ color: '#C9A84C', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>Staff Portal</div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fff', fontSize: 26, fontWeight: 700, margin: 0 }}>
              Deals Management
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '4px 0 0' }}>Welcome, {user?.name}</p>
          </div>
          <button onClick={() => { setEditDeal(null); setFormOpen(true); }} style={{
            background: 'linear-gradient(135deg, #C9A84C, #E2C97E)', color: '#020617', border: 'none',
            padding: '11px 24px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s',
            boxShadow: '0 0 20px rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Create Deal
          </button>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 24 }}>
          <MetricCard label="Total Deals" value={stats.total} color="#C9A84C"
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>} />
          <MetricCard label="Published" value={stats.published} color="#34d399"
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <MetricCard label="Draft" value={stats.draft} color="#f59e0b"
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>} />
          <MetricCard label="Expired" value={stats.expired} color="#ef4444"
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <MetricCard label="Featured" value={stats.featured} color="#e879f9"
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>} />
        </div>

        {/* Alert */}
        {alert && <div style={{ marginBottom: 16 }}><Alert type={alert.type} onClose={() => setAlert(null)}>{alert.text}</Alert></div>}
        {error && <div style={{ marginBottom: 16 }}><Alert type="error">Failed to load deals.</Alert></div>}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} viewBox="0 0 24 24"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deals by title, vehicle..."
              style={{ width: '100%', padding: '10px 12px 10px 34px', background: 'rgba(8,12,24,0.8)',
                border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 12,
                fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
            style={{ padding: '10px 12px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff', fontSize: 12, fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer' }}>
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{filtered.length} of {stats.total} deals</div>
        </div>

        {/* Deals Table */}
        <div style={{ background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ width: 28, height: 28, border: '2px solid rgba(201,168,76,0.3)', borderTopColor: '#C9A84C',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              Loading deals...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No deals found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    {['Deal', 'Vehicle', 'Pricing', 'Period', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.35)',
                        fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', textAlign: h === 'Actions' ? 'right' : 'left', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: '#fff', fontWeight: 600 }}>{d.title}</div>
                        {d.isFeatured && <span style={{ background: 'rgba(232,121,249,0.15)', border: '1px solid rgba(232,121,249,0.3)',
                          color: '#e879f9', fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 6px', marginTop: 4, display: 'inline-block' }}>Featured</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {d.vehicleMake && d.vehicleModel ? (
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{d.vehicleMake} {d.vehicleModel}{d.vehicleYear && ` (${d.vehicleYear})`}</div>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>Generic Deal</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: '#34d399', fontWeight: 600 }}>{fmt(d.offerPrice)}</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textDecoration: 'line-through' }}>{fmt(d.originalPrice)}</div>
                        <div style={{ color: '#C9A84C', fontSize: 9, marginTop: 2 }}>Save {d.discountType === 'PERCENTAGE' ? `${d.discountValue}%` : fmt(d.discountValue)}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>{fmtDate(d.startDate)}</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>to {fmtDate(d.endDate)}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: d.status === 'PUBLISHED' ? 'rgba(52,211,153,0.1)' : d.status === 'DRAFT' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                          border: d.status === 'PUBLISHED' ? '1px solid rgba(52,211,153,0.3)' : d.status === 'DRAFT' ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(239,68,68,0.3)',
                          color: d.status === 'PUBLISHED' ? '#34d399' : d.status === 'DRAFT' ? '#f59e0b' : '#ef4444',
                          fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 8px', display: 'inline-block' }}>
                          {d.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {d.status === 'DRAFT' && (
                            <ActionBtn color="#34d399" label="Publish" onClick={() => handlePublish(d.id)}
                              icon={<svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                          )}
                          {d.status === 'PUBLISHED' && (
                            <ActionBtn color="#f59e0b" label="Unpublish" onClick={() => handleUnpublish(d.id)}
                              icon={<svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>} />
                          )}
                          <ActionBtn color="#C9A84C" label="Edit" onClick={() => { setEditDeal(d); setFormOpen(true); }}
                            icon={<svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>} />
                          <ActionBtn color="#ef4444" label="Delete" onClick={() => { setDeleteId(d.id); setDeleteOpen(true); }}
                            icon={<svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <DealFormModal isOpen={isFormOpen} onClose={() => setFormOpen(false)} dealToEdit={editDeal}
        onSuccess={() => { setAlert({ type: 'success', text: editDeal ? 'Deal updated successfully!' : 'Deal created successfully!' }); loadDeals(); }} />
      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Delete Deal" message="Permanently remove this deal? This action cannot be undone."
        confirmText="Delete" variant="danger" isLoading={isDeleting} />
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}

