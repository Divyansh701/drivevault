import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context';

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  role: 'ADMIN' | 'STAFF' | 'VIEWER';
  title: string;
  subtitle: string;
}

// ─── Role colours ─────────────────────────────────────────────────────────────
const ROLE_COLOR = {
  ADMIN:  { primary: '#e879f9', glow: 'rgba(232,121,249,0.2)', border: 'rgba(232,121,249,0.25)' },
  STAFF:  { primary: '#C9A84C', glow: 'rgba(201,168,76,0.2)',  border: 'rgba(201,168,76,0.25)'  },
  VIEWER: { primary: '#38bdf8', glow: 'rgba(56,189,248,0.2)',  border: 'rgba(56,189,248,0.25)'  },
};

// ─── DashboardLayout ──────────────────────────────────────────────────────────
export function DashboardLayout({ children, navItems, role, title, subtitle }: DashboardLayoutProps) {
  const { user, isGuest, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const resolvedRole = (role?.toUpperCase() as keyof typeof ROLE_COLOR) ?? 'VIEWER';
  const col = ROLE_COLOR[resolvedRole] ?? ROLE_COLOR.VIEWER;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filter nav items for guests — hide personal/protected links
  const GUEST_HIDDEN_PATHS = [
    '/customer/wishlist',
    '/customer/test-drives',
    '/customer/enquiries',
    '/customer/profile',
  ];
  const visibleNavItems = isGuest
    ? navItems.filter(item => !GUEST_HIDDEN_PATHS.includes(item.href))
    : navItems;

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #C9A84C, #9A7A2E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 0 16px rgba(201,168,76,0.3)' }}>
            <span style={{ color: '#020617', fontWeight: 900, fontSize: 14 }}>D</span>
          </div>
          {!collapsed && (
            <div>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, color: '#fff' }}>
                DIVI<span style={{ color: '#C9A84C' }}>.</span>
              </span>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase' }}>{title}</div>
            </div>
          )}
        </Link>
      </div>

      {/* User pill — only shown for authenticated users */}
      {!collapsed && !isGuest && (
        <div style={{ margin: '16px 16px 8px', padding: '12px 14px',
          background: `rgba(${resolvedRole === 'ADMIN' ? '232,121,249' : resolvedRole === 'STAFF' ? '201,168,76' : '56,189,248'},0.07)`,
          border: `1px solid ${col.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: col.glow,
            border: `1px solid ${col.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: col.primary, flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name ?? 'User'}
            </div>
            <div style={{ color: col.primary, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' }}>{resolvedRole}</div>
          </div>
          <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />
        </div>
      )}

      {/* Guest pill — shown instead of user pill for unauthenticated users */}
      {!collapsed && isGuest && (
        <div style={{ margin: '16px 16px 8px', padding: '10px 14px',
          background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)',
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: '#C9A84C', flexShrink: 0 }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: '#C9A84C', fontSize: 11, fontWeight: 600 }}>Browsing as Guest</div>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textDecoration: 'none',
              letterSpacing: 0.5, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
              Sign in →
            </Link>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
        {visibleNavItems.map((item) => {
          const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '12px 10px' : '11px 14px',
                marginBottom: 2, textDecoration: 'none', transition: 'all 0.2s ease',
                background: active ? `rgba(${resolvedRole === 'ADMIN' ? '232,121,249' : resolvedRole === 'STAFF' ? '201,168,76' : '56,189,248'},0.12)` : 'transparent',
                borderLeft: active ? `2px solid ${col.primary}` : '2px solid transparent',
                color: active ? col.primary : 'rgba(255,255,255,0.5)',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = active ? col.primary : '#fff'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? col.primary : 'rgba(255,255,255,0.5)'; }}>
              <span style={{ flexShrink: 0, width: 18, height: 18 }}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, letterSpacing: 0.3, flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px',
                      background: col.glow, color: col.primary, border: `1px solid ${col.border}` }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Show Sign Out for authenticated users, Sign In for guests */}
        {isGuest ? (
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '10px' : '10px 14px',
                width: '100%', color: '#C9A84C', transition: 'all 0.2s',
                justifyContent: collapsed ? 'center' : 'flex-start', cursor: 'pointer' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              {!collapsed && <span style={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }}>Sign In</span>}
            </div>
          </Link>
        ) : (
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '10px' : '10px 14px',
              width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.35)', transition: 'all 0.2s', justifyContent: collapsed ? 'center' : 'flex-start',
              fontFamily: 'Inter, sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {!collapsed && <span style={{ fontSize: 12 }}>Sign Out</span>}
          </button>
        )}

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '10px' : '10px 14px',
            width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.2)', transition: 'all 0.2s', justifyContent: collapsed ? 'center' : 'flex-start',
            fontFamily: 'Inter, sans-serif', marginTop: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0, transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {!collapsed && <span style={{ fontSize: 11 }}>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar — Desktop */}
      <aside style={{
        width: collapsed ? 58 : 240, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
        background: 'rgba(4,8,20,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)', transition: 'width 0.3s ease', zIndex: 30,
      }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)' }} />
          <aside style={{ position: 'relative', width: 240, background: 'rgba(4,8,20,0.98)', borderRight: '1px solid rgba(255,255,255,0.08)', zIndex: 1, overflowY: 'auto' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{ height: 60, borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(4,8,20,0.8)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4, display: 'none' }}
              className="mobile-menu-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <div>
              <h1 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>{title}</h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0, letterSpacing: 0.3 }}>{subtitle}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Role badge — only for authenticated users */}
            {!isGuest && (
              <div style={{ padding: '4px 12px', background: `rgba(${resolvedRole === 'ADMIN' ? '232,121,249' : resolvedRole === 'STAFF' ? '201,168,76' : '56,189,248'},0.1)`,
                border: `1px solid ${col.border}`, color: col.primary,
                fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700 }}>
                {resolvedRole}
              </div>
            )}
            {/* Guest badge */}
            {isGuest && (
              <div style={{ padding: '4px 12px', background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C',
                fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700 }}>
                GUEST
              </div>
            )}
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
              {isGuest ? 'Browsing as Guest' : user?.name}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
      `}</style>
    </div>
  );
}
