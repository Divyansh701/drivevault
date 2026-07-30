import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GuestBanner } from '@/components/ui';
import { useAuth } from '@/context';
import { vehicleService } from '@/services/vehicleService';
import type { Vehicle } from '@/types';

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { label: 'Showroom', href: '/customer', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
  { label: 'Wishlist', href: '/customer/wishlist', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
  { label: 'Test Drives', href: '/customer/test-drives', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
  { label: 'Enquiries', href: '/customer/enquiries', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> },
  { label: 'My Profile', href: '/customer/profile', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg> },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ padding: '20px 24px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', gap: 16, animation: 'slideUp 0.5s ease-out both' }}>
      <div style={{ width: 44, height: 44, background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color }}>{icon}</div>
      <div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Vehicle Card ─────────────────────────────────────────────────────────────
function ShowroomCard({ vehicle, wishlisted, onWishlist }: { vehicle: Vehicle; wishlisted: boolean; onWishlist: (id: string) => void }) {
  const { isGuest, showLoginPrompt, requireAuth } = useAuth();
  const [hov, setHov] = useState(false);
  const [buying, setBuying] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleBuy = async () => {
    // Check authentication before purchase
    if (!requireAuth('purchase vehicle')) {
      showLoginPrompt();
      return;
    }

    setBuying(true);
    try {
      await vehicleService.purchase(vehicle.id);
      setMsg('Purchase successful! 🎉');
    } catch (e: any) {
      setMsg(e?.message || 'Purchase failed.');
    } finally {
      setBuying(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleWishlist = () => {
    // Check authentication before adding to wishlist
    if (!requireAuth('add to wishlist')) {
      showLoginPrompt();
      return;
    }
    onWishlist(vehicle.id);
  };

  const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(vehicle.price));
  const img = vehicle.imageUrls?.[0];

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: '#080c18', border: `1px solid ${hov ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.35s ease', transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 16px 48px rgba(0,0,0,0.5)' : 'none', overflow: 'hidden' }}>
      {/* Image */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: '#0a0f1e' }}>
        {img ? (
          <img src={img} alt={`${vehicle.make} ${vehicle.model}`} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover',
              transform: hov ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.5s ease',
              filter: 'brightness(0.8)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="48" height="48" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1" /></svg>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(8,12,24,0.9) 100%)' }} />
        {/* Category tag */}
        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(56,189,248,0.12)',
          border: '1px solid rgba(56,189,248,0.3)', padding: '2px 8px' }}>
          <span style={{ color: '#38bdf8', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>{vehicle.category}</span>
        </div>
        {/* Wishlist button - disabled for guests */}
        <button onClick={handleWishlist} 
          title={isGuest ? 'Sign in to add to wishlist' : wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          style={{
            position: 'absolute', top: 10, right: 10, background: 'rgba(8,12,24,0.7)',
            border: `1px solid ${wishlisted ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)'}`,
            padding: '6px', cursor: 'pointer', transition: 'all 0.2s',
            color: wishlisted ? '#ef4444' : 'rgba(255,255,255,0.4)',
            opacity: isGuest ? 0.5 : 1 }}>
          <svg width="14" height="14" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
        {/* Stock badge */}
        <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
          {vehicle.quantity === 0
            ? <span style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', padding: '2px 8px' }}>Sold Out</span>
            : <span style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', padding: '2px 8px' }}>{vehicle.quantity} Available</span>
          }
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 18px 18px' }}>
        <div style={{ color: 'rgba(56,189,248,0.7)', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 3 }}>{vehicle.make}</div>
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 6px' }}>{vehicle.model}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{vehicle.year}</span>
          {vehicle.color && <><span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>•</span><span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{vehicle.color}</span></>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: '#E2C97E', fontSize: 18, fontWeight: 700 }}>{price}</span>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>
            {new Intl.NumberFormat('en-US').format(vehicle.mileage)} mi
          </span>
        </div>

        {msg && (
          <div style={{
            marginBottom: 10,
            padding: '8px 12px',
            fontSize: 11,
            background: msg.includes('🎉') ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${msg.includes('🎉') ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: msg.includes('🎉') ? '#34d399' : '#ef4444',
          }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/customer/vehicles/${vehicle.id}`} style={{
            flex: 1, padding: '9px 0', textAlign: 'center', textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)',
            fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.4)'; e.currentTarget.style.color = '#38bdf8'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
            Details
          </Link>
          <button onClick={handleBuy} disabled={vehicle.quantity === 0 || buying} 
            title={isGuest ? 'Sign in to purchase' : vehicle.quantity === 0 ? 'Out of stock' : 'Purchase this vehicle'}
            style={{
              flex: 2, padding: '9px 0', border: 'none', cursor: vehicle.quantity === 0 ? 'not-allowed' : 'pointer',
              background: vehicle.quantity === 0 ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
              color: vehicle.quantity === 0 ? 'rgba(255,255,255,0.2)' : '#020617',
              fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700,
              fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
              opacity: buying ? 0.7 : 1,
            }}>
            {buying ? '...' : vehicle.quantity === 0 ? 'Unavailable' : isGuest ? 'Sign In to Buy' : 'Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Customer Dashboard ───────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const { user, isGuest } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'wishlist'>('all');

  useEffect(() => {
    vehicleService.getAll({ limit: 50, sortBy: 'createdAt', sortOrder: 'desc' })
      .then(r => setVehicles(r.vehicles))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const matchQ = !q || v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.year.toString().includes(q);
    const matchCat = !category || v.category === category;
    const matchTab = activeTab === 'all' || (activeTab === 'available' && v.quantity > 0) || (activeTab === 'wishlist' && wishlist.has(v.id));
    return matchQ && matchCat && matchTab;
  });

  const inStock = vehicles.filter(v => v.quantity > 0).length;

  return (
    <DashboardLayout navItems={NAV} role={isGuest ? "VIEWER" : (user ? user.role : "VIEWER")} title="Customer Portal" subtitle="DIVI Luxury Showroom">
      {/* Guest Banner for unauthenticated users */}
      {isGuest && <GuestBanner />}
      
      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
        {/* Welcome banner */}
        <div style={{ marginBottom: 24, padding: '28px 32px', background: 'rgba(8,12,24,0.8)',
          border: '1px solid rgba(56,189,248,0.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200,
            background: 'rgba(56,189,248,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ color: '#38bdf8', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>
              {isGuest ? 'Welcome' : 'Welcome Back'}
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
              {isGuest ? 'Browse Our Collection' : (user?.name ?? 'Valued Customer')}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>
              {isGuest 
                ? 'Discover luxury vehicles from the world\'s finest brands. Sign in to save favorites and make purchases.'
                : 'Explore the world\'s finest automotive collection, curated exclusively for you.'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
          <StatCard label="Total Models" value={vehicles.length} color="#38bdf8"
            icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1" /></svg>} />
          <StatCard label="Available Now" value={inStock} color="#34d399"
            icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard label="Wishlisted" value={wishlist.size} color="#C9A84C"
            icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>} />
          <StatCard label="Test Drives" value={0} color="#e879f9"
            icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>} />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)', padding: 4 }}>
            {(['all', 'available', 'wishlist'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '7px 16px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', transition: 'all 0.2s',
                background: activeTab === tab ? 'rgba(56,189,248,0.15)' : 'transparent',
                color: activeTab === tab ? '#38bdf8' : 'rgba(255,255,255,0.4)',
                borderBottom: activeTab === tab ? '1px solid #38bdf8' : '1px solid transparent',
              }}>
                {tab === 'all' ? 'All' : tab === 'available' ? 'In Stock' : 'Wishlist'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} viewBox="0 0 24 24"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search make, model, year..."
              style={{ width: '100%', padding: '9px 12px 9px 34px', background: 'rgba(8,12,24,0.8)',
                border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 12,
                fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Category */}
          <select value={category} onChange={e => setCategory(e.target.value)} style={{
            padding: '9px 12px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff', fontSize: 12, fontFamily: 'Inter, sans-serif', cursor: 'pointer', outline: 'none' }}>
            <option value="">All Categories</option>
            {['SEDAN','SUV','TRUCK','HATCHBACK','CONVERTIBLE','COUPE','VAN','MOTORCYCLE'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 340, background: 'rgba(8,12,24,0.6)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>No vehicles found matching your criteria</div>
            <button onClick={() => { setSearch(''); setCategory(''); setActiveTab('all'); }} style={{
              marginTop: 16, background: 'transparent', border: '1px solid rgba(56,189,248,0.3)',
              color: '#38bdf8', padding: '8px 20px', cursor: 'pointer', fontSize: 11,
              letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {filtered.map(v => (
              <ShowroomCard key={v.id} vehicle={v} wishlisted={wishlist.has(v.id)} onWishlist={toggleWishlist} />
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </DashboardLayout>
  );
}
