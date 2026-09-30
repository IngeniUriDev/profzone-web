import React, { useState } from 'react';
import { MapPin, PlusCircle, ShieldCheck, Sparkles, User, LogOut, MessageSquareHeart, Menu, X, ChevronDown } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import type { UserProfile } from '../../types/database';

interface NavbarProps {
  onOpenRegister: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onOpenFeedback: () => void;
  onGoHome: () => void;
  currentUser: UserProfile | null;
  onSignOut: () => void;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRegister,
  onOpenAdmin,
  onOpenAuth,
  onOpenFeedback,
  onGoHome,
  currentUser,
  onSignOut,
  pendingCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border)',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      padding: '8px 16px',
      marginBottom: '12px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        {/* Marca y Subtítulo - Clickeable para ir a Inicio y limpiar búsqueda */}
        <div
          id="btn-navbar-home"
          onClick={() => { closeMenu(); onGoHome(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'opacity 0.2s ease',
            flexShrink: 0
          }}
          title="Ir a inicio y restablecer búsqueda"
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.05rem',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
          }}>
            PZ
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Prof<span style={{ color: 'var(--primary)' }}>Zone</span>
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                background: '#f1f5f9',
                color: '#64748b',
                padding: '1px 5px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0'
              }}>
                by RoliCode
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <MapPin size={11} color="var(--primary)" />
              <span>Regiones cercanas</span>
            </div>
          </div>
        </div>

        {/* ACCIONES DE ESCRITORIO (Ocultas en pantallas móviles con .nav-desktop-actions) */}
        <div className="nav-desktop-actions">
          {!isSupabaseConfigured && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              background: '#fef3c7',
              color: '#92400e',
              padding: '3px 8px',
              borderRadius: '16px',
              fontWeight: 600
            }}>
              <Sparkles size={11} />
              <span>Modo Demo</span>
            </div>
          )}

          {/* Botón Buzón de Sugerencias */}
          <button
            id="btn-open-feedback"
            type="button"
            className="btn btn-secondary"
            onClick={onOpenFeedback}
            style={{ fontSize: '0.8rem', padding: '6px 10px', background: '#fffbeb', borderColor: '#fde68a', color: '#b45309' }}
            title="Envíanos tus ideas"
          >
            <MessageSquareHeart size={14} color="#d97706" />
            <span>Buzón</span>
          </button>

          {/* Estado de Usuario / Login */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                background: 'var(--surface-secondary)',
                borderRadius: '6px',
                border: '1px solid var(--border)'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: currentUser.provider === 'facebook' ? '#1877F2' : '#16a34a',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    {currentUser.full_name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                    {currentUser.provider === 'facebook' ? '✓ Facebook' : '✓ Celular'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onSignOut}
                title="Cerrar sesión"
                style={{ padding: '6px 8px' }}
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              id="btn-open-auth"
              type="button"
              className="btn btn-secondary"
              onClick={onOpenAuth}
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
            >
              <User size={14} color="var(--primary)" />
              <span>Ingresar</span>
            </button>
          )}

          {/* Panel Admin (Solo visible para usuarios con rol 'admin') */}
          {currentUser?.role === 'admin' && (
            <button
              id="btn-admin-panel"
              type="button"
              className="btn btn-secondary"
              onClick={onOpenAdmin}
              style={{
                fontSize: '0.8rem',
                padding: '6px 12px',
                position: 'relative',
                background: '#f0fdf4',
                borderColor: '#86efac',
                color: '#15803d'
              }}
              title="Panel de Administración"
            >
              <ShieldCheck size={14} color="#16a34a" />
              <span>Admin</span>
              {pendingCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff'
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Registrar Servicio */}
          <button
            id="btn-register-service"
            type="button"
            className="btn btn-primary"
            onClick={onOpenRegister}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <PlusCircle size={14} />
            <span>Registrar Servicio</span>
          </button>
        </div>

        {/* BOTÓN MÓVIL / MENÚ DESPLEGABLE (Visible solo en pantallas móviles) */}
        <div className="nav-mobile-menu-btn" style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: currentUser ? 'var(--surface-secondary)' : 'var(--surface)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              position: 'relative'
            }}
            aria-label="Abrir menú de opciones"
          >
            {currentUser ? (
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: currentUser.provider === 'facebook' ? '#1877F2' : '#16a34a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {currentUser.full_name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <Menu size={18} />
            )}

            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              {currentUser ? currentUser.full_name.split(' ')[0] : 'Menú'}
            </span>

            {mobileMenuOpen ? <X size={14} /> : <ChevronDown size={14} />}

            {/* Badge de alertas si hay registros pendientes de admin */}
            {currentUser?.role === 'admin' && pendingCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {pendingCount}
              </span>
            )}
          </button>

          {/* Menú Flotante Desplegable en Móvil */}
          {mobileMenuOpen && (
            <>
              {/* Overlay transparente para cerrar al hacer clic afuera */}
              <div
                onClick={closeMenu}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 150,
                  background: 'rgba(0,0,0,0.15)'
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '260px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  padding: '10px',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                {/* Cabecera del usuario si está conectado */}
                {currentUser ? (
                  <div style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'var(--surface-secondary)',
                    marginBottom: '4px'
                  }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {currentUser.full_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {currentUser.provider === 'facebook' ? '✓ Conectado con Facebook' : `✓ Celular ${currentUser.phone || ''}`}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => { closeMenu(); onOpenAuth(); }}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      padding: '8px',
                      marginBottom: '4px'
                    }}
                  >
                    <User size={15} />
                    <span>Iniciar Sesión / Registro</span>
                  </button>
                )}

                {/* Si es Admin: Botón Panel Admin */}
                {currentUser?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => { closeMenu(); onOpenAdmin(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #86efac',
                      background: '#f0fdf4',
                      color: '#15803d',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={16} color="#16a34a" />
                      <span>Panel Admin</span>
                    </div>
                    {pendingCount > 0 && (
                      <span style={{
                        background: 'var(--accent)',
                        color: '#fff',
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '999px'
                      }}>
                        {pendingCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Botón Registrar Servicio */}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => { closeMenu(); onOpenRegister(); }}
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    fontSize: '0.85rem',
                    padding: '8px 10px'
                  }}
                >
                  <PlusCircle size={15} />
                  <span>+ Registrar Servicio</span>
                </button>

                {/* Botón Buzón de Sugerencias */}
                <button
                  type="button"
                  onClick={() => { closeMenu(); onOpenFeedback(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #fde68a',
                    background: '#fffbeb',
                    color: '#b45309',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <MessageSquareHeart size={15} color="#d97706" />
                  <span>Buzón de Sugerencias</span>
                </button>

                {/* Si está conectado: Opción de cerrar sesión */}
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => { closeMenu(); onSignOut(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: '#dc2626',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: '4px',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '8px'
                    }}
                  >
                    <LogOut size={14} />
                    <span>Cerrar Sesión</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
