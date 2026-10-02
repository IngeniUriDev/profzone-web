import React, { useState, useEffect } from 'react';
import {
  X, Check, Trash2, Clock, MapPin, Phone, Shield, RefreshCw,
  MessageSquareHeart, Building2, Layers, Plus, Lightbulb, Globe,
  UserPlus, Crown, Users, Lock, Mail, CheckCircle2,
  Sparkles, Award
} from 'lucide-react';
import type { Business, FeedbackSuggestion, Category, UserProfile } from '../../types/database';
import { businessService } from '../../services/businessService';
import { feedbackService } from '../../services/feedbackService';
import { categoryService } from '../../services/categoryService';
import { adminService, type AdminUser, type AdminRole } from '../../services/adminService';

interface AdminModalProps {
  currentUser?: UserProfile | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ currentUser, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'feedback' | 'categories' | 'admins'>('services');
  const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackSuggestion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);
  
  // Formulario nuevo admin / asignación de rol
  const [newAdminIdentifier, setNewAdminIdentifier] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('moderator');
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Formulario nueva categoría
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Layers');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Privilegios del usuario actual
  const isSuperAdmin = adminService.isSuperAdmin(currentUser?.phone, currentUser?.email);
  const currentAdminUser = adminService.getAdminUser(currentUser?.phone, currentUser?.email);
  const myRole: AdminRole = isSuperAdmin ? 'superadmin' : (currentAdminUser?.role || 'moderator');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pending, listFeedback, listCats, listAdmins] = await Promise.all([
        businessService.getBusinesses({ status: 'pending' }),
        feedbackService.getFeedbacks(),
        categoryService.getCategories(),
        Promise.resolve(adminService.getAdmins())
      ]);
      setPendingBusinesses(pending);
      setFeedbacks(listFeedback);
      setCategories(listCats);
      setAdminsList(listAdmins);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      await businessService.updateBusinessStatus(id, status);
      await loadAll();
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el estado del servicio.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCreatingCategory(true);
    try {
      await categoryService.createCategory({
        name: newCatName.trim(),
        icon: newCatIcon.trim() || 'Layers',
        description: newCatDesc.trim() || undefined
      });
      setNewCatName('');
      setNewCatDesc('');
      setShowAddForm(false);
      await loadAll();
      onUpdate();
      alert('¡Categoría agregada exitosamente!');
    } catch (err) {
      console.error(err);
      alert('Error al crear la categoría.');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!isSuperAdmin) {
      alert('Solo el Superadministrador Principal puede eliminar categorías del catálogo general.');
      return;
    }
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) return;

    try {
      await categoryService.deleteCategory(id);
      await loadAll();
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la categoría.');
    }
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer los datos de prueba a la versión más reciente (incluyendo categorías, doctores y municipios)?')) {
      businessService.resetToInitialData();
      localStorage.removeItem('profzone_categories_v4');
      loadAll();
      onUpdate();
      alert('Datos de prueba sincronizados correctamente.');
    }
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Solo el Superadministrador Principal tiene permisos para designar roles.');
      return;
    }

    const input = newAdminIdentifier.trim();
    if (!input) {
      alert('Ingresa el número celular o correo electrónico del usuario.');
      return;
    }

    const isEmail = input.includes('@');
    const cleanPhone = input.replace(/\D/g, '');

    if (!isEmail && cleanPhone.length < 10) {
      alert('Ingresa un número celular válido a 10 dígitos o un correo electrónico.');
      return;
    }

    const newAdm = adminService.addAdmin({
      name: newAdminName.trim() || (isEmail ? input : `Usuario (${cleanPhone.slice(-4)})`),
      phone: isEmail ? undefined : cleanPhone,
      email: isEmail ? input.toLowerCase() : undefined,
      role: newAdminRole,
      assigned_by: currentAdminUser?.name || currentUser?.full_name || 'Superadministrador Principal'
    });

    setAdminsList(adminService.getAdmins());
    setNewAdminIdentifier('');
    setNewAdminName('');
    setAdminSuccessMsg(`¡Permisos concedidos a ${newAdm.name} con rol de ${getRoleLabel(newAdminRole)}!`);
    setTimeout(() => setAdminSuccessMsg(''), 4500);
  };

  const handleUpdateRole = (id: string, newRole: AdminRole) => {
    if (!isSuperAdmin) {
      alert('Solo el Superadministrador Principal puede cambiar los roles de los colaboradores.');
      return;
    }
    adminService.updateAdminRole(id, newRole);
    setAdminsList(adminService.getAdmins());
  };

  const handleRemoveAdmin = (id: string, name: string) => {
    if (!isSuperAdmin) {
      alert('Solo el Superadministrador Principal puede revocar accesos.');
      return;
    }
    if (!window.confirm(`¿Estás seguro de revocar el acceso a "${name}"? Perderá todos sus privilegios administrativos inmediatamente.`)) return;
    adminService.removeAdmin(id);
    setAdminsList(adminService.getAdmins());
  };

  const getRoleLabel = (role: AdminRole) => {
    switch (role) {
      case 'superadmin':
        return 'Superadministrador (Total)';
      case 'moderator':
        return 'Moderador (Comercios y Feedback)';
      case 'editor':
        return 'Editor de Directorio (Categorías)';
      default:
        return role;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(9, 13, 22, 0.75)' }}>
      {/* Contenedor Ejecutivo del Modal Administrador - Diferenciado de las demás ventanas */}
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '900px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #334155',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.65)'
        }}
      >
        {/* Cabecera Ejecutiva Distintiva (Executive Dark Command Bar) */}
        <div style={{
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 45%, #1e293b 100%)',
          color: '#ffffff',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative'
        }}>
          {/* Botón cerrar flotante */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'background 0.2s ease'
            }}
            aria-label="Cerrar consola de administración"
          >
            <X size={18} />
          </button>

          {/* Insignia y Título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(217, 119, 6, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              <Crown size={12} />
              Consola Ejecutiva • ProfZone
            </span>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: isSuperAdmin ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.2)',
              border: `1px solid ${isSuperAdmin ? 'rgba(34, 197, 94, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`,
              color: isSuperAdmin ? '#4ade80' : '#38bdf8',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {isSuperAdmin ? <Award size={12} /> : <Shield size={12} />}
              {isSuperAdmin ? 'Superadministrador Activo' : `Rol: ${myRole.toUpperCase()}`}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#f8fafc' }}>
                Centro de Operaciones y Moderación
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Autorización de comercios, control de catálogo y asignación de permisos a usuarios.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleResetData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#e2e8f0',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Sincroniza y recarga los datos de prueba más recientes"
              >
                <RefreshCw size={13} />
                <span>Restablecer demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pestañas Ejecutivas de Navegación */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 24px',
          background: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          overflowX: 'auto'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: activeTab === 'services' ? '1px solid #0284c7' : '1px solid transparent',
              background: activeTab === 'services' ? '#ffffff' : 'transparent',
              color: activeTab === 'services' ? '#0369a1' : '#64748b',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'services' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <Building2 size={16} />
            <span>Servicios Pendientes</span>
            {pendingBusinesses.length > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.7rem',
                padding: '1px 6px',
                borderRadius: '10px'
              }}>
                {pendingBusinesses.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: activeTab === 'feedback' ? '1px solid #d97706' : '1px solid transparent',
              background: activeTab === 'feedback' ? '#ffffff' : 'transparent',
              color: activeTab === 'feedback' ? '#b45309' : '#64748b',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'feedback' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <MessageSquareHeart size={16} />
            <span>Buzón de Sugerencias</span>
            {feedbacks.length > 0 && (
              <span style={{
                background: '#f59e0b',
                color: '#fff',
                fontSize: '0.7rem',
                padding: '1px 6px',
                borderRadius: '10px'
              }}>
                {feedbacks.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: activeTab === 'categories' ? '1px solid #6366f1' : '1px solid transparent',
              background: activeTab === 'categories' ? '#ffffff' : 'transparent',
              color: activeTab === 'categories' ? '#4f46e5' : '#64748b',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'categories' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <Layers size={16} />
            <span>Categorías y Giros ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admins')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: activeTab === 'admins' ? '1px solid #16a34a' : '1px solid transparent',
              background: activeTab === 'admins' ? '#ffffff' : 'transparent',
              color: activeTab === 'admins' ? '#15803d' : '#64748b',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'admins' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <Users size={16} />
            <span>Permisos y Roles</span>
            <span style={{
              background: '#22c55e',
              color: '#fff',
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: '10px'
            }}>
              {adminsList.length}
            </span>
          </button>
        </div>

        {/* Contenido Principal con Scroll Interno */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#ffffff' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Cargando información administrativa...
            </div>
          ) : activeTab === 'services' ? (
            /* TAB 1: SERVICIOS PENDIENTES */
            <div>
              {pendingBusinesses.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 24px',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px'
                }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto'
                  }}>
                    <Check size={28} />
                  </div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '4px', color: '#1e293b' }}>
                    ¡Todo al día en Santiago Tianguistenco y Región!
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto' }}>
                    No hay solicitudes de negocios o prestadores de servicios pendientes de aprobación. Los comercios aprobados se muestran en tiempo real en la página principal.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {pendingBusinesses.map((b) => (
                    <div key={b.id} style={{
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '18px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{b.name}</h4>
                            <span className="badge badge-pending">Revisión Requerida</span>
                          </div>
                          <p style={{ fontSize: '0.86rem', color: '#475569', marginTop: '4px' }}>
                            {b.description || 'Sin descripción ingresada'}
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={processingId === b.id}
                            onClick={() => handleAction(b.id, 'approved')}
                            style={{
                              background: '#16a34a',
                              borderColor: '#16a34a',
                              padding: '8px 14px',
                              fontSize: '0.82rem',
                              fontWeight: 700
                            }}
                          >
                            <Check size={15} />
                            <span>Aprobar Publicación</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={processingId === b.id}
                            onClick={() => handleAction(b.id, 'rejected')}
                            style={{
                              color: '#dc2626',
                              borderColor: '#fca5a5',
                              padding: '8px 14px',
                              fontSize: '0.82rem'
                            }}
                          >
                            <Trash2 size={15} />
                            <span>Rechazar</span>
                          </button>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '14px',
                        fontSize: '0.82rem',
                        color: '#475569',
                        background: '#f8fafc',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MapPin size={14} color="#0284c7" />
                          <span>{b.address} {b.locality ? `(${b.locality})` : ''} - <strong>{b.municipality}</strong></span>
                        </div>

                        {b.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Phone size={14} color="#16a34a" />
                            <span>Tel: {b.phone}</span>
                          </div>
                        )}

                        {b.schedule && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={14} color="#64748b" />
                            <span>{b.schedule}</span>
                          </div>
                        )}

                        {b.website_url && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Globe size={14} color="#0284c7" />
                            <a
                              href={b.website_url.startsWith('http') ? b.website_url : `https://${b.website_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#0284c7', textDecoration: 'underline', fontWeight: 600 }}
                            >
                              Sitio Web
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'feedback' ? (
            /* TAB 2: BUZÓN DE SUGERENCIAS */
            <div>
              {feedbacks.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 20px',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px'
                }}>
                  <MessageSquareHeart size={40} color="#d97706" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px', color: '#1e293b' }}>
                    Buzón Limpio
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                    Los mensajes y propuestas de nuevos giros o municipios enviados por los vecinos aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {feedbacks.map((f) => (
                    <div key={f.id} style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '16px',
                      background: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 9px',
                          borderRadius: '6px',
                          background: '#fef3c7',
                          color: '#92400e',
                          textTransform: 'uppercase'
                        }}>
                          {f.type === 'category' ? '💡 Nueva Categoría' :
                           f.type === 'municipality' ? '📍 Municipio/Zona' :
                           f.type === 'feature' ? '⚡ Mejora App' :
                           f.type === 'correction' ? '⚠️ Corrección' : '💬 Comentario'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          {new Date(f.created_at).toLocaleDateString('es-MX')}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.92rem', color: '#1e293b', margin: '4px 0', lineHeight: 1.5 }}>
                        "{f.message}"
                      </p>

                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Enviado por: <strong>{f.author_name}</strong> {f.contact ? `• Contacto: ${f.contact}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'categories' ? (
            /* TAB 3: CATEGORÍAS */
            <div>
              {/* Resumen explicativo */}
              <div style={{
                display: 'flex',
                gap: '12px',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '16px'
              }}>
                <Lightbulb size={24} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.85rem', color: '#0369a1', lineHeight: 1.5 }}>
                  <strong>Curaduría del Directorio:</strong>
                  <div style={{ marginTop: '4px' }}>
                    Las categorías maestras clasifican los giros comerciales en Santiago Tianguistenco y municipios vecinos.
                    Las especialidades médicas y sub-ramos se configuran dentro de cada establecimiento para permitir búsquedas precisas en el buscador general.
                  </div>
                </div>
              </div>

              {/* Encabezado y botón agregar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                    Categorías del Directorio ({categories.length})
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Visibles en el carrusel de inicio y en los filtros de búsqueda.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowAddForm(!showAddForm)}
                  style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                >
                  <Plus size={15} />
                  <span>{showAddForm ? 'Cerrar Formulario' : 'Agregar Nueva Categoría'}</span>
                </button>
              </div>

              {/* Formulario para Crear Categoría */}
              {showAddForm && (
                <form onSubmit={handleCreateCategory} style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Crear Nueva Categoría o Ramo Comercial
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                        Nombre de la Categoría *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Papelerías y Copias, Veterinarias y Mascotas..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                        Ícono Lucide
                      </label>
                      <select
                        value={newCatIcon}
                        onChange={(e) => setNewCatIcon(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <option value="Layers">Layers (General)</option>
                        <option value="Stethoscope">Stethoscope (Médicos/Hospitales)</option>
                        <option value="Smile">Smile (Dental)</option>
                        <option value="Baby">Baby (Infantil/Bebés)</option>
                        <option value="Utensils">Utensils (Comida/Restaurantes)</option>
                        <option value="Music">Music (Música/Mariachis)</option>
                        <option value="Wrench">Wrench (Oficios/Talleres)</option>
                        <option value="Sparkles">Sparkles (Belleza/Estética)</option>
                        <option value="HeartHandshake">HeartHandshake (Psicología/Salud)</option>
                        <option value="Scale">Scale (Leyes/Notarías)</option>
                        <option value="BookOpen">BookOpen (Papelerías/Escolar)</option>
                        <option value="ShoppingBag">ShoppingBag (Comercio)</option>
                        <option value="Car">Car (Automotriz)</option>
                        <option value="Home">Home (Hogar/Inmobiliaria)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                      Descripción breve
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Servicios de copias, engargolados y útiles escolares en la región"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddForm(false)}
                      style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creatingCategory}
                      className="btn btn-primary"
                      style={{ fontSize: '0.82rem', padding: '7px 16px' }}
                    >
                      {creatingCategory ? 'Guardando...' : 'Guardar Categoría'}
                    </button>
                  </div>
                </form>
              )}

              {/* Grid de Categorías */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {categories.map((cat) => (
                  <div key={cat.id} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px',
                    background: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{
                        background: '#e0e7ff',
                        padding: '8px',
                        borderRadius: '8px',
                        color: '#4f46e5',
                        display: 'flex',
                        flexShrink: 0
                      }}>
                        <Layers size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
                          {cat.name}
                        </h4>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                          Ícono: <code>{cat.icon || 'Layers'}</code>
                        </div>
                        {cat.description && (
                          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSuperAdmin && (
                      <button
                        type="button"
                        title="Eliminar categoría"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'color 0.15s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* TAB 4: GESTIÓN DE ROLES Y PERMISOS DE USUARIOS (ASIGNACIÓN DEFINIDA POR EL ADMIN PRINCIPAL) */
            <div>
              {/* Tarjetas informativas de jerarquía de roles */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: '#fefce8',
                  border: '1px solid #fef08a'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Crown size={18} color="#ca8a04" />
                    <strong style={{ fontSize: '0.88rem', color: '#854d0e' }}>Superadministrador</strong>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#713f12', margin: 0, lineHeight: 1.4 }}>
                    Control total: asigna y revoca roles a otros colaboradores, aprueba negocios y gestiona categorías maestras.
                  </p>
                </div>

                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Shield size={18} color="#16a34a" />
                    <strong style={{ fontSize: '0.88rem', color: '#166534' }}>Moderador</strong>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#14532d', margin: 0, lineHeight: 1.4 }}>
                    Operación de campo: revisa y aprueba/rechaza negocios propuestos y lee el buzón de sugerencias de los vecinos.
                  </p>
                </div>

                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Sparkles size={18} color="#2563eb" />
                    <strong style={{ fontSize: '0.88rem', color: '#1e40af' }}>Editor de Directorio</strong>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#1e3a8a', margin: 0, lineHeight: 1.4 }}>
                    Curaduría: puede dar de alta nuevas categorías, giros y ramos comerciales en el directorio general.
                  </p>
                </div>
              </div>

              {/* Mensaje de éxito de asignación */}
              {adminSuccessMsg && (
                <div style={{
                  padding: '12px 16px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '8px',
                  color: '#065f46',
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span>{adminSuccessMsg}</span>
                </div>
              )}

              {/* Formulario para que el Superadmin asigne roles a nuevos usuarios */}
              {isSuperAdmin ? (
                <form
                  onSubmit={handleAddAdmin}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '18px',
                    marginBottom: '24px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <UserPlus size={18} color="#0284c7" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      Designar Nuevo Colaborador o Cambiar Permisos
                    </h4>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 14px 0' }}>
                    Ingresa el celular (10 dígitos) o correo del usuario para otorgarle acceso a la consola con el rol especificado.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                        Nombre del Colaborador
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Carlos Mendoza (Soporte)"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.88rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                        Celular (10 dígitos) o Correo
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="7141234567 o correo@gmail.com"
                        value={newAdminIdentifier}
                        onChange={(e) => setNewAdminIdentifier(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.88rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                        Rol Asignado
                      </label>
                      <select
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.88rem',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <option value="moderator">🛡️ Moderador</option>
                        <option value="editor">✏️ Editor de Directorio</option>
                        <option value="superadmin">👑 Superadministrador</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{
                        padding: '9px 18px',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        background: '#0284c7',
                        borderColor: '#0284c7'
                      }}
                    >
                      <UserPlus size={16} />
                      <span>Conceder Rol</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{
                  padding: '14px 16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#64748b',
                  fontSize: '0.84rem'
                }}>
                  <Lock size={18} color="#94a3b8" />
                  <span>
                    La designación de nuevos colaboradores y asignación de roles está reservada al <strong>Superadministrador Principal</strong>.
                  </span>
                </div>
              )}

              {/* Lista Interactiva de Administradores y Roles */}
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 10px 0', color: '#0f172a' }}>
                  Colaboradores y Administradores Autorizados ({adminsList.length})
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {adminsList.map((adm) => (
                  <div
                    key={adm.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: adm.is_superadmin || adm.role === 'superadmin' ? '#f59e0b' :
                                    adm.role === 'editor' ? '#6366f1' : '#0284c7',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1rem',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}>
                        {adm.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{adm.name}</span>

                          {adm.is_superadmin ? (
                            <span style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Crown size={12} />
                              Superadmin Principal (Protegido)
                            </span>
                          ) : (
                            <span style={{
                              background: adm.role === 'editor' ? '#ede9fe' : '#e0f2fe',
                              color: adm.role === 'editor' ? '#5b21b6' : '#075985',
                              border: `1px solid ${adm.role === 'editor' ? '#ddd6fe' : '#bae6fd'}`,
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {adm.role === 'editor' ? <Sparkles size={12} /> : <Shield size={12} />}
                              {getRoleLabel(adm.role)}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {adm.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} /> Celular: +52 {adm.phone}
                            </span>
                          )}
                          {adm.email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={12} /> Correo: {adm.email}
                            </span>
                          )}
                          <span>• Alta: {new Date(adm.added_at).toLocaleDateString()}</span>
                          {adm.assigned_by && (
                            <span>• Por: <em>{adm.assigned_by}</em></span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones de Rol y Revocación */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {isSuperAdmin && !adm.is_superadmin && (
                        <select
                          value={adm.role}
                          onChange={(e) => handleUpdateRole(adm.id, e.target.value as AdminRole)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            backgroundColor: '#f8fafc'
                          }}
                        >
                          <option value="moderator">Rol: Moderador</option>
                          <option value="editor">Rol: Editor</option>
                          <option value="superadmin">Rol: Superadmin</option>
                        </select>
                      )}

                      {adm.is_superadmin ? (
                        <div title="El Superadministrador Principal no puede ser eliminado por seguridad">
                          <Lock size={16} color="#94a3b8" />
                        </div>
                      ) : isSuperAdmin ? (
                        <button
                          type="button"
                          title="Revocar acceso de administrador"
                          onClick={() => handleRemoveAdmin(adm.id, adm.name)}
                          style={{
                            border: '1px solid #fecaca',
                            background: '#fef2f2',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Revocar</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
