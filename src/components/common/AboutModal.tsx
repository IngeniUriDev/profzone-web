import React from 'react';
import { X, Info, Sparkles, MapPin, Star, MessageCircle, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
  onOpenRegister?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose, onOpenRegister }) => {
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          borderRadius: '18px',
          position: 'relative',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.25)'
        }}
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            transition: 'all 0.2s'
          }}
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        {/* Encabezado con Identidad */}
        <div style={{ textAlign: 'center', marginBottom: '20px', paddingRight: '20px', paddingLeft: '20px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 16px rgba(2, 132, 199, 0.3)',
              marginBottom: '12px'
            }}
          >
            <Info size={28} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
            Acerca de ProfZone
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            La red comunitaria de recomendación y directorio de profesionales, oficios y servicios locales en tu región.
          </p>
        </div>

        {/* ¿Qué es ProfZone? */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#166534' }}>
            <Sparkles size={18} />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>¿Qué es ProfZone?</h3>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.55, margin: 0 }}>
            <strong>ProfZone</strong> es una plataforma creada para conectar a familias, vecinos y empresas de
            <strong> Santiago Tianguistenco</strong> y municipios vecinos con prestadores de servicios calificados,
            debidamente verificados y recomendados por la propia comunidad.
          </p>
        </div>

        {/* Pilares y Beneficios */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {/* Tarjeta 1 */}
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#0284c7' }}>
              <MapPin size={17} />
              <strong style={{ fontSize: '0.88rem' }}>100% Local y Cercano</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
              Filtra por tu municipio o ubica negocios con geolocalización para encontrar el servicio más cercano cuando más lo necesitas.
            </p>
          </div>

          {/* Tarjeta 2 */}
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#d97706' }}>
              <Star size={17} />
              <strong style={{ fontSize: '0.88rem' }}>Opiniones Reales</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
              Consulta estrellas y valoraciones genuinas otorgadas por clientes reales para tomar siempre la mejor decisión.
            </p>
          </div>

          {/* Tarjeta 3 */}
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#16a34a' }}>
              <MessageCircle size={17} />
              <strong style={{ fontSize: '0.88rem' }}>Trato Directo sin Tarifas</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
              Comunícate en un solo clic mediante llamada telefónica o WhatsApp directo con el profesional, sin costos intermediarios.
            </p>
          </div>

          {/* Tarjeta 4 */}
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#7c3aed' }}>
              <ShieldCheck size={17} />
              <strong style={{ fontSize: '0.88rem' }}>Revisión y Confianza</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
              Cada nuevo registro es revisado antes de publicarse para evitar perfiles falsos y asegurar información fidedigna.
            </p>
          </div>
        </div>

        {/* Sección para prestadores de servicios */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <HeartHandshake size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>¿Eres prestador de servicios?</span>
            </div>
            <p style={{ fontSize: '0.82rem', margin: 0, opacity: 0.9, lineHeight: 1.4 }}>
              Impulsa tu negocio, atrae nuevos clientes y forma parte del directorio más completo de la región.
            </p>
          </div>
          {onOpenRegister && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              style={{
                background: '#ffffff',
                color: '#0284c7',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              Registrar mi Servicio
            </button>
          )}
        </div>

        {/* Pie con firma institucional */}
        <div
          style={{
            textAlign: 'center',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '14px',
            fontSize: '0.78rem',
            color: '#94a3b8'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
            <CheckCircle2 size={13} color="#16a34a" />
            <span>ProfZone Web v1.0 • Impulsando el comercio y talento local</span>
          </div>
          <p style={{ margin: 0 }}>Desarrollado bajo la firma <strong>RoliCode</strong></p>
        </div>
      </div>
    </div>
  );
};
