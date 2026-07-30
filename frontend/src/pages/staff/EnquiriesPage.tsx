import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const STAFF_NAV = [
  { label: 'Overview',  href: '/staff',           icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5" /></svg> },
  { label: 'Inventory', href: '/staff/inventory', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1" /></svg> },
  { label: 'Bookings',  href: '/staff/bookings',  icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
  { label: 'Enquiries', href: '/staff/enquiries', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> },
  { label: 'Analytics', href: '/staff/analytics', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg> },
];

const ENQUIRIES = [
  { id: 'EQ001', customer: 'James Harrington', vehicle: 'Rolls-Royce Ghost', subject: 'Pricing & availability', message: 'I am interested in the Ghost Black Badge. Could you provide full pricing, available colours, and lead time?', status: 'New', date: '2024-06-14' },
  { id: 'EQ002', customer: 'Isabella Laurent', vehicle: 'Mercedes-Benz S-Class', subject: 'Finance options', message: 'Please provide details on your finance packages, including monthly payment estimates for 36 and 48 month terms.', status: 'In Progress', date: '2024-06-13' },
  { id: 'EQ003', customer: 'Alexander Voss', vehicle: 'Porsche 911 GT3 RS', subject: 'Test drive request', message: 'I would like to arrange a test drive at your earliest convenience, preferably on a weekend.', status: 'Resolved', date: '2024-06-12' },
  { id: 'EQ004', customer: 'Emma Wilson', vehicle: 'BMW M8 Competition', subject: 'Trade-in enquiry', message: 'I currently own a 2022 BMW M5 Competition. Could you provide a trade-in valuation?', status: 'New', date: '2024-06-15' },
];

const STATUS_COLOR: Record<string, string> = { New: '#38bdf8', 'In Progress': '#f59e0b', Resolved: '#34d399' };

export default function StaffEnquiriesPage() {
  const [selected, setSelected] = useState<typeof ENQUIRIES[0] | null>(null);
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState(false);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (reply.trim()) { setSent(true); setTimeout(() => { setSent(false); setReply(''); }, 2500); }
  };

  return (
    <DashboardLayout navItems={STAFF_NAV} role="STAFF" title="Staff Portal" subtitle="Customer Enquiries">
      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ marginBottom: 24, padding: '24px 28px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <div style={{ color: '#C9A84C', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>Support</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 26, fontWeight: 700, margin: 0 }}>Customer Enquiries</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ENQUIRIES.map(q => (
              <div key={q.id} onClick={() => setSelected(selected?.id === q.id ? null : q)}
                style={{ padding: '16px 18px', background: selected?.id === q.id ? 'rgba(201,168,76,0.07)' : 'rgba(8,12,24,0.8)',
                  border: `1px solid ${selected?.id === q.id ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{q.customer}</span>
                  <span style={{ color: STATUS_COLOR[q.status], fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
                    background: `${STATUS_COLOR[q.status]}12`, border: `1px solid ${STATUS_COLOR[q.status]}25`, padding: '2px 8px' }}>{q.status}</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 3 }}>{q.vehicle}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{q.subject} · {q.date}</div>
              </div>
            ))}
          </div>

          {/* Detail + reply */}
          <div style={{ padding: '24px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)', minHeight: 300 }}>
            {!selected ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, opacity: 0.2, marginBottom: 10 }}>💬</div>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Select an enquiry to view details</p>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 18, fontWeight: 600, margin: '0 0 4px' }}>{selected.customer}</h3>
                    <div style={{ color: '#C9A84C', fontSize: 11 }}>{selected.vehicle}</div>
                  </div>
                  <span style={{ color: STATUS_COLOR[selected.status], fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
                    background: `${STATUS_COLOR[selected.status]}12`, border: `1px solid ${STATUS_COLOR[selected.status]}25`, padding: '3px 10px' }}>{selected.status}</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Subject</div>
                  <div style={{ color: '#fff', fontSize: 13 }}>{selected.subject}</div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20 }}>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Message</div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{selected.message}</p>
                </div>
                <form onSubmit={handleReply}>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Reply</div>
                  <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4} placeholder="Type your response here..."
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(8,12,24,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, fontFamily: 'Inter,sans-serif', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" style={{ background: 'linear-gradient(135deg,#C9A84C,#E2C97E)', color: '#020617', border: 'none', padding: '10px 24px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                      {sent ? '✓ Sent!' : 'Send Reply'}
                    </button>
                    <button type="button" style={{ background: 'transparent', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '10px 20px', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                      Mark Resolved
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </DashboardLayout>
  );
}
