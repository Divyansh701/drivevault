import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth';

// ─── Auth pages ───────────────────────────────────────────────────────────────
const LandingPage       = lazy(() => import('@/pages/LandingPage'));
const AdminLoginPage    = lazy(() => import('@/pages/auth/AdminLoginPage'));
const StaffLoginPage    = lazy(() => import('@/pages/auth/StaffLoginPage'));
const UserLoginPage     = lazy(() => import('@/pages/auth/UserLoginPage'));
const RegisterPage      = lazy(() => import('@/pages/auth/RegisterPage'));

// ─── Customer pages ───────────────────────────────────────────────────────────
const CustomerDashboard = lazy(() => import('@/pages/customer/CustomerDashboard'));
const CustomerVehicleDetailPage = lazy(() => import('@/pages/customer/VehicleDetailPage'));
const WishlistPage      = lazy(() => import('@/pages/customer/WishlistPage'));
const TestDrivesPage    = lazy(() => import('@/pages/customer/TestDrivesPage'));
const EnquiriesPage     = lazy(() => import('@/pages/customer/EnquiriesPage'));
const ProfilePage       = lazy(() => import('@/pages/customer/ProfilePage'));

// ─── Staff pages ──────────────────────────────────────────────────────────────
const StaffDashboard    = lazy(() => import('@/pages/staff/StaffDashboard'));
const StaffDealsPage    = lazy(() => import('@/pages/staff/StaffDealsPage'));
const StaffBookings     = lazy(() => import('@/pages/staff/BookingsPage'));
const StaffEnquiries    = lazy(() => import('@/pages/staff/EnquiriesPage'));
const StaffAnalytics    = lazy(() => import('@/pages/staff/AnalyticsPage'));

// ─── Admin pages ──────────────────────────────────────────────────────────────
const AdminPanel        = lazy(() => import('@/pages/admin/AdminPanel'));

// ─── Shared pages ─────────────────────────────────────────────────────────────
const DashboardPage     = lazy(() => import('@/pages/dashboard/DashboardPage'));
const VehicleDetailPage = lazy(() => import('@/pages/dashboard/VehicleDetailPage'));

// ─── Loader ───────────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#C9A84C,#9A7A2E)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 20px rgba(201,168,76,0.3)' }}>
        <span style={{ color: '#020617', fontWeight: 900, fontSize: 15 }}>D</span>
      </div>
      <div style={{ width: 28, height: 28, border: '2px solid rgba(201,168,76,0.2)',
        borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ padding: 48, background: 'rgba(8,12,24,0.8)', border: '1px solid rgba(201,168,76,0.15)' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 64, color: '#C9A84C', fontWeight: 700 }}>404</div>
        <h2 style={{ color: '#fff', fontSize: 18, marginTop: 12 }}>Page Not Found</h2>
        <a href="/" style={{ display: 'inline-block', marginTop: 20, color: '#C9A84C', fontSize: 11,
          letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none',
          borderBottom: '1px solid rgba(201,168,76,0.4)', paddingBottom: 2 }}>← Back to DIVI</a>
      </div>
    </div>
  );
}

// Helper: wrap in Suspense
const W = (El: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}><El /></Suspense>
);

// Helper: protected + Suspense (requires login)
const P = (El: React.ComponentType, roles?: Array<'ADMIN'|'STAFF'|'DEALER'|'VIEWER'|'CUSTOMER'>) => (
  <ProtectedRoute allowedRoles={roles}>
    <Suspense fallback={<PageLoader />}><El /></Suspense>
  </ProtectedRoute>
);

// Helper: guest-accessible — visible to all, enriched for authenticated users
const G = (El: React.ComponentType, roles?: Array<'ADMIN'|'STAFF'|'DEALER'|'VIEWER'|'CUSTOMER'>) => (
  <ProtectedRoute allowGuests allowedRoles={roles}>
    <Suspense fallback={<PageLoader />}><El /></Suspense>
  </ProtectedRoute>
);

// ─── Router ───────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([

  // ── Public ────────────────────────────────────────────────────────────────
  { path: '/',             element: W(LandingPage) },
  { path: '/login',        element: <Navigate to="/login/user" replace /> },
  { path: '/login/user',   element: W(UserLoginPage) },
  { path: '/login/staff',  element: W(StaffLoginPage) },
  { path: '/login/admin',  element: W(AdminLoginPage) },
  { path: '/register',     element: W(RegisterPage) },

  // ── Customer Dashboard & Browsing ──────────────────────────────────────────
  { path: '/customer',                  element: G(CustomerDashboard) },
  { path: '/customer/dashboard',        element: G(CustomerDashboard) },
  { path: '/customer/vehicles/:id',     element: G(CustomerVehicleDetailPage) },
  { path: '/customer/wishlist',         element: P(WishlistPage,    ['VIEWER','CUSTOMER','STAFF','DEALER','ADMIN']) },
  { path: '/customer/test-drives',      element: P(TestDrivesPage,  ['VIEWER','CUSTOMER','STAFF','DEALER','ADMIN']) },
  { path: '/customer/enquiries',        element: P(EnquiriesPage,   ['VIEWER','CUSTOMER','STAFF','DEALER','ADMIN']) },
  { path: '/customer/profile',          element: P(ProfilePage,     ['VIEWER','CUSTOMER','STAFF','DEALER','ADMIN']) },

  // ── Dealer / Staff Dashboard & Operations ───────────────────────────────────
  { path: '/dealer',            element: P(StaffDashboard, ['STAFF','DEALER','ADMIN']) },
  { path: '/dealer/dashboard',  element: P(StaffDashboard, ['STAFF','DEALER','ADMIN']) },
  { path: '/dealer/inventory',  element: P(StaffDashboard, ['STAFF','DEALER','ADMIN']) },
  { path: '/dealer/deals',      element: P(StaffDealsPage, ['STAFF','DEALER','ADMIN']) },
  { path: '/dealer/bookings',   element: P(StaffBookings,  ['STAFF','DEALER','ADMIN']) },
  { path: '/dealer/enquiries',  element: P(StaffEnquiries, ['STAFF','DEALER','ADMIN']) },
  { path: '/dealer/analytics',  element: P(StaffAnalytics, ['STAFF','DEALER','ADMIN']) },

  { path: '/staff',             element: P(StaffDashboard, ['STAFF','DEALER','ADMIN']) },
  { path: '/staff/inventory',   element: P(StaffDashboard, ['STAFF','DEALER','ADMIN']) },
  { path: '/staff/deals',       element: P(StaffDealsPage, ['STAFF','DEALER','ADMIN']) },
  { path: '/staff/bookings',    element: P(StaffBookings,  ['STAFF','DEALER','ADMIN']) },
  { path: '/staff/enquiries',   element: P(StaffEnquiries, ['STAFF','DEALER','ADMIN']) },
  { path: '/staff/analytics',   element: P(StaffAnalytics, ['STAFF','DEALER','ADMIN']) },

  // ── Administrator Dashboard & Platform Management ───────────────────────────
  { path: '/admin',            element: P(AdminPanel, ['ADMIN']) },
  { path: '/admin/dashboard',  element: P(AdminPanel, ['ADMIN']) },
  { path: '/admin/:section',   element: P(AdminPanel, ['ADMIN']) },

  // ── Shared vehicle catalog (all authenticated) ────────────────────────────
  { path: '/vehicles',     element: P(DashboardPage) },
  { path: '/vehicles/:id', element: P(VehicleDetailPage) },

  // ── 404 ───────────────────────────────────────────────────────────────────
  { path: '*', element: <NotFound /> },
]);
