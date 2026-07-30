import { useState, useEffect } from 'react';
import { dealService } from '@/services';
import type { Deal } from '@/types';

export function PublicDealsSection() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await dealService.getPublicDeals({ limit: 6, featured: true });
        setDeals(result);
      } catch (e) {
        console.error('Failed to load deals:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) return null;
  if (deals.length === 0) return null;

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <section style={{ padding: '80px 24px', background: 'rgba(8,12,24,0.6)', borderTop: '1px solid rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ color: '#C9A84C', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>Exclusive Offers</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fff', fontSize: 36, fontWeight: 700, margin: 0 }}>
            Featured Deals
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 12 }}>Limited time offers on premium vehicles</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {deals.map(deal => {
            const savings = deal.originalPrice - deal.offerPrice;
            const savingsPct = Math.round((savings / deal.originalPrice) * 100);
            return (
              <div key={deal.id} style={{
                background: 'rgba(8,12,24,0.9)', border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer',
                position: 'relative' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                
                {deal.bannerImageUrl && (
                  <div style={{ height: 140, background: `url(${deal.bannerImageUrl}) center/cover`, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 12, right: 12, background: '#ef4444', color: '#fff',
                      padding: '4px 10px', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
                      SAVE {savingsPct}%
                    </div>
                  </div>
                )}
                
                <div style={{ padding: 20 }}>
                  <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>{deal.title}</h3>
                  {deal.vehicleMake && deal.vehicleModel && (
                    <div style={{ color: '#C9A84C', fontSize: 12, marginBottom: 12 }}>
                      {deal.vehicleMake} {deal.vehicleModel} {deal.vehicleYear}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                    <span style={{ color: '#34d399', fontSize: 22, fontWeight: 700 }}>{fmt(deal.offerPrice)}</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, textDecoration: 'line-through' }}>{fmt(deal.originalPrice)}</span>
                  </div>
                  
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
                    Offer ends {new Date(deal.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
