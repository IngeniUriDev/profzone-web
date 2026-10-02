import React, { useState } from 'react';
import { X, Phone, ShieldCheck, ArrowRight, CheckCircle2, Shield, KeyRound } from 'lucide-react';
import type { UserProfile } from '../../types/database';
import { authService } from '../../services/authService';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [method, setMethod] = useState<'options' | 'phone' | 'admin'>('options');
  const [phoneStep, setPhoneStep] = useState<'enter_phone' | 'enter_code'>('enter_phone');
  const [phone, setPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [otpCode, setOtpCode] = useState('');
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await authService.signInWithGoogle();
      if (user) {
        onSuccess(user);
        onClose();
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('No se pudo conectar con Google. Revisa la configuración del proveedor en Supabase.');
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

            {/* Botón Google */}
            <button
              id="btn-login-google"
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '11px 18px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#1e293b',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar con Google</span>
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
                Para mantener la confianza comunitaria y evitar perfiles falsos, solo admitimos cuentas verificadas por <strong>Facebook</strong>, <strong>Google</strong> o <strong>SMS</strong>.
              </span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => { setMethod('admin'); setErrorMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
              >
                <KeyRound size={13} />
                <span>¿Eres administrador? Acceso con Clave</span>
              </button>
            </div>
          </div>
        ) : method === 'phone' ? (
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
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Shield size={20} color="#16a34a" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.8rem', color: '#166534' }}>
                Acceso exclusivo para el <strong>Superadministrador</strong> de ProfZone (RoliCode).
              </div>
            </div>

            <form onSubmit={handleAdminPinLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Nombre o Identificador
                </label>
                <input
                  type="text"
                  placeholder="Ej. Uriel (RoliCode)"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
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
                  Clave Maestra de Administrador *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => { setMethod('options'); setErrorMsg(''); }}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  ← Volver
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ fontSize: '0.9rem', background: '#16a34a', borderColor: '#16a34a' }}
                >
                  <span>{loading ? 'Validando...' : 'Entrar como Admin'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
