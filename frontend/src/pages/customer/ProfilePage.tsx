import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context';

const CUSTOMER_NAV = [
  { label: 'Showroom',       href: '/customer',             icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" /></svg> },
  { label: 'Browse Vehicles', href: '/vehicles',             icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1" /></svg> },
  { label: 'Wishlist',        href: '/customer/wishlist',    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
  { label: 'Test Drives',     href: '/customer/test-drives', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
  { label: 'Enquiries',       href: '/customer/enquiries',   icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> },
  { label: 'My Profile',      href: '/customer/profile',     icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg> },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('+1 (555) 000-0000');
  const [location, setLocation] = useState('New York, USA');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = (user?.name ?? 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DashboardLayout navItems={CUSTOMER_NAV} role="VIEWER" title="Customer Portal" subtitle="My Profile">
      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ marginBottom: 24, padding: '24px 28px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(56,189,248,0.15)' }}>
          <div style={{ color: '#38bdf8', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>Account</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 26, fontWeight: 700, margin: 0 }}>My Profile</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
          {/* Avatar card */}
          <div style={{ padding: '32px 24px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              fontSize: 28, fontWeight: 700, color: '#020617', fontFamily: "'Playfair Display',serif",
              boxShadow: '0 0 30px rgba(56,189,248,0.3)' }}>
              {initials}
            </div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 18, fontWeight: 600, margin: '0 0 4px' }}>{user?.name}</h3>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 6 }}>{user?.email}</div>
            <div style={{ display: 'inline-block', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', color: '#38bdf8', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', padding: '3px 12px', marginBottom: 24 }}>
              {user?.role === 'VIEWER' ? 'Customer' : user?.role}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[{ label: 'Member Since', value: '2024' }, { label: 'Test Drives', value: '0' }, { label: 'Enquiries', value: '3' }].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{s.label}</span>
                  <span style={{ color: '#E2C97E', fontSize: 11, fontWeight: 600 }}>{s.value}</span>
                </div>
              ))}
            </div>
            <button onClick={logout} style={{ marginTop: 20, width: '100%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '10px 0', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
              Sign Out
            </button>
          </div>

          {/* Edit form */}
          <div style={{ padding: '28px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 17, fontWeight: 600, marginBottom: 24 }}>Account Details</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Full Name', value: name, onChange: setName, placeholder: 'Your full name' },
                  { label: 'Email Address', value: user?.email ?? '', onChange: () => {}, placeholder: '', disabled: true },
                  { label: 'Phone Number', value: phone, onChange: setPhone, placeholder: '+1 (555) 000-0000' },
                  { label: 'Location', value: location, onChange: setLocation, placeholder: 'City, Country' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 7 }}>{f.label}</label>
                    <input value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                      disabled={f.disabled} readOnly={f.disabled}
                      style={{ width: '100%', padding: '10px 12px', background: f.disabled ? 'rgba(255,255,255,0.03)' : 'rgba(8,12,24,0.9)',
                        border: '1px solid rgba(255,255,255,0.1)', borderBottom: `1px solid ${f.disabled ? 'rgba(255,255,255,0.05)' : 'rgba(56,189,248,0.3)'}`,
                        color: f.disabled ? 'rgba(255,255,255,0.25)' : '#fff', fontSize: 12, fontFamily: 'Inter,sans-serif',
                        outline: 'none', boxSizing: 'border-box', cursor: f.disabled ? 'not-allowed' : 'text' }} />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 7 }}>Preferences</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Receive new arrival notifications', 'Test drive reminders', 'Exclusive member offers'].map(pref => (
                    <label key={pref} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: '#38bdf8', width: 14, height: 14 }} />
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{pref}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="submit" style={{ background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', color: '#020617', border: 'none', padding: '11px 32px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.3s' }}>
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </DashboardLayout>
  );
}
