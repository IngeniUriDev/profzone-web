import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import type { UserProfile } from '../../types/database';
import { authService } from '../../services/authService';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [method, setMethod] = useState<'options' | 'admin'>('options');
  const [adminPin, setAdminPin] = useState('');
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFacebookLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await authService.signInWithFacebook();
      if (user) {
        onSuccess(user);
        onClose();
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('No se pudo conectar con Facebook. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminPinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin.trim()) {
      setErrorMsg('Ingresa la clave maestra de administrador.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const adminUser = await authService.signInWithAdminPin(adminPin, adminName);
      onSuccess(adminUser);
      onClose();
    } catch {
      setErrorMsg('Clave de administrador incorrecta. Verifica tu clave maestra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
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
          aria-label="Cerrar modal"
        >
          <X size={16} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.4rem',
            margin: '0 auto 12px auto'
          }}>
            PZ
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Iniciar Sesión en ProfZone</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Únete a la comunidad de recomendaciones de Santiago Tianguistenco y municipios vecinos.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '14px',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {method === 'options' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Botón Facebook Oficial */}
            <button
              id="btn-login-facebook"
              type="button"
              disabled={loading}
              onClick={handleFacebookLogin}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '13px 18px',
                borderRadius: '10px',
                border: 'none',
                background: '#1877F2',
                color: '#ffffff',
                fontSize: '0.98rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(24, 119, 242, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>{loading ? 'Conectando con Facebook...' : 'Continuar con Facebook'}</span>
            </button>

            {/* Aviso de Confianza */}
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '0.8rem',
              color: '#64748b'
            }}>
              <ShieldCheck size={17} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                Para mantener la confianza comunitaria y evitar perfiles falsos, los usuarios se autentican de forma segura con su cuenta de <strong>Facebook</strong> sin costo alguno ni contraseñas adicionales.
              </span>
            </div>

            {/* Acceso discreto para administración */}
            <div style={{ textAlign: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => { setMethod('admin'); setErrorMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
              >
                <KeyRound size={12} />
                <span>Acceso Administrador con Clave Maestra</span>
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Acceso de Administrador */
          <form onSubmit={handleAdminPinLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              padding: '10px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              fontSize: '0.82rem',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <KeyRound size={15} color="#16a34a" />
              <span>Ingresa tu clave maestra de Administrador.</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
                Tu Nombre o Alias (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ej. Uriel (Admin)"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
                Clave Maestra de Administrador:
              </label>
              <input
                type="password"
                required
                placeholder="Ingresa tu clave..."
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setMethod('options'); setErrorMsg(''); }}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {loading ? 'Verificando...' : 'Acceder'}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
