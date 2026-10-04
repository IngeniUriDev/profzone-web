import React, { useState } from 'react';
import { X, MessageSquareHeart, Send, CheckCircle2, Lock, User, ShieldCheck } from 'lucide-react';
import type { UserProfile, FeedbackSuggestion } from '../../types/database';
import { feedbackService } from '../../services/feedbackService';

interface FeedbackModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  onSuccess?: () => void;
  onOpenAuth?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  currentUser,
  onClose,
  onSuccess,
  onOpenAuth
}) => {
  const [type, setType] = useState<FeedbackSuggestion['type']>('category');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Debes iniciar sesión con tu cuenta de Google para enviar una sugerencia.');
      onClose();
      onOpenAuth?.();
      return;
    }
    if (!message.trim()) return;

    setLoading(true);
    try {
      await feedbackService.submitFeedback({
        type,
        author_name: currentUser.full_name || 'Usuario Verificado',
        contact: currentUser.email || currentUser.phone || 'Cuenta Google Verificada',
        message: message.trim()
      });
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert('Hubo un error al enviar tu sugerencia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--surface-secondary)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle2 size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
              ¡Muchas Gracias por tu Aporte!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
              Tu sugerencia fue recibida y será revisada por el equipo de moderación de ProfZone para seguir expandiendo nuestra red comunitaria.
            </p>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        ) : !currentUser ? (
          <div style={{ textAlign: 'center', padding: '24px 8px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Lock size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
              Inicio de Sesión Requerido
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
              Para garantizar la calidad de las sugerencias y evitar spam, <strong>sólo las personas que hayan iniciado sesión</strong> con su cuenta de Google pueden enviar propuestas a la plataforma.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onOpenAuth?.();
                }}
              >
                <User size={15} />
                <span>Iniciar Sesión con Google</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                background: '#fef3c7',
                color: '#d97706',
                padding: '8px',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <MessageSquareHeart size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Buzón de Sugerencias</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Envía ideas de nuevas categorías, municipios o mejoras para la región.
                </p>
              </div>
            </div>

            {/* Credencial del usuario autenticado */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '8px 12px',
              borderRadius: '8px',
              marginBottom: '14px',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="#16a34a" />
                <span>Enviando como: <strong>{currentUser.full_name}</strong></span>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: currentUser.provider === 'google' ? '#ea4335' : '#0284c7',
                background: '#fff',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1'
              }}>
                {currentUser.provider === 'google' ? 'Google' : 'Cuenta Verificada'}
              </span>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  ¿De qué trata tu sugerencia?
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as FeedbackSuggestion['type'])}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="category">Sugerir nueva categoría u oficio (ej. Psicología, Abogados, Plomería...)</option>
                  <option value="municipality">Sugerir nuevo municipio o colonia de la zona</option>
                  <option value="feature">Sugerencia de mejora para la página o app</option>
                  <option value="correction">Reportar dato incorrecto o negocio cerrado</option>
                  <option value="other">Otra sugerencia o comentario</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Tu Sugerencia o Comentario *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escribe tu idea con todo detalle... ¿Qué especialidad, oficio o mejora sugieres?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  <Send size={15} />
                  <span>{loading ? 'Enviando...' : 'Enviar Sugerencia'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
