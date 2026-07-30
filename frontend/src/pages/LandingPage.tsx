import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context';

// ─── Data ─────────────────────────────────────────────────────────────────────
const CARS = [
  { brand: 'Mercedes-Benz', model: 'S-Class AMG', year: 2024, price: 'From $114,900', tag: 'Executive Sedan', img: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80&auto=format&fit=crop' },
  { brand: 'BMW', model: 'M8 Competition', year: 2024, price: 'From $131,900', tag: 'Grand Tourer', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80&auto=format&fit=crop' },
  { brand: 'Porsche', model: '911 GT3 RS', year: 2024, price: 'From $243,900', tag: 'Sports Icon', img: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80&auto=format&fit=crop' },
  { brand: 'Range Rover', model: 'SV Autobiography', year: 2024, price: 'From $176,900', tag: 'Luxury SUV', img: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80&auto=format&fit=crop' },
  { brand: 'Audi', model: 'RS e-tron GT', year: 2024, price: 'From $147,900', tag: 'Electric GT', img: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=800&q=80&auto=format&fit=crop' },
  { brand: 'Rolls-Royce', model: 'Ghost Black Badge', year: 2024, price: 'From $340,000', tag: 'Ultra Luxury', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80&auto=format&fit=crop' },
];

const HERO_BG = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=90&auto=format&fit=crop';
const ARRIVALS_BG = 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&q=80&auto=format&fit=crop';

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onSignInClick }: { onSignInClick: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const targetDashboard = user?.role === 'ADMIN'
    ? '/admin/dashboard'
    : (user?.role === 'STAFF' || user?.role === 'DEALER')
    ? '/dealer/dashboard'
    : '/customer/dashboard';

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.4s ease',
      background: scrolled ? 'rgba(2,6,23,0.94)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(201,168,76,0.15)' : '1px solid transparent',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #C9A84C, #9A7A2E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(201,168,76,0.3)' }}>
            <span style={{ color: '#020617', fontWeight: 900, fontSize: 15 }}>D</span>
          </div>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, letterSpacing: 3, color: '#fff' }}>
            DIVI<span style={{ color: '#C9A84C' }}>.</span>
          </span>
        </Link>
        <nav style={{ display: 'flex', gap: 36 }}>
          {['Collection', 'Brands', 'Services', 'Contact'].map(n => (
            <a key={n} href={`#${n.toLowerCase()}`} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11,
              letterSpacing: 2, textTransform: 'uppercase', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
              {n}
            </a>
          ))}
        </nav>
        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to={targetDashboard} style={{
              background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.4)',
              color: '#C9A84C', padding: '9px 18px', fontSize: 11, letterSpacing: 2,
              textTransform: 'uppercase', fontWeight: 600, textDecoration: 'none',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
              {user.name} ({user.role})
            </Link>
            <button onClick={handleSignOut} style={{
              background: 'transparent', border: '1px solid rgba(239,68,68,0.4)',
              color: '#ef4444', padding: '9px 18px', fontSize: 11, letterSpacing: 2,
              textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(239,68,68,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}>
              Sign Out
            </button>
          </div>
        ) : (
          <button onClick={onSignInClick} style={{
            background: 'transparent', border: '1px solid rgba(201,168,76,0.6)',
            color: '#C9A84C', padding: '10px 28px', fontSize: 11, letterSpacing: 2,
            textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(201,168,76,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onExploreClick }: { onExploreClick: () => void }) {
  return (
    <section style={{ position: 'relative', height: '100vh', minHeight: 700, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <img src={HERO_BG} alt="" fetchPriority="high" style={{ width: '100%', height: '100%', objectFit: 'cover',
          objectPosition: 'center', filter: 'brightness(0.42) saturate(0.8)' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,6,23,0.08) 0%, rgba(2,6,23,0.45) 50%, #020617 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(2,6,23,0.55) 0%, transparent 40%, transparent 60%, rgba(2,6,23,0.55) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', animation: 'fadeIn 1.2s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ height: 1, width: 48, background: 'linear-gradient(to right, transparent, #C9A84C)' }} />
          <span style={{ color: '#C9A84C', fontSize: 10, letterSpacing: 5, fontWeight: 600, textTransform: 'uppercase' }}>Premium Inventory Management</span>
          <div style={{ height: 1, width: 48, background: 'linear-gradient(to left, transparent, #C9A84C)' }} />
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(3rem,7vw,7rem)',
          fontWeight: 700, lineHeight: 1.05, color: '#fff', marginBottom: 24, letterSpacing: '-0.01em' }}>
          The Art of<br />
          <span style={{ background: 'linear-gradient(135deg, #E2C97E, #C9A84C, #9A7A2E)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Exceptional
          </span>{' '}Vehicles
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 15, maxWidth: 480, lineHeight: 1.8, marginBottom: 52, letterSpacing: 0.3, fontWeight: 300 }}>
          DIVI curates the world's finest automotive collection. Discover, acquire, and manage luxury vehicles with unparalleled precision.
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={onExploreClick} style={{
            background: 'linear-gradient(135deg, #C9A84C, #E2C97E)', color: '#020617', border: 'none',
            padding: '16px 44px', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease',
            boxShadow: '0 0 30px rgba(201,168,76,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 50px rgba(201,168,76,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(201,168,76,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            Explore Collection
          </button>
          <a href="#collection" style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.25)',
            color: 'rgba(255,255,255,0.8)', padding: '16px 44px', fontSize: 11, letterSpacing: 3,
            textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            transition: 'all 0.3s ease', textDecoration: 'none', display: 'inline-block' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.color = '#C9A84C'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}>
            View Models
          </a>
        </div>
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'float 2.5s ease-in-out infinite' }}>
          <span style={{ color: 'rgba(201,168,76,0.6)', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(201,168,76,0.6), transparent)' }} />
        </div>
      </div>
    </section>
  );
}

// ─── AnimatedStats ────────────────────────────────────────────────────────────
function AnimatedStats() {
  const { ref, visible } = useReveal();
  const stats = [
    { value: '500+', label: 'Cars in Stock' },
    { value: '50+', label: 'Premium Brands' },
    { value: '10K+', label: 'Happy Customers' },
    { value: '2K+', label: 'Vehicles Sold' },
  ];
  return (
    <section ref={ref} style={{ borderTop: '1px solid rgba(201,168,76,0.12)', borderBottom: '1px solid rgba(201,168,76,0.12)',
      background: 'rgba(201,168,76,0.03)', padding: '72px 0',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center',
            animation: visible ? `countUp 0.6s ease-out ${i * 0.15}s both` : 'none' }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 48, fontWeight: 700, lineHeight: 1,
              background: 'linear-gradient(135deg, #E2C97E, #C9A84C)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 10 }}>
              {s.value}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Car Card ─────────────────────────────────────────────────────────────────
function CarCard({ car, onViewDetails }: { car: typeof CARS[0]; onViewDetails: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer',
        background: '#080c18', border: `1px solid ${hovered ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.4s ease', transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 24px 60px rgba(0,0,0,0.6), 0 0 30px rgba(201,168,76,0.15)' : '0 8px 30px rgba(0,0,0,0.4)' }}>
      <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
        <img src={car.img} alt={`${car.brand} ${car.model}`} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease',
            transform: hovered ? 'scale(1.07)' : 'scale(1)', filter: 'brightness(0.85) contrast(1.1)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(8,12,24,0.95) 100%)' }} />
        <div style={{ position: 'absolute', top: 16, left: 16,
          background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)',
          padding: '4px 12px', backdropFilter: 'blur(8px)' }}>
          <span style={{ color: '#C9A84C', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600 }}>{car.tag}</span>
        </div>
      </div>
      <div style={{ padding: '20px 24px 24px' }}>
        <span style={{ color: 'rgba(201,168,76,0.7)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 500 }}>{car.brand}</span>
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 600, color: '#fff', margin: '4px 0 12px', letterSpacing: 0.3 }}>{car.model}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Starting at</div>
            <div style={{ color: '#E2C97E', fontSize: 16, fontWeight: 600 }}>{car.price}</div>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{car.year}</span>
        </div>
        <div style={{ height: 1, margin: '16px 0', background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)' }} />
        <button onClick={onViewDetails} style={{
          width: '100%', background: 'transparent',
          border: `1px solid ${hovered ? 'rgba(201,168,76,0.7)' : 'rgba(255,255,255,0.1)'}`,
          color: hovered ? '#C9A84C' : 'rgba(255,255,255,0.6)',
          padding: '10px 0', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: 'Inter, sans-serif' }}>
          View Details
        </button>
      </div>
    </div>
  );
}

// ─── FeaturedCollection ───────────────────────────────────────────────────────
function FeaturedCollection({ onViewDetails }: { onViewDetails: () => void }) {
  const { ref, visible } = useReveal();
  return (
    <section id="collection" ref={ref} style={{ background: '#020617', padding: '100px 0',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 64, padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ height: 1, width: 40, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.5))' }} />
          <span style={{ color: '#C9A84C', fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600 }}>The Collection</span>
          <div style={{ height: 1, width: 40, background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.5))' }} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem,4vw,3.5rem)',
          fontWeight: 700, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.01em' }}>Curated Excellence</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
          Each vehicle is selected for its exceptional craftsmanship, performance, and enduring prestige.
        </p>
      </div>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
        {CARS.map((car, i) => <CarCard key={i} car={car} onViewDetails={onViewDetails} />)}
      </div>
    </section>
  );
}

// ─── PopularBrands ────────────────────────────────────────────────────────────
function PopularBrands() {
  const { ref, visible } = useReveal();
  const brands = ['Mercedes', 'BMW', 'Audi', 'Porsche', 'Land Rover', 'Rolls-Royce'];
  return (
    <section id="brands" ref={ref} style={{ background: 'rgba(8,12,24,0.9)', padding: '80px 0',
      borderTop: '1px solid rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.1)',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <span style={{ color: '#C9A84C', fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600 }}>Popular Brands</span>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem,3vw,2.8rem)',
          fontWeight: 700, color: '#fff', margin: '12px 0 0' }}>World-Class Marques</h2>
      </div>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {brands.map((brand, i) => {
          const [hov, setHov] = useState(false);
          return (
            <div key={brand} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
              style={{ padding: '32px 16px', textAlign: 'center', cursor: 'pointer',
                background: hov ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${hov ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.3s ease', transform: hov ? 'translateY(-4px)' : 'translateY(0)',
                animation: visible ? `slideUp 0.5s ease-out ${i * 0.08}s both` : 'none' }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 600,
                color: hov ? '#C9A84C' : 'rgba(255,255,255,0.65)', transition: 'color 0.3s', letterSpacing: 1 }}>
                {brand}
              </div>
              <div style={{ marginTop: 8, height: 1, background: hov ? 'linear-gradient(to right, transparent, rgba(201,168,76,0.5), transparent)' : 'transparent', transition: 'background 0.3s' }} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── LatestArrivals ───────────────────────────────────────────────────────────
function LatestArrivals({ onViewDetails }: { onViewDetails: () => void }) {
  const { ref, visible } = useReveal();
  const arrivals = [
    { brand: 'Bentley', model: 'Continental GT Speed', year: 2024, price: 'From $274,900', tag: 'New Arrival', img: ARRIVALS_BG },
    { brand: 'Ferrari', model: 'Roma Spider', year: 2024, price: 'From $268,000', tag: 'Just Landed', img: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&q=80&auto=format&fit=crop' },
    { brand: 'Lamborghini', model: 'Urus Performante', year: 2024, price: 'From $247,000', tag: 'Limited Stock', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop' },
  ];
  return (
    <section ref={ref} style={{ background: '#020617', padding: '100px 0',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 56, padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ height: 1, width: 40, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.5))' }} />
          <span style={{ color: '#C9A84C', fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600 }}>Latest Arrivals</span>
          <div style={{ height: 1, width: 40, background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.5))' }} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: '#fff', margin: 0 }}>Freshly Curated</h2>
      </div>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {arrivals.map((car, i) => {
          const [hov, setHov] = useState(false);
          return (
            <div key={i} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
              style={{ display: 'flex', alignItems: 'stretch', overflow: 'hidden', cursor: 'pointer',
                background: '#080c18', border: `1px solid ${hov ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.05)'}`,
                transition: 'all 0.4s ease', transform: hov ? 'translateY(-3px)' : 'translateY(0)',
                boxShadow: hov ? '0 16px 48px rgba(0,0,0,0.5)' : 'none',
                animation: visible ? `slideUp 0.5s ease-out ${i * 0.12}s both` : 'none' }}>
              <div style={{ width: 280, flexShrink: 0, overflow: 'hidden' }}>
                <img src={car.img} alt={`${car.brand} ${car.model}`} loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover',
                    transform: hov ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.5s ease' }} />
              </div>
              <div style={{ flex: 1, padding: '28px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
                    color: '#C9A84C', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600, padding: '3px 10px' }}>{car.tag}</span>
                </div>
                <span style={{ color: 'rgba(201,168,76,0.7)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}>{car.brand}</span>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 600, color: '#fff', margin: '4px 0 8px' }}>{car.model}</h3>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{car.year} Model Year</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                  <span style={{ color: '#E2C97E', fontSize: 18, fontWeight: 600 }}>{car.price}</span>
                  <button onClick={onViewDetails} style={{
                    background: hov ? 'linear-gradient(135deg, #C9A84C, #E2C97E)' : 'transparent',
                    border: '1px solid rgba(201,168,76,0.5)', color: hov ? '#020617' : '#C9A84C',
                    padding: '10px 24px', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' }}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── WhyChooseDIVI ────────────────────────────────────────────────────────────
function WhyChooseDIVI() {
  const { ref, visible } = useReveal();
  const features = [
    { title: 'Curated Collection', desc: 'Every vehicle is handpicked by our team of luxury automotive experts for exceptional quality and pedigree.', icon: '◆' },
    { title: 'Certified Quality', desc: 'Multi-point inspection and full certification on every vehicle, backed by documented service history.', icon: '✦' },
    { title: 'White-Glove Service', desc: 'Dedicated concierge support from first enquiry to final delivery, tailored to your lifestyle.', icon: '★' },
    { title: 'Transparent Pricing', desc: 'No hidden fees. Clear, honest pricing with full documentation at every step of the process.', icon: '◈' },
  ];
  return (
    <section ref={ref} style={{ background: 'rgba(8,12,24,0.95)', padding: '100px 0',
      borderTop: '1px solid rgba(201,168,76,0.1)',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ height: 1, width: 40, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.5))' }} />
            <span style={{ color: '#C9A84C', fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600 }}>Why DIVI</span>
            <div style={{ height: 1, width: 40, background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.5))' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: '#fff', margin: 0 }}>The DIVI Difference</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {features.map((f, i) => {
            const [hov, setHov] = useState(false);
            return (
              <div key={i} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                style={{ padding: '36px 28px', background: hov ? 'rgba(201,168,76,0.05)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${hov ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.06)'}`,
                  transition: 'all 0.3s ease', transform: hov ? 'translateY(-4px)' : 'translateY(0)',
                  animation: visible ? `slideUp 0.5s ease-out ${i * 0.1}s both` : 'none' }}>
                <div style={{ fontSize: 28, color: '#C9A84C', marginBottom: 20, animation: hov ? 'float 2s ease-in-out infinite' : 'none' }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 600, color: '#fff', margin: '0 0 12px' }}>{f.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── PremiumServices ──────────────────────────────────────────────────────────
function PremiumServices() {
  const { ref, visible } = useReveal();
  const services = [
    { title: 'Finance Solutions', desc: 'Tailored financing packages with competitive rates for every acquisition.', icon: (
      <svg width="32" height="32" fill="none" stroke="#C9A84C" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
    )},
    { title: 'Trade-In Program', desc: 'Get maximum value for your current vehicle with our premium trade-in appraisal service.', icon: (
      <svg width="32" height="32" fill="none" stroke="#C9A84C" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
    )},
    { title: 'Extended Warranty', desc: 'Comprehensive protection plans that keep your luxury investment worry-free.', icon: (
      <svg width="32" height="32" fill="none" stroke="#C9A84C" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
    )},
    { title: 'Certified Pre-Owned', desc: 'Rigorous 150-point inspection process ensures every certified vehicle meets our elite standards.', icon: (
      <svg width="32" height="32" fill="none" stroke="#C9A84C" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
    )},
  ];
  return (
    <section id="services" ref={ref} style={{ background: '#020617', padding: '100px 0',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ height: 1, width: 40, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.5))' }} />
            <span style={{ color: '#C9A84C', fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600 }}>Premium Services</span>
            <div style={{ height: 1, width: 40, background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.5))' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: '#fff', margin: 0 }}>Complete Ownership Experience</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {services.map((s, i) => {
            const [hov, setHov] = useState(false);
            return (
              <div key={i} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                style={{ padding: '40px 28px', background: hov ? 'rgba(201,168,76,0.05)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${hov ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.06)'}`,
                  transition: 'all 0.3s ease', transform: hov ? 'translateY(-4px)' : 'translateY(0)',
                  animation: visible ? `slideUp 0.5s ease-out ${i * 0.1}s both` : 'none' }}>
                <div style={{ marginBottom: 20, opacity: hov ? 1 : 0.7, transition: 'opacity 0.3s' }}>{s.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 600, color: '#fff', margin: '0 0 12px' }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
  const { ref, visible } = useReveal();
  const reviews = [
    { name: 'Alexander Voss', role: 'Entrepreneur', quote: 'DIVI delivered a seamless experience from initial enquiry to the moment my Rolls-Royce arrived. Unmatched attention to detail.' },
    { name: 'Isabella Laurent', role: 'Executive', quote: 'The inventory management system is exceptional. I can track every vehicle, process purchases, and manage my fleet all from one platform.' },
    { name: 'James Harrington', role: 'Collector', quote: "I've purchased three vehicles through DIVI. Each transaction was handled with professionalism and the kind of discretion you'd expect at this level." },
  ];
  return (
    <section ref={ref} style={{ background: 'rgba(8,12,24,0.95)', padding: '100px 0',
      borderTop: '1px solid rgba(201,168,76,0.1)',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ height: 1, width: 40, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.5))' }} />
            <span style={{ color: '#C9A84C', fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600 }}>Client Voices</span>
            <div style={{ height: 1, width: 40, background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.5))' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: '#fff', margin: 0 }}>What Our Clients Say</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {reviews.map((r, i) => {
            const [hov, setHov] = useState(false);
            return (
              <div key={i} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                style={{ padding: '36px 28px', background: hov ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${hov ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  transition: 'all 0.3s ease',
                  animation: visible ? `slideUp 0.5s ease-out ${i * 0.12}s both` : 'none' }}>
                <div style={{ color: '#C9A84C', fontSize: 36, lineHeight: 1, marginBottom: 16, opacity: 0.6 }}>"</div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.8, margin: '0 0 24px', fontStyle: 'italic' }}>
                  {r.quote}
                </p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 600, color: '#fff' }}>{r.name}</div>
                  <div style={{ color: 'rgba(201,168,76,0.6)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{r.role}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── CTASection ───────────────────────────────────────────────────────────────
function CTASection({ onSignInClick }: { onSignInClick: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { ref, visible } = useReveal();

  const targetDashboard = user?.role === 'ADMIN'
    ? '/admin/dashboard'
    : (user?.role === 'STAFF' || user?.role === 'DEALER')
    ? '/dealer/dashboard'
    : '/customer/dashboard';

  return (
    <section ref={ref} style={{ position: 'relative', padding: '100px 24px', textAlign: 'center', overflow: 'hidden',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(2,6,23,0.95) 50%, rgba(201,168,76,0.05) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, borderTop: '1px solid rgba(201,168,76,0.15)', borderBottom: '1px solid rgba(201,168,76,0.15)' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ height: 1, width: 40, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.5))' }} />
          <span style={{ color: '#C9A84C', fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600 }}>Begin Your Journey</span>
          <div style={{ height: 1, width: 40, background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.5))' }} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.2rem,5vw,4rem)',
          fontWeight: 700, color: '#fff', margin: '0 0 20px', lineHeight: 1.1 }}>
          Ready to Drive<br />
          <span style={{ background: 'linear-gradient(135deg, #E2C97E, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Excellence?
          </span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.8, marginBottom: 40 }}>
          {isAuthenticated && user
            ? `Welcome back, ${user.name}. Access your personalized dashboard or explore the catalog.`
            : "Join thousands of discerning clients who trust DIVI to manage and acquire the world's finest vehicles."}
        </p>
        {isAuthenticated && user ? (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate(targetDashboard)} style={{
              background: 'linear-gradient(135deg, #C9A84C, #E2C97E)', color: '#020617', border: 'none',
              padding: '16px 40px', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease',
              boxShadow: '0 0 40px rgba(201,168,76,0.3)' }}>
              Go to Dashboard ({user.role})
            </button>
            <button onClick={() => { logout(); navigate('/'); }} style={{
              background: 'transparent', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444',
              padding: '16px 36px', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase',
              fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' }}>
              Sign Out
            </button>
          </div>
        ) : (
          <button onClick={onSignInClick} style={{
            background: 'linear-gradient(135deg, #C9A84C, #E2C97E)', color: '#020617', border: 'none',
            padding: '18px 56px', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease',
            boxShadow: '0 0 40px rgba(201,168,76,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 60px rgba(201,168,76,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(201,168,76,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            Access the Platform
          </button>
        )}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };
  return (
    <footer style={{ background: '#010408', borderTop: '1px solid rgba(201,168,76,0.1)', padding: '72px 32px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 48, marginBottom: 56 }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #C9A84C, #9A7A2E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#020617', fontWeight: 900, fontSize: 13 }}>D</span>
              </div>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, letterSpacing: 3, color: '#fff' }}>DIVI<span style={{ color: '#C9A84C' }}>.</span></span>
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 13, lineHeight: 1.8, maxWidth: 280, marginBottom: 24 }}>
              The world's premier luxury automotive inventory management platform.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {['𝕏', 'in', 'f', '▶'].map((s, i) => {
                const [hov, setHov] = useState(false);
                return (
                  <div key={i} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                    style={{ width: 36, height: 36, border: `1px solid ${hov ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      color: hov ? '#C9A84C' : 'rgba(255,255,255,0.35)', fontSize: 13, transition: 'all 0.2s',
                      background: hov ? 'rgba(201,168,76,0.08)' : 'transparent' }}>
                    {s}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600, marginBottom: 20 }}>Quick Links</h4>
            {['Collection', 'Brands', 'Services', 'About Us', 'Contact'].map(l => {
              const [hov, setHov] = useState(false);
              return (
                <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`}
                  onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                  style={{ display: 'block', color: hov ? '#C9A84C' : 'rgba(255,255,255,0.35)',
                    fontSize: 12, textDecoration: 'none', marginBottom: 12, transition: 'color 0.2s', letterSpacing: 0.5 }}>
                  {l}
                </a>
              );
            })}
          </div>
          {/* Portal Access */}
          <div>
            <h4 style={{ color: '#fff', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600, marginBottom: 20 }}>Portal Access</h4>
            {[['Customer', '/login/user'], ['Dealer', '/login/staff'], ['Administrator', '/login/admin'], ['Register', '/register']].map(([label, href]) => {
              const [hov, setHov] = useState(false);
              return (
                <a key={label} href={href}
                  onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                  style={{ display: 'block', color: hov ? '#C9A84C' : 'rgba(255,255,255,0.35)',
                    fontSize: 12, textDecoration: 'none', marginBottom: 12, transition: 'color 0.2s', letterSpacing: 0.5 }}>
                  {label}
                </a>
              );
            })}
          </div>
          {/* Newsletter */}
          <div>
            <h4 style={{ color: '#fff', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600, marginBottom: 20 }}>Newsletter</h4>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, lineHeight: 1.7, marginBottom: 16 }}>
              Stay ahead with exclusive arrivals and industry insights.
            </p>
            {subscribed ? (
              <div style={{ color: '#C9A84C', fontSize: 12 }}>✓ Thank you for subscribing</div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input id="contact" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', padding: '10px 14px', fontSize: 12, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
                <button type="submit" style={{
                  background: 'linear-gradient(135deg, #C9A84C, #E2C97E)', color: '#020617', border: 'none',
                  padding: '10px 0', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, letterSpacing: 1, margin: 0 }}>
            © {new Date().getFullYear()} DIVI Luxury Automotive. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => {
              const [hov, setHov] = useState(false);
              return (
                <a key={l} href="#" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                  style={{ color: hov ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.2)',
                    fontSize: 10, textDecoration: 'none', letterSpacing: 1, transition: 'color 0.2s' }}>
                  {l}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── ProfileModal ─────────────────────────────────────────────────────────────
const PROFILES = [
  {
    id: 'user' as const,
    title: 'Customer',
    subtitle: 'Discover & Acquire',
    desc: 'Browse our curated collection and purchase your dream vehicle.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
      </svg>
    ),
    color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)', href: '/login/user',
  },
  {
    id: 'staff' as const,
    title: 'Dealer',
    subtitle: 'Inventory Manager',
    desc: 'Manage stock, process acquisitions and oversee daily operations.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
    color: '#C9A84C', borderColor: 'rgba(201,168,76,0.3)', href: '/login/staff',
  },
  {
    id: 'admin' as const,
    title: 'Administrator',
    subtitle: 'System Control',
    desc: 'Full platform access — manage users, vehicles, and all operations.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    color: '#e879f9', borderColor: 'rgba(232,121,249,0.3)', href: '/login/admin',
  },
];

function ProfileModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24, animation: 'fadeIn 0.3s ease-out' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(2,6,23,0.85)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 760,
        background: 'rgba(8,12,24,0.92)', border: '1px solid rgba(201,168,76,0.2)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        padding: '56px 48px', animation: 'slideUp 0.4s ease-out',
        boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(201,168,76,0.08)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 22, padding: 8, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
          ✕
        </button>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ height: 1, width: 32, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.6))' }} />
            <span style={{ color: '#C9A84C', fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600 }}>DIVI Portal</span>
            <div style={{ height: 1, width: 32, background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.6))' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 600, color: '#fff', margin: 0 }}>Choose Your Profile</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 10, fontSize: 13 }}>Select your access level to continue</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {PROFILES.map(p => (
            <div key={p.id}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate(p.href)}
              style={{ cursor: 'pointer', padding: '28px 20px', textAlign: 'center',
                background: hovered === p.id ? `rgba(${p.id === 'user' ? '56,189,248' : p.id === 'staff' ? '201,168,76' : '232,121,249'},0.07)` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${hovered === p.id ? p.borderColor.replace('0.3', '0.7') : p.borderColor}`,
                transition: 'all 0.3s ease', transform: hovered === p.id ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hovered === p.id ? `0 16px 40px rgba(0,0,0,0.4), 0 0 20px ${p.borderColor}` : 'none' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                background: `rgba(${p.id === 'user' ? '56,189,248' : p.id === 'staff' ? '201,168,76' : '232,121,249'},0.1)`,
                border: `1px solid ${p.borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: p.color, transition: 'all 0.3s ease',
                boxShadow: hovered === p.id ? `0 0 24px ${p.borderColor}` : 'none' }}>
                {p.icon}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>{p.subtitle}</div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>{p.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                color: hovered === p.id ? p.color : 'rgba(255,255,255,0.3)',
                fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', transition: 'color 0.3s' }}>
                Enter <span style={{ fontSize: 14 }}>→</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>New to DIVI? </span>
          <a href="/register" style={{ color: '#C9A84C', fontSize: 12, textDecoration: 'none',
            borderBottom: '1px solid rgba(201,168,76,0.4)', paddingBottom: 1 }}>
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  // Navigate to the showroom — no login required
  const goToShowroom = () => navigate('/customer');

  return (
    <div style={{ background: '#020617', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <Navbar onSignInClick={() => setShowModal(true)} />
      <Hero onExploreClick={goToShowroom} />
      <AnimatedStats />
      <FeaturedCollection onViewDetails={goToShowroom} />
      <PopularBrands />
      <LatestArrivals onViewDetails={goToShowroom} />
      <WhyChooseDIVI />
      <PremiumServices />
      <Testimonials />
      <CTASection onSignInClick={() => setShowModal(true)} />
      <Footer />
      {showModal && <ProfileModal onClose={() => setShowModal(false)} />}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
        @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
        @keyframes countUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes shimmer { 0% { background-position: -200% center } 100% { background-position: 200% center } }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}
