import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const STAFF_NAV = [
  { label: 'Overview',    href: '/staff',            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5" /></svg> },
  { label: 'Inventory',   href: '/staff/inventory',  icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-15 0v5a1 1 0 001 1h1m14-6v5a1 1 0 01-1 1h-1" /></svg> },
  { label: 'Bookings',    href: '/staff/bookings',   icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
  { label: 'Enquiries',   href: '/staff/enquiries',  icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> },
  { label: 'Analytics',   href: '/staff/analytics',  icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg> },
];

const BOOKINGS = [
  { id: 'BK001', customer: 'James Harrington', vehicle: 'Porsche 911 GT3 RS', type: 'Test Drive', date: '2024-06-18', time: '10:00 AM', status: 'Confirmed' },
  { id: 'BK002', customer: 'Isabella Laurent', vehicle: 'Mercedes-Benz S-Class AMG', type: 'Test Drive', date: '2024-06-19', time: '02:00 PM', status: 'Pending' },
  { id: 'BK003', customer: 'Alexander Voss', vehicle: 'Rolls-Royce Ghost', type: 'Viewing', date: '2024-06-20', time: '11:00 AM', status: 'Confirmed' },
  { id: 'BK004', customer: 'Sarah Blake', vehicle: 'BMW M8 Competition', type: 'Test Drive', date: '2024-06-21', time: '03:00 PM', status: 'Cancelled' },
  { id: 'BK005', customer: 'Michael Ross', vehicle: 'Audi RS e-tron GT', type: 'Viewing', date: '2024-06-22', time: '09:00 AM', status: 'Pending' },
];

const STATUS_COLOR: Record<string, string> = { Confirmed: '#34d399', Pending: '#f59e0b', Cancelled: '#ef4444' };

export default function BookingsPage() {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? BOOKINGS : BOOKINGS.filter(b => b.status === filter);

  return (
    <DashboardLayout navItems={STAFF_NAV} role="STAFF" title="Staff Portal" subtitle="Bookings">
      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ marginBottom: 24, padding: '24px 28px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(201,168,76,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ color: '#C9A84C', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>Schedule</div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontSize: 26, fontWeight: 700, margin: 0 }}>Bookings & Test Drives</h1>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['All', 'Confirmed', 'Pending', 'Cancelled'].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ padding: '7px 14px', background: filter === s ? 'rgba(201,168,76,0.15)' : 'transparent',
                border: `1px solid ${filter === s ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: filter === s ? '#C9A84C' : 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.2s' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[{ label: 'Total', value: BOOKINGS.length, color: '#C9A84C' }, { label: 'Confirmed', value: BOOKINGS.filter(b=>b.status==='Confirmed').length, color: '#34d399' }, { label: 'Pending', value: BOOKINGS.filter(b=>b.status==='Pending').length, color: '#f59e0b' }, { label: 'Cancelled', value: BOOKINGS.filter(b=>b.status==='Cancelled').length, color: '#ef4444' }].map(s => (
            <div key={s.label} style={{ padding: '16px 20px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", color: s.color, fontSize: 28, fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Booking ID', 'Customer', 'Vehicle', 'Type', 'Date & Time', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.35)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px', color: '#C9A84C', fontFamily: 'monospace', fontSize: 11 }}>{b.id}</td>
                  <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 600 }}>{b.customer}</td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>{b.vehicle}</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px' }}>{b.type}</span></td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{b.date} · {b.time}</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ background: `${STATUS_COLOR[b.status]}12`, border: `1px solid ${STATUS_COLOR[b.status]}30`, color: STATUS_COLOR[b.status], fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px' }}>{b.status}</span></td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {b.status === 'Pending' && (
                        <button style={{ padding: '4px 10px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Confirm</button>
                      )}
                      {b.status !== 'Cancelled' && (
                        <button style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </DashboardLayout>
  );
}
