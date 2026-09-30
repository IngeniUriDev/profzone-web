import React from 'react';
import { MapPin, PlusCircle, ShieldCheck, Sparkles, User, LogOut, MessageSquareHeart } from 'lucide-react';
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
  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border)',
      padding: '12px 20px',
      marginBottom: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Marca y Subtítulo - Clickeable para ir a Inicio y limpiar búsqueda */}
        <div
          id="btn-navbar-home"
          onClick={onGoHome}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'opacity 0.2s ease'
          }}
          title="Ir a inicio y restablecer búsqueda"
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.25rem',
            boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)',
            transition: 'transform 0.15s ease'
          }}>
            PZ
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Prof<span style={{ color: 'var(--primary)' }}>Zone</span>
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                background: '#f1f5f9',
                color: '#64748b',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0'
              }}>
                by RoliCode
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <MapPin size={12} color="var(--primary)" />
              <span>Tianguistenco, Capulhuac, Ocoyoacac y Región</span>
            </div>
          </div>
        </div>

        {/* Botones de acción y estado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {!isSupabaseConfigured && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              background: '#fef3c7',
              color: '#92400e',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: 600
            }} title="Para conectar a tu base de datos en la nube, configura tu .env.local">
              <Sparkles size={13} />
              <span>Modo Demo Activo</span>
            </div>
          )}

          {/* Botón Buzón de Sugerencias */}
          <button
            id="btn-open-feedback"
            type="button"
            className="btn btn-secondary"
            onClick={onOpenFeedback}
            style={{ fontSize: '0.85rem', padding: '8px 12px', background: '#fffbeb', borderColor: '#fde68a', color: '#b45309' }}
            title="Envíanos tus ideas, nuevos oficios o municipios que te gustaría ver"
          >
            <MessageSquareHeart size={16} color="#d97706" />
            <span>Buzón de Sugerencias</span>
          </button>

          {/* Estado de Usuario / Login */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                background: 'var(--surface-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: currentUser.provider === 'facebook' ? '#1877F2' : '#16a34a',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    {currentUser.full_name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {currentUser.provider === 'facebook' ? '✓ Facebook' : '✓ Celular SMS'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onSignOut}
                title="Cerrar sesión"
                style={{ padding: '8px 10px' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              id="btn-open-auth"
              type="button"
              className="btn btn-secondary"
              onClick={onOpenAuth}
              style={{ fontSize: '0.85rem', padding: '8px 12px' }}
            >
              <User size={15} color="var(--primary)" />
              <span>Ingresar</span>
            </button>
          )}

          {/* Panel Admin */}
          <button
            id="btn-admin-panel"
            type="button"
            className="btn btn-secondary"
            onClick={onOpenAdmin}
            style={{ fontSize: '0.85rem', padding: '8px 14px', position: 'relative' }}
          >
            <ShieldCheck size={16} />
            <span>Panel Admin</span>
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
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

          {/* Registrar Servicio */}
          <button
            id="btn-register-service"
            type="button"
            className="btn btn-primary"
            onClick={onOpenRegister}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <PlusCircle size={16} />
            <span>Registrar Servicio</span>
          </button>
        </div>
      </div>
    </header>
  );
};
