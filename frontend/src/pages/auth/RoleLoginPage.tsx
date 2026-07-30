import React, { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Alert } from '@/components/ui';
import { useAuth } from '@/context';
import { authService } from '@/services';
import type { ApiError } from '@/types';

type Role = 'admin' | 'staff' | 'user';

const CFG = {
  user:  { label: 'Customer',      tagline: 'Discover & Acquire',     color: '#38bdf8', bg: 'rgba(56,189,248,0.08)',   border: 'rgba(56,189,248,0.25)' },
  staff: { label: 'Dealer',        tagline: 'Inventory Management',   color: '#C9A84C', bg: 'rgba(201,168,76,0.08)',   border: 'rgba(201,168,76,0.25)' },
  admin: { label: 'Administrator', tagline: 'System Control',         color: '#e879f9', bg: 'rgba(232,121,249,0.08)', border: 'rgba(232,121,249,0.25)' },
} as const;

// Hero backgrounds per role
const BG = {
  user:  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1400&q=80&auto=format&fit=crop',
  staff: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1400&q=80&auto=format&fit=crop',
  admin: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1400&q=80&auto=format&fit=crop',
};

function validate(email: string, password: string) {
  const e: { email?: string; password?: string } = {};
  if (!email.trim()) e.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.';
  if (!password) e.password = 'Password is required.';
  else if (password.length < 6) e.password = 'Minimum 6 characters required.';
  return e;
}

export default function RoleLoginPage({ role }: { role: Role }) {
  const cfg = CFG[role];
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Preserve destination if redirected from a protected page
  const locationFrom = (location.state as { from?: string })?.from;

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPw, setFocusPw]       = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fe = validate(email, password);
    if (Object.keys(fe).length) { setErrors(fe); return; }
    setLoading(true); setApiError(null);
    try {
      await login(email.trim(), password);
      const stored = authService.getStoredUser();
      const dest = locationFrom
        ?? (stored?.role === 'ADMIN' ? '/admin/dashboard'
          : (stored?.role === 'STAFF' || stored?.role === 'DEALER') ? '/dealer/dashboard'
          : '/customer/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      setApiError((err as ApiError).message ?? 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = (focused: boolean, hasError?: string): React.CSSProperties => ({
    width: '100%', padding: '14px 16px 14px 44px',
    background: focused ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.6)' : focused ? cfg.color : 'rgba(255,255,255,0.1)'}`,
    borderBottom: `1px solid ${hasError ? 'rgba(239,68,68,0.8)' : focused ? cfg.color : 'rgba(255,255,255,0.15)'}`,
    color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif',
    transition: 'all 0.3s ease', letterSpacing: 0.3, boxSizing: 'border-box',
    boxShadow: focused && !hasError ? `0 0 0 1px ${cfg.color}22` : 'none',
  });

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'stretch' }}>

      {/* ── Background ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <img src={BG[role]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover',
          filter: 'brightness(0.3) saturate(0.7)' }} />
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(2,6,23,0.8) 0%, rgba(2,6,23,0.6) 100%)' }} />
      </div>

      {/* ── Left brand panel ── */}
      <div style={{ position: 'relative', zIndex: 1, width: '44%', minHeight: '100vh',
        padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        borderRight: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36,
            background: 'linear-gradient(135deg, #C9A84C, #9A7A2E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(201,168,76,0.3)' }}>
            <span style={{ color: '#020617', fontWeight: 900, fontSize: 15, letterSpacing: 1 }}>D</span>
          </div>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 20, fontWeight: 700, letterSpacing: 3, color: '#fff' }}>
            DIVI<span style={{ color: '#C9A84C' }}>.</span>
          </span>
        </Link>

        {/* Role info */}
        <div style={{ animation: 'slideUp 0.6s ease-out' }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ color: cfg.color, fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600 }}>
              {cfg.tagline}
            </span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 700, color: '#fff',
            margin: '0 0 20px', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
            {cfg.label}<br />
            <span style={{ background: `linear-gradient(135deg, ${cfg.color}, rgba(255,255,255,0.7))`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Portal
            </span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, lineHeight: 1.8, maxWidth: 360 }}>
            Authenticate with your DIVI credentials to access your personalised workspace
            and manage the world's finest automotive collection.
          </p>

          {/* Divider */}
          <div style={{ height: 1, margin: '36px 0',
            background: 'linear-gradient(to right, rgba(201,168,76,0.4), transparent)' }} />

          {/* Switch portals */}
          <div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
              Other Portals
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(CFG).filter(([k]) => k !== role).map(([k, v]) => (
                <Link key={k} to={`/login/${k}`} style={{
                  color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 2,
                  textTransform: 'uppercase', textDecoration: 'none',
                  padding: '8px 16px', border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = v.color; e.currentTarget.style.borderColor = v.border; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  {v.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11 }}>
          © {new Date().getFullYear()} DIVI Luxury Automotive
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 40px' }}>

        <div style={{ width: '100%', maxWidth: 420, animation: 'slideUp 0.5s ease-out' }}>
          {/* Glass card */}
          <div style={{
            background: 'rgba(8,12,24,0.75)',
            backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            border: `1px solid ${cfg.border}`,
            padding: '44px 40px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}>
            {/* Role badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              padding: '6px 14px', marginBottom: 28 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color,
                boxShadow: `0 0 8px ${cfg.color}` }} />
              <span style={{ color: cfg.color, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600 }}>
                {cfg.label}
              </span>
            </div>

            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 28, fontWeight: 600, color: '#fff', margin: '0 0 6px', letterSpacing: 0.3 }}>
              Welcome back
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: '0 0 32px', letterSpacing: 0.2 }}>
              Sign in to your {cfg.label.toLowerCase()} account
            </p>

            {apiError && (
              <div style={{ marginBottom: 24 }}>
                <Alert type="error" onDismiss={() => setApiError(null)}>{apiError}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 10,
                  letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: focusEmail ? cfg.color : 'rgba(255,255,255,0.25)', transition: 'color 0.3s' }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  <input type="email" value={email} placeholder="you@divi.com"
                    style={inputStyle(focusEmail, errors.email)}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: undefined})); setApiError(null); }}
                    onFocus={() => setFocusEmail(true)} onBlur={() => setFocusEmail(false)} />
                </div>
                {errors.email && <p style={{ color: 'rgba(239,68,68,0.9)', fontSize: 11, marginTop: 6 }}>{errors.email}</p>}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 10,
                  letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: focusPw ? cfg.color : 'rgba(255,255,255,0.25)', transition: 'color 0.3s' }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </span>
                  <input type={showPw ? 'text' : 'password'} value={password} placeholder="••••••••"
                    style={{ ...inputStyle(focusPw, errors.password), paddingRight: 44 }}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: undefined})); setApiError(null); }}
                    onFocus={() => setFocusPw(true)} onBlur={() => setFocusPw(false)} />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)', padding: 0, transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = cfg.color)}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      {showPw
                        ? <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      }
                    </svg>
                  </button>
                </div>
                {errors.password && <p style={{ color: 'rgba(239,68,68,0.9)', fontSize: 11, marginTop: 6 }}>{errors.password}</p>}
              </div>

              {/* Forgot */}
              <div style={{ textAlign: 'right', marginBottom: 28 }}>
                <span style={{ color: 'rgba(201,168,76,0.6)', fontSize: 11, cursor: 'pointer',
                  letterSpacing: 0.3, borderBottom: '1px solid rgba(201,168,76,0.3)', paddingBottom: 1 }}>
                  Forgot password?
                </span>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '15px 0', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(201,168,76,0.4)' : `linear-gradient(135deg, ${cfg.color === '#C9A84C' ? '#C9A84C, #E2C97E' : cfg.color + ', ' + cfg.color + 'cc'})`,
                color: cfg.color === '#C9A84C' ? '#020617' : '#fff',
                fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700,
                fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease',
                boxShadow: `0 0 24px ${cfg.color}30`,
                opacity: loading ? 0.7 : 1,
              }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = `0 0 40px ${cfg.color}50`; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 24px ${cfg.color}30`; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {loading
                  ? <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid currentColor',
                      borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  : `Sign In as ${cfg.label}`}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>
                New to DIVI?
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <Link to="/register" style={{
              display: 'block', textAlign: 'center', padding: '13px 0', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)',
              fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 500,
              transition: 'all 0.3s ease', fontFamily: 'Inter, sans-serif',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.border; e.currentTarget.style.color = cfg.color; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}>
              Create Account
            </Link>
          </div>

          {/* Back link */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11,
              letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(201,168,76,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>
              ← Back to DIVI
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
}
