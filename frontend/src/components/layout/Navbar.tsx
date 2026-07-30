import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';

export const Navbar: React.FC = () => {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-surface-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #C9A84C, #9A7A2E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(201,168,76,0.3)',
          }}>
            <span style={{ color: '#020617', fontWeight: 900, fontSize: 15, letterSpacing: 1 }}>D</span>
          </div>
          <div>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, letterSpacing: 3, color: '#fff' }}>
              DIVI<span style={{ color: '#C9A84C' }}>.</span>
            </span>
            <span className="block text-[10px] text-surface-400 uppercase tracking-widest font-semibold">Luxury Automotive</span>
          </div>
        </Link>

        {/* Navigation & User actions */}
        <div className="flex items-center gap-4">
          {/* Guest Mode - Show Browse Cars + Auth buttons */}
          {isGuest && (
            <>
              <Link to="/customer" className="hidden sm:block">
                <Button variant="ghost" className="text-xs py-1.5 px-3">
                  Browse Cars
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="primary" className="text-xs py-1.5 px-3">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" className="hidden sm:block">
                <Button variant="ghost" className="text-xs py-1.5 px-3">
                  Register
                </Button>
              </Link>
            </>
          )}

          {/* Authenticated User - Show profile and dashboard */}
          {!isGuest && user && (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-900 border border-white/5 text-xs text-surface-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{user.name}</span>
                <span className="text-surface-500">|</span>
                <span className="uppercase text-[10px] font-bold text-brand-400">{user.role}</span>
              </div>

              {user.role === 'ADMIN' && (
                <Link to="/admin/dashboard">
                  <Button variant="ghost" className="text-xs py-1.5 px-3">
                    Admin Dashboard
                  </Button>
                </Link>
              )}

              {(user.role === 'STAFF' || user.role === 'DEALER') && (
                <Link to="/dealer/dashboard">
                  <Button variant="ghost" className="text-xs py-1.5 px-3">
                    Dealer Dashboard
                  </Button>
                </Link>
              )}

              {(user.role === 'VIEWER' || user.role === 'CUSTOMER') && (
                <Link to="/customer/dashboard">
                  <Button variant="ghost" className="text-xs py-1.5 px-3">
                    Customer Portal
                  </Button>
                </Link>
              )}

              <Button variant="ghost" onClick={handleLogout} className="text-xs py-1.5 px-3">
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
