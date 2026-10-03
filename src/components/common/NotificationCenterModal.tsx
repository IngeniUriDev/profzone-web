import React from 'react';
import { createPortal } from 'react-dom';
import {
  X, Bell, MessageSquareHeart, CheckCheck, Lightbulb, MapPin,
  Sparkles, AlertCircle, MessageCircle, ExternalLink,
  Calendar, Phone

} from 'lucide-react';
import type { FeedbackSuggestion } from '../../types/database';
import { feedbackService } from '../../services/feedbackService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbacks: FeedbackSuggestion[];
  onFeedbacksUpdated: () => void;
  onOpenAdminFeedback: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  feedbacks,
  onFeedbacksUpdated,
  onOpenAdminFeedback
}) => {
  if (!isOpen || typeof document === 'undefined') return null;

  const readIds = feedbackService.getReadIds();
  const unreadCount = feedbacks.filter(f => !readIds.includes(f.id)).length;

  const handleMarkAllRead = () => {
    feedbackService.markAllAsRead(feedbacks);
    onFeedbacksUpdated();
  };

  const handleMarkSingleRead = (id: string) => {
    feedbackService.markAsRead(id);
    onFeedbacksUpdated();
  };

  const handleGoToAdmin = (id: string) => {
    feedbackService.markAsRead(id);
    onFeedbacksUpdated();
    onClose();
    onOpenAdminFeedback();
  };

  const getTypeBadge = (type: FeedbackSuggestion['type']) => {
    switch (type) {
      case 'category':
        return {
          label: 'Nueva Categoría',
          bg: '#fef3c7',
          color: '#92400e',
          icon: <Lightbulb size={13} color="#b45309" />
        };
      case 'municipality':
        return {
          label: 'Municipio / Región',
          bg: '#e0f2fe',
          color: '#075985',
          icon: <MapPin size={13} color="#0284c7" />
        };
      case 'feature':
        return {
          label: 'Mejora App',
          bg: '#ede9fe',
          color: '#5b21b6',
          icon: <Sparkles size={13} color="#7c3aed" />
        };
      case 'correction':
        return {
          label: 'Corrección',
          bg: '#fee2e2',
          color: '#991b1b',
          icon: <AlertCircle size={13} color="#dc2626" />
        };
      default:
        return {
          label: 'Comentario Comunitario',
          bg: '#f1f5f9',
          color: '#334155',
          icon: <MessageCircle size={13} color="#475569" />
        };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Reciente';
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '94%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
        }}
      >
        {/* Encabezado de la ventana de Notificaciones */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(217, 119, 6, 0.25)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={18} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  Buzón de Comentarios
                </h3>
                {unreadCount > 0 ? (
                  <span style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '999px'
                  }}>
                    {unreadCount} nuevo{unreadCount > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '999px'
                  }}>
                    Al día
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Mensajes y opiniones enviadas por vecinos al Buzón de ProfZone
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff'
            }}
            aria-label="Cerrar notificaciones"
          >
            <X size={16} />
          </button>
        </div>

        {/* Barra de Acciones Rápidas */}
        {feedbacks.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '0.8rem'
          }}>
            <span style={{ color: '#64748b' }}>
              Total de comentarios: <strong>{feedbacks.length}</strong>
            </span>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  color: '#0284c7',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                <CheckCheck size={14} />
                <span>Marcar todas como leídas</span>
              </button>
            )}
          </div>
        )}

        {/* Lista de Notificaciones y Comentarios */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, background: '#ffffff' }}>
          {feedbacks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 16px',
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '12px'
            }}>
              <MessageSquareHeart size={36} color="#d97706" style={{ margin: '0 auto 8px auto', display: 'block' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                Aún no hay comentarios recibidos
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                Cuando los vecinos de Santiago Tianguistenco y municipios vecinos envíen opiniones en el Buzón, aparecerán aquí con su nombre y mensaje.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {feedbacks.map((f) => {
                const isRead = readIds.includes(f.id);
                const badge = getTypeBadge(f.type);

                return (
                  <div
                    key={f.id}
                    style={{
                      border: `1px solid ${isRead ? '#e2e8f0' : '#bae6fd'}`,
                      borderRadius: '12px',
                      padding: '14px',
                      background: isRead ? '#ffffff' : '#f0f9ff',
                      boxShadow: isRead ? 'none' : '0 2px 8px rgba(2, 132, 199, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Cabecera de la notificación: Tipo, Nombre y Fecha */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Avatar con la inicial del usuario */}
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isRead ? '#e2e8f0' : '#0284c7',
                          color: isRead ? '#475569' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem'
                        }}>
                          {f.author_name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                              {f.author_name}
                            </strong>
                            {!isRead && (
                              <span style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: '#0284c7'
                              }} title="Mensaje nuevo" />
                            )}
                          </div>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: badge.bg,
                            color: badge.color,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginTop: '2px'
                          }}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#94a3b8' }}>
                        <Calendar size={12} />
                        <span>{formatDate(f.created_at)}</span>
                      </div>
                    </div>

                    {/* Parte del mensaje de comentario */}
                    <div style={{
                      background: isRead ? '#f8fafc' : '#ffffff',
                      border: `1px solid ${isRead ? '#e2e8f0' : '#e0f2fe'}`,
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '0.86rem',
                      color: '#1e293b',
                      lineHeight: 1.45,
                      fontStyle: 'italic'
                    }}>
                      "{f.message}"
                    </div>

                    {/* Pie de la tarjeta: Datos de contacto y acciones */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginTop: '2px',
                      fontSize: '0.78rem'
                    }}>
                      {f.contact ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0369a1' }}>
                          <Phone size={12} />
                          <span>Contacto: <strong>{f.contact}</strong></span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Sin teléfono de contacto</span>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkSingleRead(f.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#64748b',
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            Marcar leído
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleGoToAdmin(f.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          <ExternalLink size={12} />
                          <span>Ver en Panel Admin</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div style={{
          padding: '12px 20px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ fontSize: '0.82rem', padding: '6px 16px' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
