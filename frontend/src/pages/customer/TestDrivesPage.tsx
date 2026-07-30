import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const NAV = [
  { label: 'Showroom',       href: '/customer',             icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" /></svg> },
  { label: 'Browse Vehicles', href: '/vehicles',             icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1" /></svg> },
  { label: 'Wishlist',        href: '/customer/wishlist',    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
  { label: 'Test Drives',     href: '/customer/test-drives', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
  { label: 'Enquiries',       href: '/customer/enquiries',   icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> },
  { label: 'My Profile',      href: '/customer/profile',     icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg> },
];

const TIMES = ['09:00 AM','10:00 AM','11:00 AM','01:00 PM','02:00 PM','03:00 PM','04:00 PM'];
const CARS = ['Mercedes-Benz S-Class AMG','BMW M8 Competition','Porsche 911 GT3 RS','Range Rover SV Autobiography','Audi RS e-tron GT','Rolls-Royce Ghost Black Badge'];

export default function TestDrivesPage() {
  const [form, setForm] = useState({ car: '', date: '', time: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.car && form.date && form.time) setSubmitted(true);
  };

  return (
    <DashboardLayout navItems={NAV} role="VIEWER" title="Customer Portal" subtitle="Test Drives">
      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ marginBottom: 24, padding: '24px 28px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(56,189,248,0.15)' }}>
          <div style={{ color: '#38bdf8', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>Experience</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 26, fontWeight: 700, margin: 0 }}>Book a Test Drive</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Booking form */}
          <div style={{ padding: '28px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Schedule Your Experience</h3>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                <div style={{ color: '#34d399', fontSize: 16, fontWeight: 600, fontFamily: "'Playfair Display',serif", marginBottom: 8 }}>Booking Confirmed</div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>We'll contact you to confirm your test drive appointment.</p>
                <button onClick={() => setSubmitted(false)} style={{ marginTop: 20, background: 'transparent', border: '1px solid rgba(56,189,248,0.4)', color: '#38bdf8', padding: '10px 24px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Book Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Select Vehicle', type: 'select', key: 'car', options: CARS },
                  { label: 'Preferred Date', type: 'date', key: 'date' },
                  { label: 'Preferred Time', type: 'select', key: 'time', options: TIMES },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(8,12,24,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(56,189,248,0.3)', color: '#fff', fontSize: 12, fontFamily: 'Inter,sans-serif', outline: 'none' }}>
                        <option value="">Choose…</option>
                        {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(8,12,24,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(56,189,248,0.3)', color: '#fff', fontSize: 12, fontFamily: 'Inter,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                    )}
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Additional Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3}
                    placeholder="Any special requirements..."
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(8,12,24,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, fontFamily: 'Inter,sans-serif', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" style={{ background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', color: '#020617', border: 'none', padding: '13px 0', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  Request Test Drive
                </button>
              </form>
            )}
          </div>

          {/* Info panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '🚗', title: 'Choose Your Model', desc: 'Select from our full collection of luxury vehicles available for test drives at our showroom.' },
              { icon: '📅', title: 'Pick a Date & Time', desc: 'Our concierge team is available Monday–Saturday, 9AM to 5PM for private appointments.' },
              { icon: '✦', title: 'White-Glove Experience', desc: 'A dedicated DIVI specialist will accompany you and answer all questions about your chosen vehicle.' },
              { icon: '📞', title: 'Confirmation', desc: 'You will receive a confirmation call within 2 hours of booking to finalise your appointment.' },
            ].map(item => (
              <div key={item.title} style={{ padding: '18px 20px', background: 'rgba(8,12,24,0.7)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 14 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </DashboardLayout>
  );
}
