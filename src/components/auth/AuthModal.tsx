import React, { useState } from 'react';
import { X, Phone, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { UserProfile } from '../../types/database';
import { authService } from '../../services/authService';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [method, setMethod] = useState<'options' | 'phone'>('options');
  const [phoneStep, setPhoneStep] = useState<'enter_phone' | 'enter_code'>('enter_phone');
  const [phone, setPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFacebookLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await authService.signInWithFacebook();
      onSuccess(user);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('No se pudo conectar con Facebook. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMsg('Ingresa un número telefónico válido a 10 dígitos.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await authService.sendPhoneOtp(clean);
      setPhoneStep('enter_code');
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Error al enviar el código SMS. Revisa tu número.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrorMsg('Por favor ingresa el código recibido.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await authService.verifyPhoneOtp(phone, otpCode, userName.trim() || undefined);
      onSuccess(user);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Código incorrecto o expirado.');
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
            {/* Botón Facebook */}
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
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                background: '#1877F2',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(24, 119, 242, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continuar con Facebook</span>
            </button>

            {/* Botón Celular */}
            <button
              id="btn-login-phone"
              type="button"
              disabled={loading}
              onClick={() => setMethod('phone')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '12px 18px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Phone size={18} color="var(--primary)" />
              <span>Ingresar con Número Celular</span>
            </button>

            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '0.78rem',
              color: '#64748b'
            }}>
              <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                Para mantener la confianza comunitaria y evitar perfiles falsos, solo admitimos cuentas verificadas por <strong>Facebook</strong> o <strong>SMS</strong>.
              </span>
            </div>
          </div>
        ) : (
          <div>
            {phoneStep === 'enter_phone' ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Tu Nombre o Apodo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Carlos Mendoza"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Número Celular (10 dígitos) *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                      padding: '10px 12px',
                      background: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)'
                    }}>
                      🇲🇽 +52
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="7131234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '0.95rem',
                        letterSpacing: '0.05em'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setMethod('options')}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    ← Volver
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ fontSize: '0.9rem' }}
                  >
                    <span>{loading ? 'Enviando...' : 'Enviar Código SMS'}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} />
                  <span>Código de verificación enviado al +52 {phone}</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Código de 6 dígitos recibido por SMS
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '1.2rem',
                      letterSpacing: '0.3em',
                      textAlign: 'center',
                      fontWeight: 700
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                    * En modo demo de prueba puedes ingresar cualquier código de 6 dígitos (ej. 123456).
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setPhoneStep('enter_phone')}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    ← Cambiar teléfono
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ fontSize: '0.9rem' }}
                  >
                    <span>{loading ? 'Verificando...' : 'Confirmar e Ingresar'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
