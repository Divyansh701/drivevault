import React from 'react';

// ─── MetricCard ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}

/**
 * MetricCard — reusable dashboard metric tile.
 * Used by StaffDashboard, StaffDealsPage, and any future dashboard.
 */
export function MetricCard({ label, value, sub, color, icon }: MetricCardProps) {
  return (
    <div style={{ padding: '20px 22px', background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 38, height: 38, background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
        {sub && <span style={{ fontSize: 10, color: sub.startsWith('+') ? '#34d399' : '#ef4444', fontWeight: 600 }}>{sub}</span>}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fff', fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

// ─── ActionBtn ────────────────────────────────────────────────────────────────

interface ActionBtnProps {
  color: string;
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
}

/**
 * ActionBtn — compact table action button with hover effect.
 * Used across dealer and admin inventory/deals tables.
 */
export function ActionBtn({ color, label, onClick, icon, disabled = false }: ActionBtnProps) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={label}
      disabled={disabled}
      style={{
        padding: '5px 10px',
        background: hov && !disabled ? `${color}22` : `${color}10`,
        border: `1px solid ${color}30`,
        color: disabled ? 'rgba(255,255,255,0.2)' : color,
        fontSize: 10,
        letterSpacing: 1,
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        opacity: disabled ? 0.5 : 1,
      }}>
      {icon}{label}
    </button>
  );
}
