
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useVehicles } from '@/hooks/useVehicles';

const STAFF_NAV = [
  { label: 'Overview',  href: '/staff',           icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5" /></svg> },
  { label: 'Inventory', href: '/staff/inventory', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1" /></svg> },
  { label: 'Bookings',  href: '/staff/bookings',  icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
  { label: 'Enquiries', href: '/staff/enquiries', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> },
  { label: 'Analytics', href: '/staff/analytics', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg> },
];

const CATS = ['SEDAN','SUV','TRUCK','HATCHBACK','CONVERTIBLE','COUPE','VAN','MOTORCYCLE','SUPERCAR'];
const POWERTRAINS = ['PETROL','DIESEL','ELECTRIC','HYBRID','PHEV'];

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{label}</span>
        <span style={{ color, fontSize: 11, fontWeight: 600 }}>{value} units</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

export default function StaffAnalyticsPage() {
  const { vehicles, total } = useVehicles({ page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });

  const inStock = vehicles.filter(v => v.quantity > 0).length;
  const outOfStock = vehicles.filter(v => v.quantity === 0).length;
  const lowStock = vehicles.filter(v => v.quantity > 0 && v.quantity <= 5).length;
  const totalValue = vehicles.reduce((s, v) => s + Number(v.price) * v.quantity, 0);
  const avgPrice = vehicles.length ? vehicles.reduce((s, v) => s + Number(v.price), 0) / vehicles.length : 0;

  const catData = CATS.map(c => ({ label: c, value: vehicles.filter(v => v.category === c).reduce((s, v) => s + v.quantity, 0) }));
  const maxCat = Math.max(...catData.map(c => c.value), 1);

  const ptData = POWERTRAINS.map(p => ({ label: p, value: vehicles.filter(v => v.powertrain === p).length }));
  const maxPt = Math.max(...ptData.map(p => p.value), 1);

  const fmtC = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);

  return (
    <DashboardLayout navItems={STAFF_NAV} role="STAFF" title="Staff Portal" subtitle="Analytics">
      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ marginBottom: 24, padding: '24px 28px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <div style={{ color: '#C9A84C', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>Reports</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 26, fontWeight: 700, margin: 0 }}>Inventory Analytics</h1>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Vehicles', value: total || vehicles.length, color: '#C9A84C' },
            { label: 'In Stock', value: inStock, color: '#34d399' },
            { label: 'Low Stock', value: lowStock, color: '#f59e0b' },
            { label: 'Out of Stock', value: outOfStock, color: '#ef4444' },
            { label: 'Inventory Value', value: fmtC(totalValue), color: '#e879f9' },
            { label: 'Avg. Price', value: fmtC(avgPrice), color: '#38bdf8' },
          ].map(k => (
            <div key={k.label} style={{ padding: '18px 20px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", color: k.color, fontSize: 24, fontWeight: 700 }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Category breakdown */}
          <div style={{ padding: '24px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Stock by Category</h3>
            {catData.map((c, i) => {
              const colors = ['#C9A84C','#38bdf8','#34d399','#f59e0b','#e879f9','#f87171','#a78bfa','#2dd4bf'];
              return <Bar key={c.label} label={c.label} value={c.value} max={maxCat} color={colors[i % colors.length]} />;
            })}
          </div>

          {/* Powertrain breakdown */}
          <div style={{ padding: '24px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Stock by Powertrain</h3>
            {ptData.map((p, i) => {
              const colors = ['#C9A84C','#38bdf8','#34d399','#e879f9','#f59e0b'];
              return <Bar key={p.label} label={p.label} value={p.value} max={maxPt} color={colors[i % colors.length]} />;
            })}

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Inventory Health</h4>
              {[
                { label: 'Well Stocked (>5)', count: vehicles.filter(v=>v.quantity>5).length, color: '#34d399' },
                { label: 'Low Stock (1–5)', count: lowStock, color: '#f59e0b' },
                { label: 'Out of Stock', count: outOfStock, color: '#ef4444' },
              ].map(h => (
                <div key={h.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', marginBottom: 8, background: `${h.color}08`, border: `1px solid ${h.color}18` }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{h.label}</span>
                  <span style={{ color: h.color, fontWeight: 700, fontSize: 14 }}>{h.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </DashboardLayout>
  );
}
