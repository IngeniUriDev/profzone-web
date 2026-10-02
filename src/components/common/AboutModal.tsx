import React from 'react';
import { X, Info, Sparkles, MapPin, Star, MessageCircle, ShieldCheck, HeartHandshake, CheckCircle2, Code2, Mail, Phone, Laptop } from 'lucide-react';

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
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '26px',
          borderRadius: '20px',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
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

        {/* Encabezado Principal */}
        <div style={{ textAlign: 'center', marginBottom: '22px', paddingRight: '20px', paddingLeft: '20px' }}>
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 18px rgba(2, 132, 199, 0.35)',
              marginBottom: '12px'
            }}
          >
            <Info size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
            Acerca de ProfZone
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Directorio y plataforma digital de recomendación comunitaria para Santiago Tianguistenco y municipios vecinos.
          </p>
        </div>

        {/* 1. FINALIDAD DE LA APLICACIÓN */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: '14px',
            padding: '18px',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#166534' }}>
            <Sparkles size={19} />
            <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0 }}>Finalidad y Misión de ProfZone</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: '0 0 10px 0' }}>
            <strong>ProfZone</strong> nació con el propósito de resolver una necesidad real en nuestra región: 
            brindar a las familias un espacio digital confiable donde encontrar rápidamente desde un <strong>médico especialista, dentista, psicólogo o abogado</strong>, 
            hasta un <strong>mecánico, plomero, electricista o negocio de comida</strong> local.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#15803d' }}>
            <div>✓ <strong>Impulso a la economía local:</strong> Visibilidad digital profesional para negocios y oficios sin costo de publicación.</div>
            <div>✓ <strong>Sin intermediarios ni comisiones:</strong> El trato y el pago es 100% directo entre tú y el profesional.</div>
            <div>✓ <strong>Opiniones transparentes:</strong> Valoraciones reales hechas por vecinos de la misma comunidad.</div>
          </div>
        </div>

        {/* Pilares Clave */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '22px' }}>
          <div style={{ padding: '14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#0284c7' }}>
              <MapPin size={17} />
              <strong style={{ fontSize: '0.88rem' }}>100% Regional</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
              Enfocado en Santiago Tianguistenco, Almoloya del Río, Calimaya, Capulhuac, Tenango del Valle, Toluca y municipios conurbados.
            </p>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#d97706' }}>
              <Star size={17} />
              <strong style={{ fontSize: '0.88rem' }}>Confianza Ciudadana</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
              Calificaciones de 1 a 5 estrellas y opiniones con verificación para elegir con total tranquilidad y respaldo.
            </p>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#16a34a' }}>
              <MessageCircle size={17} />
              <strong style={{ fontSize: '0.88rem' }}>Contacto Directo</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
              Comunícate en un clic por llamada telefónica o WhatsApp directo con el profesional, sin cargos sorpresa.
            </p>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#7c3aed' }}>
              <ShieldCheck size={17} />
              <strong style={{ fontSize: '0.88rem' }}>Revisión y Filtro</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
              Cada nuevo registro pasa por moderación de administradores para garantizar seriedad y autenticidad del directorio.
            </p>
          </div>
        </div>

        {/* 2. INFORMACIÓN DEL DESARROLLADOR */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}
              >
                <Code2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Sobre el Desarrollador & Creador
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                  Firma Tecnológica: RoliCode (Uriel)
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                padding: '4px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}
            >
              Ingeniería de Software
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 14px 0' }}>
            Esta plataforma fue diseñada y desarrollada de manera independiente por <strong>Uriel</strong> bajo la firma <strong>RoliCode</strong>, 
            con el objetivo de democratizar la tecnología en la región y ofrecer soluciones web de alto rendimiento, seguras y accesibles 
            para negocios locales y proyectos emprendedores.
          </p>

          {/* Tarjetas de contacto del desarrollador */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
            <a
              href="https://wa.me/527141087330?text=Hola%20Uriel,%20te%20contacto%20desde%20ProfZone%20para%20un%20proyecto"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '0.8rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'background 0.2s'
              }}
            >
              <Phone size={14} color="#22c55e" />
              <span>WhatsApp: <strong>714 108 7330</strong></span>
            </a>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.8rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Mail size={14} color="#38bdf8" />
              <span>contacto@rolicode.com.mx</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.8rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Laptop size={14} color="#a855f7" />
              <span>Desarrollo Web & Software a Medida</span>
            </div>
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
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>¿Ofreces algún oficio o servicio profesional?</span>
            </div>
            <p style={{ fontSize: '0.82rem', margin: 0, opacity: 0.9, lineHeight: 1.4 }}>
              Regístrate gratis hoy mismo y haz que más vecinos te encuentren en Santiago Tianguistenco y alrededores.
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
              Registrar mi Servicio Gratis
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
            <CheckCircle2 size={14} color="#16a34a" />
            <span>ProfZone Web • Hecho con orgullo para impulsar el comercio y talento local</span>
          </div>
          <p style={{ margin: 0 }}>Desarrollado bajo la firma <strong>RoliCode</strong></p>
        </div>
      </div>
    </div>
  );
};
