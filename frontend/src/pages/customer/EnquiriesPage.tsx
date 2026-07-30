import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const CUSTOMER_NAV = [
  { label: 'Showroom',       href: '/customer',             icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" /></svg> },
  { label: 'Browse Vehicles', href: '/vehicles',             icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1" /></svg> },
  { label: 'Wishlist',        href: '/customer/wishlist',    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
  { label: 'Test Drives',     href: '/customer/test-drives', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
  { label: 'Enquiries',       href: '/customer/enquiries',   icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> },
  { label: 'My Profile',      href: '/customer/profile',     icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg> },
];

const MOCK_ENQUIRIES = [
  { id: '1', vehicle: 'Mercedes-Benz S-Class AMG', subject: 'Pricing & availability', status: 'Replied', date: '2024-06-10', reply: 'Thank you for your interest! The S-Class AMG starts at $114,900. We currently have 2 in stock. A specialist will contact you shortly.' },
  { id: '2', vehicle: 'Porsche 911 GT3 RS', subject: 'Test drive request', status: 'Pending', date: '2024-06-12', reply: '' },
  { id: '3', vehicle: 'BMW M8 Competition', subject: 'Finance options', status: 'Under Review', date: '2024-06-14', reply: '' },
];

const STATUS_COLOR: Record<string, string> = { Replied: '#34d399', Pending: '#f59e0b', 'Under Review': '#38bdf8' };

export default function EnquiriesPage() {
  const [form, setForm] = useState({ vehicle: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [selected, setSelected] = useState<typeof MOCK_ENQUIRIES[0] | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.vehicle && form.message) setSent(true);
  };

  return (
    <DashboardLayout navItems={CUSTOMER_NAV} role="VIEWER" title="Customer Portal" subtitle="Enquiries">
      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ marginBottom: 24, padding: '24px 28px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(56,189,248,0.15)' }}>
          <div style={{ color: '#38bdf8', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>Support</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 26, fontWeight: 700, margin: 0 }}>My Enquiries</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Send enquiry form */}
          <div style={{ padding: '24px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 17, fontWeight: 600, marginBottom: 20 }}>New Enquiry</h3>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 12, color: '#34d399' }}>✓</div>
                <div style={{ color: '#34d399', fontSize: 15, fontWeight: 600, fontFamily: "'Playfair Display',serif", marginBottom: 8 }}>Enquiry Sent</div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Our team will respond within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ vehicle: '', subject: '', message: '' }); }}
                  style={{ marginTop: 20, background: 'transparent', border: '1px solid rgba(56,189,248,0.4)', color: '#38bdf8', padding: '9px 20px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Vehicle of Interest', key: 'vehicle', placeholder: 'e.g. Mercedes-Benz S-Class' },
                  { label: 'Subject', key: 'subject', placeholder: 'e.g. Pricing, availability, finance' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 7 }}>{f.label}</label>
                    <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(8,12,24,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(56,189,248,0.3)', color: '#fff', fontSize: 12, fontFamily: 'Inter,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 7 }}>Message</label>
                  <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={4} placeholder="How can we help you?"
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(8,12,24,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, fontFamily: 'Inter,sans-serif', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" style={{ background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', color: '#020617', border: 'none', padding: '12px 0', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  Send Enquiry
                </button>
              </form>
            )}
          </div>

          {/* History */}
          <div style={{ padding: '24px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 17, fontWeight: 600, marginBottom: 20 }}>Previous Enquiries</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MOCK_ENQUIRIES.map(q => (
                <div key={q.id} onClick={() => setSelected(selected?.id === q.id ? null : q)}
                  style={{ padding: '14px 16px', background: selected?.id === q.id ? 'rgba(56,189,248,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selected?.id === q.id ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{q.vehicle}</span>
                    <span style={{ color: STATUS_COLOR[q.status], fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700,
                      background: `${STATUS_COLOR[q.status]}15`, border: `1px solid ${STATUS_COLOR[q.status]}30`, padding: '2px 8px' }}>{q.status}</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{q.subject} · {q.date}</div>
                  {selected?.id === q.id && q.reply && (
                    <div style={{ marginTop: 12, padding: '12px', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', borderLeft: '3px solid #34d399' }}>
                      <div style={{ color: '#34d399', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>DIVI Response</div>
                      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: 0, lineHeight: 1.6 }}>{q.reply}</p>
                    </div>
                  )}
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
