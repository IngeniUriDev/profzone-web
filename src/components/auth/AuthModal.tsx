import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import type { UserProfile } from '../../types/database';
import { authService } from '../../services/authService';
import { securityService } from '../../utils/security';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [lockout, setLockout] = useState(() => securityService.getPinLockoutState());

  useEffect(() => {
    if (!lockout.isLocked) return;
    const interval = setInterval(() => {
      const current = securityService.getPinLockoutState();
      setLockout(current);
      if (!current.isLocked) setErrorMsg('');
    }, 1000);
    return () => clearInterval(interval);
  }, [lockout.isLocked]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');

    // Si por alguna razón el navegador no redirige en 5 segundos, rehabilitar el botón
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    try {
      const user = await authService.signInWithGoogle();
      if (user) {
        clearTimeout(timer);
        onSuccess(user);
        onClose();
      }
    } catch (err: unknown) {
      clearTimeout(timer);
      console.error('Google login error:', err);
      const msg = err instanceof Error ? err.message : String(err || '');
      if (
        msg.toLowerCase().includes('not enabled') || 
        msg.toLowerCase().includes('validation_failed') || 
        msg.toLowerCase().includes('unsupported provider')
      ) {
        setErrorMsg('El inicio con Google aún no está activado en tu panel de Supabase. Actívalo en Authentication > Providers > Google, o ingresa abajo con tu Clave Maestra de Administrador.');
      } else {
        setErrorMsg('No se pudo conectar con Google. Verifica que el proveedor esté activado en Supabase o ingresa abajo con Clave Maestra.');
      }
    } finally {
      // Si no hubo redirección automática inmediata
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const handleAdminPinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const currentLock = securityService.getPinLockoutState();
    if (currentLock.isLocked) {
      setLockout(currentLock);
      setErrorMsg(`Acceso bloqueado temporalmente. Intenta en ${securityService.formatSeconds(currentLock.remainingSeconds)}.`);
      return;
    }

    setLoading(true);
    try {
      const adminUser = await authService.signInWithAdminPin(adminPin);
      securityService.resetPinAttempts();
      onSuccess(adminUser);
      onClose();
    } catch {
      const failState = securityService.recordFailedPinAttempt();
      setLockout(failState);
      if (failState.isLocked) {
        setErrorMsg(`Has superado los 3 intentos. Acceso bloqueado durante 5 minutos (${securityService.formatSeconds(failState.remainingSeconds)}).`);
      } else {
        setErrorMsg(`Clave incorrecta. Te queda${failState.remainingAttempts === 1 ? '' : 'n'} ${failState.remainingAttempts} intento${failState.remainingAttempts === 1 ? '' : 's'}.`);
      }
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

        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
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
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4 }}>
            Inicia sesión para calificar negocios, opinar sobre especialistas y enviar sugerencias a la comunidad.
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Botón Google Oficial */}
          <button
            id="btn-login-google"
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#1e293b',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>{loading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
          </button>

          {/* Aviso de Confianza y Nombre de Usuario */}
          <div style={{
            marginTop: '4px',
            padding: '12px 14px',
            background: 'var(--surface-secondary)',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            lineHeight: 1.45
          }}>
            <ShieldCheck size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              Tu <strong>nombre real</strong> y foto se vincularán de Google para respaldar tus calificaciones y comentarios comunitarios.
            </span>
          </div>

          <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

          {/* Acceso Alternativo para Administradores con Clave Maestra */}
          {!showAdminInput ? (
            <button
              type="button"
              onClick={() => setShowAdminInput(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '4px'
              }}
            >
              ¿Eres administrador? <span style={{ textDecoration: 'underline', color: 'var(--primary)', fontWeight: 600 }}>Acceder con Clave Maestra</span>
            </button>
          ) : (
            <form onSubmit={handleAdminPinLogin} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--surface-secondary)', padding: '12px', borderRadius: '10px', border: '1px dashed #f59e0b' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309' }}>
                Acceso de Superadministrador
              </div>

              {lockout.isLocked ? (
                <div style={{ fontSize: '0.78rem', color: '#dc2626', background: '#fef2f2', padding: '8px', borderRadius: '6px' }}>
                  Demasiados intentos fallidos. Bloqueado temporalmente: {securityService.formatSeconds(lockout.remainingSeconds)}
                </div>
              ) : (
                <>
                  <input
                    type="password"
                    required
                    placeholder="Clave Maestra..."
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.85rem'
                    }}
                  />
                  {lockout.remainingAttempts < 3 && (
                    <div style={{ fontSize: '0.74rem', color: '#d97706', textAlign: 'right' }}>
                      Intentos restantes: {lockout.remainingAttempts} de 3
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ fontSize: '0.82rem', padding: '8px', justifyContent: 'center' }}
                  >
                    Entrar como Administrador
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
