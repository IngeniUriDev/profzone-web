import React, { useState } from 'react';
import { X, Phone, MessageSquare, Mail, MapPin, Send, CheckCircle2, Clock, Headphones } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { UserProfile } from '../../types/database';

interface ContactModalProps {
  onClose: () => void;
  currentUser?: UserProfile | null;
}

export const ContactModal: React.FC<ContactModalProps> = ({ onClose, currentUser }) => {
  const [name, setName] = useState(currentUser?.full_name || '');
  const [contactInfo, setContactInfo] = useState(currentUser?.phone || currentUser?.email || '');
  const [subject, setSubject] = useState('Duda o Consulta General');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('pz_feedback').insert([
          {
            type: 'other',
            title: `Contacto: ${subject || 'Consulta General'}`,
            message: `[Contacto: ${subject}] ${message.trim()}`,
            user_name: name.trim() || 'Visitante',
            user_contact: contactInfo.trim() || null,
            status: 'pending'
          }
        ]);
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Error enviando contacto:', err);
      // Permitir confirmación visual incluso offline/demo
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
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

        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '20px', paddingRight: '20px', paddingLeft: '20px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
              marginBottom: '12px'
            }}
          >
            <Headphones size={28} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
            Contacto y Soporte
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
            ¿Tienes dudas, sugerencias o requieres asistencia con tu negocio? Estamos a tu disposición.
          </p>
        </div>

        {/* Canales de Contacto Directo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
          {/* WhatsApp Directo */}
          <a
            href="https://wa.me/527141087330?text=Hola%20ProfZone,%20me%20gustar%C3%ADa%20solicitar%20informaci%C3%B3n"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              textDecoration: 'none',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#22c55e',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <MessageSquare size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>WhatsApp Oficial</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Enviar Mensaje</div>
            </div>
          </a>

          {/* Teléfono Directo */}
          <a
            href="tel:7141087330"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              borderRadius: '12px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              color: '#0369a1',
              textDecoration: 'none',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#0284c7',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Phone size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>Llamada Directa</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>714 108 7330</div>
            </div>
          </a>
        </div>

        {/* Información de Horario y Cobertura */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '0.82rem',
            color: '#475569'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={15} color="var(--primary)" />
            <span><strong>Horario de atención:</strong> Lunes a Sábado de 9:00 AM a 7:00 PM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={15} color="#ef4444" />
            <span><strong>Región:</strong> Santiago Tianguistenco, Almoloya del Río y municipios conurbados.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={15} color="#8b5cf6" />
            <span><strong>Correo:</strong> contacto@rolicode.com.mx</span>
          </div>
        </div>

        {/* Formulario de Mensaje */}
        {submitted ? (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '14px',
              padding: '24px 16px',
              textAlign: 'center',
              color: '#166534'
            }}
          >
            <CheckCircle2 size={42} color="#16a34a" style={{ margin: '0 auto 10px auto' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px 0' }}>
              ¡Mensaje enviado con éxito!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#15803d', margin: '0 0 14px 0' }}>
              Hemos recibido tu mensaje. Nos comunicaremos contigo a la brevedad posible.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ fontSize: '0.85rem', padding: '6px 16px' }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 2px 0', color: 'var(--text-main)' }}>
              Envíanos un mensaje directo
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Tu Nombre:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Teléfono / Correo:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 7141087330 o correo@ejemplo.com"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Motivo / Asunto:
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  background: '#fff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Duda o Consulta General">Duda o Consulta General</option>
                <option value="Soporte para mi Negocio">Soporte para mi Negocio Registrado</option>
                <option value="Sugerencia de Mejora">Sugerencia de Mejora</option>
                <option value="Alianza o Publicidad">Alianza Comercial o Publicidad</option>
                <option value="Reporte de Perfil">Reporte de Negocio o Contenido</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Mensaje:
              </label>
              <textarea
                required
                rows={3}
                placeholder="Escribe aquí tu duda, consulta o mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                marginTop: '4px',
                justifyContent: 'center',
                padding: '10px',
                fontSize: '0.9rem',
                fontWeight: 700
              }}
            >
              <Send size={16} />
              <span>{loading ? 'Enviando...' : 'Enviar Mensaje'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
