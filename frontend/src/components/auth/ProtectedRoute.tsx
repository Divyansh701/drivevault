import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context';
import type { AppRole } from '@/types';

type AllowedRole = AppRole;

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  allowedRoles?: AllowedRole[];
  /** 
   * If true, allows guests (unauthenticated users) to access the route.
   * Used for public browsing pages like vehicle listings and details.
   * Guests can view but cannot perform protected actions.
   */
  allowGuests?: boolean;
}

function Loader() {
  return (
    <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #C9A84C, #9A7A2E)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s ease-in-out infinite' }}>
        <span style={{ color: '#020617', fontWeight: 900, fontSize: 16 }}>D</span>
      </div>
      <div style={{ width: 32, height: 32, border: '2px solid rgba(201,168,76,0.3)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
    </div>
  );
}

function Unauthorized403View({ role }: { role?: string }) {
  const targetDashboard = role === 'ADMIN' ? '/admin/dashboard' : (role === 'STAFF' || role === 'DEALER') ? '/dealer/dashboard' : '/customer/dashboard';
  
  return (
    <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ padding: '48px 40px', background: 'rgba(8,12,24,0.85)', border: '1px solid rgba(239,68,68,0.3)', maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444', fontSize: 24, fontWeight: 700 }}>
          ✕
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 56, color: '#ef4444', fontWeight: 700, lineHeight: 1 }}>403</div>
        <h2 style={{ color: '#fff', fontSize: 20, margin: '16px 0 8px', fontFamily: "'Playfair Display', serif" }}>Access Forbidden</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
          Your account role (<strong style={{ color: '#C9A84C' }}>{role || 'UNKNOWN'}</strong>) does not have permission to access this resource.
        </p>
        <a href={targetDashboard} style={{ display: 'inline-block', width: '100%', padding: '13px 0', background: 'linear-gradient(135deg, #C9A84C, #9A7A2E)', color: '#020617', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, textDecoration: 'none', borderRadius: 4 }}>
          Go to Authorized Dashboard
        </a>
      </div>
    </div>
  );
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  allowedRoles,
  allowGuests = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loader />;

  // ── Guest Browsing Mode ────────────────────────────────────────────────────
  if (allowGuests && !isAuthenticated) {
    return <>{children}</>;
  }

  // ── Authentication Required ────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // ── Role-Based Access Control ──────────────────────────────────────────────
  
  // Legacy requireAdmin check
  if (requireAdmin && !isAdmin) {
    return <Unauthorized403View role={user?.role} />;
  }

  // Role whitelist check
  if (allowedRoles && user && !allowedRoles.includes(user.role as AllowedRole)) {
    return <Unauthorized403View role={user.role} />;
  }

  return <>{children}</>;
}

// ── Specific Route Guard Components ──────────────────────────────────────────

export function CustomerRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['VIEWER', 'CUSTOMER', 'STAFF', 'DEALER', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}

export function DealerRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['STAFF', 'DEALER', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}
