import React from 'react';
import { Star, MapPin, Clock, Phone, MessageCircle, Navigation2, Globe } from 'lucide-react';
import type { Business } from '../../types/database';

interface BusinessCardProps {
  business: Business;
  categoryName?: string;
  onClick: () => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  categoryName,
  onClick
}) => {
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!business.whatsapp) return;
    const cleanNumber = business.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(`Hola, vi su servicio en ProfZone y me gustaría solicitar informes.`);
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  const handlePhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!business.phone) return;
    window.open(`tel:${business.phone}`);
  };

  const handleWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!business.website_url) return;
    const url = business.website_url.startsWith('http')
      ? business.website_url
      : `https://${business.website_url}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      onClick={onClick}
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Imagen de Cabecera */}
      <div style={{ position: 'relative', width: '100%', height: '170px', backgroundColor: '#e2e8f0' }}>
        <img
          src={business.image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}
          alt={business.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        
        {/* Badges superiores: Categoría y Municipio */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span className="badge badge-category" style={{ backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.92)' }}>
            {categoryName || 'Servicio Local'}
          </span>
          <span className="badge" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15,23,42,0.85)', color: '#ffffff' }}>
            <MapPin size={10} color="#38bdf8" />
            {business.municipality}
          </span>
        </div>

        {/* Badge inferior: Rating y Distancia */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          display: 'flex',
          gap: '6px'
        }}>
          {business.distanceKm !== undefined && (
            <div style={{
              background: 'rgba(2, 132, 199, 0.9)',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.78rem',
              fontWeight: 700,
              backdropFilter: 'blur(4px)'
            }}>
              <Navigation2 size={11} fill="#fff" />
              <span>{business.distanceKm} km</span>
            </div>
          )}

          <div style={{
            background: 'rgba(15, 23, 42, 0.88)',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span>{business.rating_avg.toFixed(1)}</span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}>
              ({business.rating_count})
            </span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            {business.name}
          </h3>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {business.description || `Servicio verificado en ${business.municipality}.`}
          </p>
        </div>

        {/* Datos clave: Ubicación y Horario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#475569', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <MapPin size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {business.locality ? `${business.locality}, ${business.municipality}` : business.address}
            </span>
          </div>

          {business.schedule && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#64748b" style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {business.schedule}
              </span>
            </div>
          )}
        </div>

        {/* Botones de Acción Inmediata */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: [business.whatsapp, business.phone, business.website_url].filter(Boolean).length >= 3
            ? 'repeat(3, 1fr)'
            : [business.whatsapp, business.phone, business.website_url].filter(Boolean).length === 2
            ? '1fr 1fr'
            : '1fr',
          gap: '8px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border)'
        }}>
          {business.whatsapp && (
            <button
              type="button"
              className="btn btn-whatsapp"
              onClick={handleWhatsApp}
              style={{ fontSize: '0.8rem', padding: '6px 8px', width: '100%', justifyContent: 'center' }}
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </button>
          )}

          {business.phone && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePhone}
              style={{ fontSize: '0.8rem', padding: '6px 8px', width: '100%', justifyContent: 'center' }}
            >
              <Phone size={14} />
              <span>Llamar</span>
            </button>
          )}

          {business.website_url && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleWebsite}
              title="Visitar sitio web o enlace"
              style={{
                fontSize: '0.8rem',
                padding: '6px 8px',
                width: '100%',
                justifyContent: 'center',
                color: 'var(--primary)',
                borderColor: '#bae6fd'
              }}
            >
              <Globe size={14} />
              <span>Web</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
