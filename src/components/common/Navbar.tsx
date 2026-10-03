import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, PlusCircle, ShieldCheck, User, LogOut, MessageSquareHeart, Menu, X, ChevronDown, Info, PhoneCall, KeyRound, Crown, CheckCircle2, Bell, Sun, Moon, Briefcase } from 'lucide-react';
import type { UserProfile } from '../../types/database';
import { authService } from '../../services/authService';

interface NavbarProps {
  onOpenRegister: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onOpenFeedback: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
  onGoHome: () => void;
  onOpenMyBusinesses?: () => void;
  myBusinessesCount?: number;
  activeView?: 'all' | 'my-businesses';
  currentUser: UserProfile | null;
  onSignOut: () => void;
  pendingCount: number;
  unreadFeedbackCount?: number;
  onOpenNotifications?: () => void;
  onUserUpdated?: (user: UserProfile) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRegister,
  onOpenAdmin,
  onOpenAuth,
  onOpenFeedback,
  onOpenAbout,
  onOpenContact,
  onGoHome,
  onOpenMyBusinesses,
  myBusinessesCount = 0,
  activeView = 'all',
  currentUser,
  onSignOut,
  pendingCount,
  unreadFeedbackCount = 0,
  onOpenNotifications,
  onUserUpdated,
  theme = 'light',
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const handleClaimAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    try {
      const updated = authService.claimAdminWithPin(pinInput);
      if (onUserUpdated) {
        onUserUpdated(updated);
      }
      setPinSuccess('¡Privilegios de Superadministrador activados permanentemente!');
      setTimeout(() => {
        setShowAccountModal(false);
        setPinSuccess('');
        setPinInput('');
      }, 1500);
    } catch {
      setPinError('Clave incorrecta. Verifica tu clave maestra.');
    }
  };

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border)',
      backgroundColor: 'var(--glass-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
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
                background: 'var(--surface-secondary)',
                color: 'var(--text-muted)',
                padding: '1px 5px',
                borderRadius: '4px',
                border: '1px solid var(--border)'
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

          {/* Botón Acerca de */}
          <button
            id="btn-open-about"
            type="button"
            className="btn btn-secondary"
            onClick={onOpenAbout}
            style={{ fontSize: '0.8rem', padding: '6px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}
            title="Conoce la finalidad de ProfZone y a su desarrollador"
          >
            <Info size={14} color="var(--primary)" />
            <span>Acerca de</span>
          </button>

          {/* Botón Contacto y Soporte */}
          <button
            id="btn-open-contact"
            type="button"
            className="btn btn-secondary"
            onClick={onOpenContact}
            style={{ fontSize: '0.8rem', padding: '6px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}
            title="Contacto y Soporte"
          >
            <PhoneCall size={14} color="#059669" />
            <span>Contacto</span>
          </button>

          {/* Botón Buzón de Sugerencias */}
          <button
            id="btn-open-feedback"
            type="button"
            className="btn btn-secondary"
            onClick={onOpenFeedback}
            style={{ fontSize: '0.8rem', padding: '6px 10px', background: 'var(--surface-secondary)', color: 'var(--text-main)', whiteSpace: 'nowrap', flexShrink: 0 }}
            title="Envíanos tus ideas"
          >
            <MessageSquareHeart size={14} color="#d97706" />
            <span>Buzón</span>
          </button>

          {/* Botón Tema Oscuro / Claro */}
          {onToggleTheme && (
            <button
              id="btn-toggle-theme"
              type="button"
              className="btn btn-secondary"
              onClick={onToggleTheme}
              style={{
                fontSize: '0.8rem',
                padding: '6px 9px',
                borderRadius: '8px',
                flexShrink: 0
              }}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#64748b" />}
            </button>
          )}

          {/* Estado de Usuario / Menú Desplegable con Funciones de Usuario */}
          {currentUser ? (
            <div ref={userDropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                id="btn-user-menu"
                type="button"
                aria-label="Menú de funciones de usuario"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                title="Menú de funciones de usuario"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px',
                  background: userDropdownOpen ? 'var(--surface)' : 'var(--surface-secondary)',
                  borderRadius: '10px',
                  border: userDropdownOpen ? '1px solid var(--primary)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: userDropdownOpen ? '0 0 0 2px rgba(2, 132, 199, 0.2)' : 'none'
                }}
              >
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: currentUser.provider === 'facebook' ? '#1877F2' : (currentUser.provider === 'google' ? '#ea4335' : '#16a34a'),
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    {currentUser.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.full_name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: currentUser.role === 'admin' ? '#15803d' : '#64748b', fontWeight: currentUser.role === 'admin' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {currentUser.role === 'admin' ? (
                      <>
                        <Crown size={11} color="#15803d" />
                        <span>Superadmin</span>
                      </>
                    ) : (
                      <span>Usuario</span>
                    )}
                  </div>
                </div>
                <ChevronDown
                  size={14}
                  style={{
                    color: 'var(--text-muted)',
                    transform: userDropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </button>

              {/* Menú Desplegable con Funciones de Usuario */}
              {userDropdownOpen && (
                <div
                  id="user-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '280px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
                    padding: '8px',
                    zIndex: 210,
                    backdropFilter: 'blur(16px)',
                    animation: 'fadeIn 0.15s ease-out'
                  }}
                >
                  {/* Tarjeta de perfil en la cabecera */}
                  <div style={{
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'var(--surface-secondary)',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {currentUser.avatar_url ? (
                      <img
                        src={currentUser.avatar_url}
                        alt={currentUser.full_name}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid var(--primary)'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: currentUser.provider === 'facebook' ? '#1877F2' : (currentUser.provider === 'google' ? '#ea4335' : '#16a34a'),
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: 700
                      }}>
                        {currentUser.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.full_name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.email || currentUser.phone || 'Cuenta activa'}
                      </div>
                      <div style={{ marginTop: '3px' }}>
                        {currentUser.role === 'admin' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            background: '#dcfce7',
                            color: '#15803d',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            <Crown size={10} /> Superadmin
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            background: 'var(--surface)',
                            color: 'var(--text-muted)',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            border: '1px solid var(--border)'
                          }}>
                            Usuario
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones principales del usuario */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {/* Mis Negocios */}
                    {onOpenMyBusinesses && (
                      <button
                        id="user-menu-my-businesses"
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenMyBusinesses();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: 'none',
                          background: activeView === 'my-businesses' ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                          color: activeView === 'my-businesses' ? 'var(--primary)' : 'var(--text-main)',
                          fontSize: '0.83rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-secondary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = activeView === 'my-businesses' ? 'rgba(2, 132, 199, 0.12)' : 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Briefcase size={15} color="var(--primary)" />
                          <span>Mis Negocios</span>
                        </div>
                        {myBusinessesCount > 0 && (
                          <span style={{
                            background: 'var(--primary)',
                            color: '#ffffff',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '999px'
                          }}>
                            {myBusinessesCount}
                          </span>
                        )}
                      </button>
                    )}

                    {/* Registrar Nuevo Negocio */}
                    <button
                      id="user-menu-register"
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenRegister();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-main)',
                        fontSize: '0.83rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <PlusCircle size={15} color="#059669" />
                      <span>Registrar Nuevo Negocio</span>
                    </button>

                    {/* Buzón de Sugerencias */}
                    <button
                      id="user-menu-feedback"
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenFeedback();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-main)',
                        fontSize: '0.83rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <MessageSquareHeart size={15} color="#d97706" />
                      <span>Buzón de Sugerencias</span>
                    </button>

                    {/* Funciones de Admin si aplica */}
                    {currentUser.role === 'admin' && (
                      <>
                        <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', padding: '2px 8px', letterSpacing: '0.04em' }}>
                          ADMINISTRACIÓN
                        </div>

                        <button
                          id="user-menu-admin-panel"
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAdmin();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            color: '#15803d',
                            fontSize: '0.83rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fdf4')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Crown size={15} color="#16a34a" />
                            <span>Panel Administrador</span>
                          </div>
                          {pendingCount > 0 && (
                            <span style={{
                              background: '#ef4444',
                              color: '#fff',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: '999px'
                            }}>
                              {pendingCount}
                            </span>
                          )}
                        </button>

                        <button
                          id="user-menu-notifications"
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenNotifications && onOpenNotifications();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            color: '#b45309',
                            fontSize: '0.83rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#fffbeb')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bell size={15} color="#d97706" />
                            <span>Notificaciones Buzón</span>
                          </div>
                          {unreadFeedbackCount > 0 && (
                            <span style={{
                              background: '#ef4444',
                              color: '#fff',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: '999px'
                            }}>
                              {unreadFeedbackCount}
                            </span>
                          )}
                        </button>
                      </>
                    )}

                    <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

                    {/* Vincular superadmin / Opciones de cuenta */}
                    <button
                      id="user-menu-account"
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setShowAccountModal(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-main)',
                        fontSize: '0.83rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <KeyRound size={15} color="#64748b" />
                      <span>{currentUser.role === 'admin' ? 'Opciones de Cuenta' : 'Vincular Clave Maestra'}</span>
                    </button>

                    {/* Cerrar Sesión */}
                    <button
                      id="user-menu-logout"
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onSignOut();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        fontSize: '0.83rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut size={15} color="#ef4444" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-open-auth"
              type="button"
              className="btn btn-secondary"
              onClick={onOpenAuth}
              style={{ fontSize: '0.8rem', padding: '6px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <User size={14} color="var(--primary)" />
              <span>Ingresar</span>
            </button>
          )}

          {/* Campanita de Notificaciones del Buzón (Solo para Admin) */}
          {currentUser?.role === 'admin' && (
            <button
              id="btn-admin-notifications"
              type="button"
              className="btn btn-secondary"
              onClick={onOpenNotifications}
              style={{
                fontSize: '0.8rem',
                padding: '6px 11px',
                position: 'relative',
                background: unreadFeedbackCount > 0 ? '#fffbeb' : 'var(--surface-secondary)',
                borderColor: unreadFeedbackCount > 0 ? '#fde68a' : 'var(--border)',
                color: unreadFeedbackCount > 0 ? '#b45309' : '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              title="Notificaciones de comentarios del Buzón"
            >
              <Bell size={15} color={unreadFeedbackCount > 0 ? '#d97706' : '#64748b'} />
              <span>Buzón ({unreadFeedbackCount})</span>
              {unreadFeedbackCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  minWidth: '17px',
                  height: '17px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff'
                }}>
                  {unreadFeedbackCount}
                </span>
              )}
            </button>
          )}

          {/* Panel Admin (Solo visible para usuarios con rol 'admin') */}
          {currentUser?.role === 'admin' && (
            <button
              id="btn-admin-panel"
              type="button"
              className="btn btn-primary"
              onClick={onOpenAdmin}
              style={{
                fontSize: '0.8rem',
                padding: '6px 14px',
                position: 'relative',
                background: '#16a34a',
                borderColor: '#15803d',
                color: '#ffffff',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              title="Panel de Administración y Moderación"
            >
              <Crown size={14} />
              <span>Panel Admin</span>
              {pendingCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
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

          {/* Botón Mis Negocios (Solo visible si hay sesión iniciada) */}
          {currentUser && onOpenMyBusinesses && (
            <button
              id="btn-my-businesses"
              type="button"
              className={`btn ${activeView === 'my-businesses' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={onOpenMyBusinesses}
              style={{
                fontSize: '0.8rem',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                ...(activeView === 'my-businesses' ? {
                  background: 'var(--primary)',
                  color: '#ffffff'
                } : {
                  background: 'var(--surface-secondary)',
                  color: 'var(--primary)',
                  borderColor: 'var(--primary)'
                })
              }}
              title="Ver y editar mis publicaciones de negocios"
            >
              <Briefcase size={14} />
              <span>Mis Negocios</span>
              {myBusinessesCount > 0 && (
                <span style={{
                  background: activeView === 'my-businesses' ? '#ffffff' : 'var(--primary)',
                  color: activeView === 'my-businesses' ? 'var(--primary)' : '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '999px'
                }}>
                  {myBusinessesCount}
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
            style={{ fontSize: '0.8rem', padding: '6px 12px', whiteSpace: 'nowrap', flexShrink: 0 }}
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
              currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
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
              )
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
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {currentUser.avatar_url ? (
                      <img
                        src={currentUser.avatar_url}
                        alt={currentUser.full_name}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid var(--primary)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: currentUser.provider === 'facebook' ? '#1877F2' : (currentUser.provider === 'google' ? '#ea4335' : '#16a34a'),
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: 700
                      }}>
                        {currentUser.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.full_name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.email || (currentUser.phone ? currentUser.phone : (currentUser.provider === 'facebook' ? `Facebook: ${currentUser.full_name}` : 'Conectado'))}
                      </div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: currentUser.role === 'admin' ? '#15803d' : '#0284c7', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {currentUser.role === 'admin' ? (
                          <>
                            <ShieldCheck size={12} color="#15803d" />
                            <span>Administrador</span>
                          </>
                        ) : (
                          currentUser.provider === 'facebook' 
                            ? `Facebook (${currentUser.full_name})` 
                            : (currentUser.provider === 'google' ? `Google (${currentUser.full_name})` : 'Usuario Registrado')
                        )}
                      </div>
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

                {/* Botón Mis Negocios en Menú Móvil (Solo si hay sesión iniciada) */}
                {currentUser && onOpenMyBusinesses && (
                  <button
                    type="button"
                    onClick={() => { closeMenu(); onOpenMyBusinesses(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--primary)',
                      background: activeView === 'my-businesses' ? 'var(--primary)' : 'rgba(2, 132, 199, 0.08)',
                      color: activeView === 'my-businesses' ? '#ffffff' : 'var(--primary)',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginBottom: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={16} />
                      <span>Mis Negocios</span>
                    </div>
                    {myBusinessesCount > 0 && (
                      <span style={{
                        background: activeView === 'my-businesses' ? '#ffffff' : 'var(--primary)',
                        color: activeView === 'my-businesses' ? 'var(--primary)' : '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '1px 7px',
                        borderRadius: '10px'
                      }}>
                        {myBusinessesCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Si es Admin: Botón Notificaciones del Buzón */}
                {currentUser?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => { closeMenu(); onOpenNotifications && onOpenNotifications(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #fde68a',
                      background: '#fffbeb',
                      color: '#b45309',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginBottom: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={15} color="#d97706" />
                      <span>Notificaciones del Buzón</span>
                    </div>
                    {unreadFeedbackCount > 0 && (
                      <span style={{
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '1px 7px',
                        borderRadius: '10px'
                      }}>
                        {unreadFeedbackCount} nuevo{unreadFeedbackCount > 1 ? 's' : ''}
                      </span>
                    )}
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

                {/* Botón Información / Acerca de */}
                <button
                  type="button"
                  onClick={() => { closeMenu(); onOpenAbout(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd',
                    background: '#f0f9ff',
                    color: '#0369a1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Info size={15} color="var(--primary)" />
                  <span>Acerca de ProfZone</span>
                </button>

                {/* Botón Contacto y Soporte */}
                <button
                  type="button"
                  onClick={() => { closeMenu(); onOpenContact(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                    background: '#f0fdf4',
                    color: '#166534',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <PhoneCall size={15} color="#16a34a" />
                  <span>Contacto y Soporte</span>
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

                {/* Selector Modo Oscuro / Claro en Móvil */}
                {onToggleTheme && (
                  <button
                    type="button"
                    onClick={() => { onToggleTheme(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface-secondary)',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#64748b" />}
                      <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                    </div>
                    {theme === 'dark' ? <Sun size={14} color="#fbbf24" /> : <Moon size={14} color="#64748b" />}
                  </button>
                )}

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

      {/* Modal de Detalles de Perfil y Activación de Superadministrador (con Portal al body para centrado perfecto) */}
      {showAccountModal && currentUser && typeof document !== 'undefined' && createPortal(
        <div className="modal-overlay" onClick={() => setShowAccountModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', margin: 'auto' }}>
            <button
              type="button"
              onClick={() => setShowAccountModal(false)}
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

            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                margin: '0 auto 12px auto',
                overflow: 'hidden',
                border: '3px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e0f2fe'
              }}>
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt={currentUser.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {currentUser.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                {currentUser.full_name}
              </h3>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b' }}>
                <span>Conectado con Facebook</span>
                <span>•</span>
                <strong style={{ color: currentUser.role === 'admin' ? '#16a34a' : '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {currentUser.role === 'admin' ? (
                    <>
                      <Crown size={13} color="#16a34a" />
                      <span>Superadministrador</span>
                    </>
                  ) : (
                    'Usuario Comunitario'
                  )}
                </strong>
              </div>
            </div>

            {pinSuccess && (
              <div style={{
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>{pinSuccess}</span>
              </div>
            )}

            {pinError && (
              <div style={{
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                marginBottom: '14px',
                textAlign: 'center'
              }}>
                {pinError}
              </div>
            )}

            {/* Si aún no es admin: Formulario de vinculación con clave maestra */}
            {currentUser.role !== 'admin' ? (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <KeyRound size={18} color="#d97706" />
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Vincular como Superadministrador
                  </h4>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                  Si eres el desarrollador o administrador principal de ProfZone, ingresa tu Clave Maestra para activar el panel en tu cuenta de Facebook para siempre.
                </p>

                <form onSubmit={handleClaimAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="password"
                    required
                    placeholder="Ingresa tu clave maestra..."
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.86rem', padding: '9px' }}
                  >
                    <Crown size={15} />
                    <span>Activar Permisos de Admin</span>
                  </button>
                </form>
              </div>
            ) : (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '14px',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Crown size={22} color="#16a34a" />
                <div style={{ fontSize: '0.84rem', color: '#166534' }}>
                  <strong>Perfil Autorizado:</strong> Tienes acceso total a la Consola de Administración para moderar negocios, categorías y asignar colaboradores.
                </div>
              </div>
            )}

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setShowAccountModal(false); onSignOut(); }}
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.84rem', color: '#dc2626' }}
              >
                <LogOut size={14} />
                <span>Cerrar Sesión</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAccountModal(false)}
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.84rem' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};


