import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const REGISTER_BG = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=90&auto=format&fit=crop';

interface AuthLayoutProps { children: ReactNode; }

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'stretch', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      {/* Full-screen background car photo */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <img src={REGISTER_BG} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', filter: 'brightness(0.4) saturate(0.75)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(2,6,23,0.7) 0%, rgba(2,6,23,0.4) 50%, rgba(2,6,23,0.6) 100%)' }} />
      </div>

      {/* Left branding panel - glassmorphism */}
      <div style={{ display: 'none', position: 'relative', zIndex: 1, width: '44%', minHeight: '100vh', padding: '56px 52px', flexDirection: 'column', justifyContent: 'space-between', background: 'rgba(2,6,23,0.35)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', borderRight: '1px solid rgba(201,168,76,0.1)' }} className="lg-panel">
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #C9A84C, #9A7A2E)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(201,168,76,0.4)' }}>
            <span style={{ color: '#020617', fontWeight: 900, fontSize: 15 }}>D</span>
          </div>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, letterSpacing: 3, color: '#fff' }}>DIVI<span style={{ color: '#C9A84C' }}>.</span></span>
        </Link>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ height: 1, width: 36, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.6))' }} />
            <span style={{ color: '#C9A84C', fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600 }}>Luxury Automotive</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.6rem', fontWeight: 700, color: '#fff', margin: '0 0 16px', lineHeight: 1.12, letterSpacing: '-0.01em' }}>
            Exceptional<br /><span style={{ background: 'linear-gradient(135deg, #E2C97E, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Vehicles</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.8, maxWidth: 340 }}>DIVI curates the world's finest automotive inventory — managed with precision, delivered with elegance.</p>
          <div style={{ height: 1, margin: '28px 0', background: 'linear-gradient(to right, rgba(201,168,76,0.35), transparent)' }} />
          {['Real-time inventory tracking', 'Secure purchase & restock flows', 'Role-based access control'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="9" height="9" fill="none" stroke="#C9A84C" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{f}</span>
            </div>
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11 }}>© {new Date().getFullYear()} DIVI Luxury Automotive</p>
      </div>

      {/* Right form panel - glassmorphism */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: 'rgba(2,6,23,0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
        <div style={{ marginBottom: 28 }} className="mobile-logo">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #C9A84C, #9A7A2E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#020617', fontWeight: 900, fontSize: 13 }}>D</span>
            </div>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, letterSpacing: 3, color: '#fff' }}>DIVI<span style={{ color: '#C9A84C' }}>.</span></span>
          </Link>
        </div>
        <div style={{ width: '100%', maxWidth: 440, animation: 'slideUp 0.5s ease-out' }}>
          {children}
        </div>
        <p style={{ marginTop: 24, color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center' }}>
          <Link to="/" style={{ color: 'rgba(201,168,76,0.5)', textDecoration: 'none' }}>← Back to DIVI</Link>
        </p>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @media (min-width: 1024px) {
          .lg-panel { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
