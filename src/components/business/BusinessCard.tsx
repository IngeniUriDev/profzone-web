import React from 'react';
import { Star, MapPin, Clock, Phone, MessageCircle, Navigation2, Globe, ArrowRight, Edit3 } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TikTokIcon } from '../common/SocialIcons';
import type { Business } from '../../types/database';

interface BusinessCardProps {
  business: Business;
  categoryName?: string;
  onClick: () => void;
  onEdit?: () => void;
}

function checkIsOpenNow(schedule?: string): { isOpen: boolean; label: string } {
  if (!schedule) {
    const hour = new Date().getHours();
    const isOpen = hour >= 9 && hour < 20;
    return { isOpen, label: isOpen ? 'Abierto ahora' : 'Cerrado' };
  }

  const s = schedule.toLowerCase();
  if (s.includes('24 horas') || s.includes('24 hrs') || s.includes('24h')) {
    return { isOpen: true, label: 'Abierto 24 hrs' };
  }

  const now = new Date();
  const day = now.getDay(); // 0 = Domingo
  const hour = now.getHours();

  if (day === 0 && (s.includes('lunes a viernes') || s.includes('lunes a sábado') || s.includes('lunes a sabado'))) {
    return { isOpen: false, label: 'Cerrado domingos' };
  }

  const isOpen = hour >= 9 && hour < 20;
  return { isOpen, label: isOpen ? 'Abierto ahora' : 'Cerrado' };
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  categoryName,
  onClick,
  onEdit
}) => {
  const status = checkIsOpenNow(business.schedule);

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
        transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 16px 30px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--primary-light)';
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1)';
      }}
    >
      {/* Contenedor de Imagen de Alta Presentación */}
      <div style={{ position: 'relative', width: '100%', height: '185px', backgroundColor: 'var(--surface-secondary)', overflow: 'hidden' }}>
        <img
          src={business.image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}
          alt={business.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          loading="lazy"
        />

        {/* Degradado inferior para resaltar texto sobre fotos claras */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.65) 100%)',
          pointerEvents: 'none'
        }} />
        
        {/* Badges superiores: Categoría y Municipio */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap', zIndex: 2 }}>
          <span className="badge" style={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.92)',
            color: '#0369a1',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}>
            {categoryName || 'Servicio Local'}
          </span>
          <span className="badge" style={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            background: 'rgba(15, 23, 42, 0.85)',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <MapPin size={11} color="#38bdf8" />
            {business.municipality}
          </span>
        </div>

        {/* Badge superior derecho: Abierto / Cerrado */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 700,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            background: status.isOpen ? 'rgba(22, 163, 74, 0.9)' : 'rgba(30, 41, 59, 0.85)',
            color: '#ffffff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: status.isOpen ? '#4ade80' : '#94a3b8',
              boxShadow: status.isOpen ? '0 0 6px #4ade80' : 'none'
            }} />
            <span>{status.label}</span>
          </span>
        </div>

        {/* Badge inferior: Rating y Distancia GPS */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          display: 'flex',
          gap: '6px',
          zIndex: 2
        }}>
          {business.distanceKm !== undefined && (
            <div style={{
              background: 'rgba(2, 132, 199, 0.95)',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.76rem',
              fontWeight: 700,
              backdropFilter: 'blur(6px)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}>
              <Navigation2 size={11} fill="#fff" />
              <span>{business.distanceKm} km</span>
            </div>
          )}

          <div style={{
            background: 'rgba(15, 23, 42, 0.92)',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.78rem',
            fontWeight: 700,
            backdropFilter: 'blur(6px)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}>
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span>{business.rating_avg.toFixed(1)}</span>
            <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 500 }}>
              ({business.rating_count})
            </span>
          </div>
        </div>

        {/* Botón flotante Editar si es propietario */}
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Editar mi publicación"
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#0284c7',
              border: '1px solid rgba(2, 132, 199, 0.3)',
              fontSize: '0.74rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Edit3 size={12} />
            <span>Editar</span>
          </button>
        )}
      </div>

      {/* Contenido de la Tarjeta */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
        <div>
          <h3 style={{
            fontSize: '1.08rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: '4px',
            letterSpacing: '-0.015em'
          }}>
            {business.name}
          </h3>
          <p style={{
            fontSize: '0.84rem',
            color: 'var(--text-muted)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.45
          }}>
            {business.description || `Servicio verificado en ${business.municipality}.`}
          </p>
        </div>

        {/* Datos clave: Ubicación y Horario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <MapPin size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {business.locality ? `${business.locality}, ${business.municipality}` : business.address}
            </span>
          </div>

          {business.schedule && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {business.schedule}
              </span>
            </div>
          )}

          {(business.facebook_url || business.instagram_url || business.tiktok_url) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '2px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>Redes:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {business.facebook_url && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = business.facebook_url!.startsWith('http') ? business.facebook_url! : `https://${business.facebook_url}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    title="Ver Facebook"
                    style={{
                      border: '1px solid #bfdbfe',
                      background: '#eff6ff',
                      color: '#1877F2',
                      borderRadius: '6px',
                      padding: '3px 6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    <FacebookIcon size={13} color="#1877F2" />
                  </button>
                )}
                {business.instagram_url && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = business.instagram_url!.startsWith('http') ? business.instagram_url! : `https://${business.instagram_url}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    title="Ver Instagram"
                    style={{
                      border: '1px solid #fbcfe8',
                      background: '#fdf2f8',
                      color: '#E1306C',
                      borderRadius: '6px',
                      padding: '3px 6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    <InstagramIcon size={13} color="#E1306C" />
                  </button>
                )}
                {business.tiktok_url && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = business.tiktok_url!.startsWith('http') ? business.tiktok_url! : `https://${business.tiktok_url}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    title="Ver TikTok"
                    style={{
                      border: '1px solid var(--border)',
                      background: 'var(--surface-secondary)',
                      color: 'var(--text-main)',
                      borderRadius: '6px',
                      padding: '3px 6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    <TikTokIcon size={13} color="currentColor" />
                  </button>
                )}
              </div>
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
          paddingTop: '12px',
          borderTop: '1px solid var(--border)'
        }}>
          {business.whatsapp && (
            <button
              type="button"
              className="btn btn-whatsapp"
              onClick={handleWhatsApp}
              style={{ fontSize: '0.8rem', padding: '7px 8px', width: '100%', justifyContent: 'center' }}
              title="Contactar directamente por WhatsApp"
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
              style={{ fontSize: '0.8rem', padding: '7px 8px', width: '100%', justifyContent: 'center' }}
              title="Llamar al negocio"
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
                padding: '7px 8px',
                width: '100%',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <Globe size={14} />
              <span>Web</span>
            </button>
          )}

          {![business.whatsapp, business.phone, business.website_url].some(Boolean) && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '7px 12px', width: '100%', justifyContent: 'space-between' }}
            >
              <span>Ver detalles y reseñas</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

