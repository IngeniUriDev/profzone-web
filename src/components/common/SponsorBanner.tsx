import React, { useState } from 'react';
import { Sparkles, ExternalLink, X } from 'lucide-react';
import type { Sponsor } from '../../data/sponsorData';

interface SponsorBannerProps {
  sponsor: Sponsor | null;
}

export const SponsorBanner: React.FC<SponsorBannerProps> = ({ sponsor }) => {
  const [dismissed, setDismissed] = useState(false);

  // Si no hay patrocinador, o no está activo, o el usuario lo cerró en esta sesión, no ocupa espacio
  if (!sponsor || !sponsor.active || dismissed) {
    return null;
  }

  return (
    <aside
      role="complementary"
      aria-label="Patrocinador destacado"
      style={{
        background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        color: '#f8fafc',
        borderTop: '1px solid rgba(56, 189, 248, 0.25)',
        padding: '10px 16px',
        fontSize: '0.82rem',
        position: 'relative',
        zIndex: 50,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.3) 100%)',
              color: '#fcd34d',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '999px',
              padding: '2px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              flexShrink: 0
            }}
          >
            <Sparkles size={11} color="#fbbf24" />
            {sponsor.badge || 'Patrocinador'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <strong style={{ color: '#ffffff', fontWeight: 700 }}>{sponsor.name}:</strong>
            <span style={{ color: '#cbd5e1' }}>{sponsor.message}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {sponsor.linkUrl && (
            <a
              href={sponsor.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sponsor-cta-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'none';
              }}
            >
              <span>{sponsor.ctaText || 'Visitar'}</span>
              <ExternalLink size={11} />
            </a>
          )}

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Cerrar anuncio"
            title="Cerrar banner publicitario"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              borderRadius: '4px',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};
