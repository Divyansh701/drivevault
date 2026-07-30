import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Link } from 'react-router-dom';

const NAV = [
  { label: 'Showroom',       href: '/customer',            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" /></svg> },
  { label: 'Browse Vehicles', href: '/vehicles',            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1" /></svg> },
  { label: 'Wishlist',        href: '/customer/wishlist',   icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
  { label: 'Test Drives',     href: '/customer/test-drives',icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
  { label: 'Enquiries',       href: '/customer/enquiries',  icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> },
  { label: 'My Profile',      href: '/customer/profile',    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg> },
];

export default function WishlistPage() {
  return (
    <DashboardLayout navItems={NAV} role="VIEWER" title="Customer Portal" subtitle="My Wishlist">
      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ marginBottom: 24, padding: '24px 28px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(56,189,248,0.15)' }}>
          <div style={{ color: '#38bdf8', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>My Wishlist</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>Saved Vehicles</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>Vehicles you've saved for later. Add them from the showroom by clicking the heart icon.</p>
        </div>
        <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(8,12,24,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>♡</div>
          <h3 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Your wishlist is empty</h3>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 24 }}>Browse the collection and save vehicles that interest you.</p>
          <Link to="/customer" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', color: '#020617', border: 'none', padding: '12px 32px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, textDecoration: 'none', fontFamily: 'Inter,sans-serif' }}>
            Browse Showroom
          </Link>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </DashboardLayout>
  );
}
