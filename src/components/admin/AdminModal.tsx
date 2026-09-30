import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Clock, MapPin, Phone, Shield, RefreshCw, MessageSquareHeart, Building2, Layers, Plus, Lightbulb, Globe, UserPlus } from 'lucide-react';
import type { Business, FeedbackSuggestion, Category } from '../../types/database';
import { businessService } from '../../services/businessService';
import { feedbackService } from '../../services/feedbackService';
import { categoryService } from '../../services/categoryService';
import { adminService, type AdminUser } from '../../services/adminService';

interface AdminModalProps {
  onClose: () => void;
  onUpdate: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'feedback' | 'categories' | 'admins'>('services');
  const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackSuggestion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Formulario nueva categoría
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Layers');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

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
    const clean = newAdminPhone.replace(/\D/g, '');
    if (clean.length < 10) {
      alert('Ingresa un número celular válido a 10 dígitos.');
      return;
    }
    adminService.addAdmin(clean, newAdminName);
    setNewAdminPhone('');
    setNewAdminName('');
    setAdminsList(adminService.getAdmins());
    alert(`¡Permisos de administrador concedidos a ${newAdminName || clean}! Podrá acceder al panel al verificar su celular.`);
  };

  const handleRemoveAdmin = (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de revocar permisos de administrador a "${name}"?`)) return;
    adminService.removeAdmin(id);
    setAdminsList(adminService.getAdmins());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '740px' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex'
            }}>
              <Shield size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                Panel de Moderación y Gestión
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Revisa y autoriza servicios propuestos o lee sugerencias de la comunidad.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResetData}
            style={{ fontSize: '0.78rem', padding: '6px 10px' }}
            title="Sincroniza y recarga los datos de prueba más recientes"
          >
            <RefreshCw size={13} />
            <span>Restablecer demo</span>
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '16px', paddingBottom: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'services' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'services' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Building2 size={16} />
            <span>Servicios Pendientes ({pendingBusinesses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'feedback' ? '#fef3c7' : 'transparent',
              color: activeTab === 'feedback' ? '#b45309' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <MessageSquareHeart size={16} />
            <span>Buzón de Sugerencias ({feedbacks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'categories' ? '#e0e7ff' : 'transparent',
              color: activeTab === 'categories' ? '#4338ca' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Layers size={16} />
            <span>Categorías ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admins')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'admins' ? '#dcfce7' : 'transparent',
              color: activeTab === 'admins' ? '#15803d' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Shield size={16} />
            <span>Administradores ({adminsList.length})</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Cargando información...
          </div>
        ) : activeTab === 'services' ? (
          <div>
            {pendingBusinesses.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: 'var(--surface-secondary)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <Check size={36} color="var(--success)" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>
                  ¡Todo al día!
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No hay solicitudes de negocios pendientes de aprobación en este momento.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {pendingBusinesses.map((b) => (
                  <div key={b.id} style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    backgroundColor: 'var(--surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{b.name}</h4>
                          <span className="badge badge-pending">Pendiente</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {b.description || 'Sin descripción'}
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
                            padding: '6px 12px',
                            fontSize: '0.8rem'
                          }}
                        >
                          <Check size={14} />
                          <span>Aprobar</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={processingId === b.id}
                          onClick={() => handleAction(b.id, 'rejected')}
                          style={{
                            color: '#dc2626',
                            borderColor: '#fca5a5',
                            padding: '6px 12px',
                            fontSize: '0.8rem'
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Rechazar</span>
                        </button>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '14px',
                      fontSize: '0.8rem',
                      color: '#475569',
                      background: 'var(--surface-secondary)',
                      padding: '8px 12px',
                      borderRadius: '6px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="var(--primary)" />
                        <span>{b.address} {b.locality ? `(${b.locality})` : ''} - <strong>{b.municipality}</strong></span>
                      </div>

                      {b.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={13} />
                          <span>Tel: {b.phone}</span>
                        </div>
                      )}

                      {b.schedule && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} />
                          <span>{b.schedule}</span>
                        </div>
                      )}

                      {b.website_url && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Globe size={13} color="var(--primary)" />
                          <a
                            href={b.website_url.startsWith('http') ? b.website_url : `https://${b.website_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--primary)', textDecoration: 'underline' }}
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
          <div>
            {feedbacks.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: 'var(--surface-secondary)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <MessageSquareHeart size={36} color="#d97706" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>
                  Aún no hay sugerencias
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Los mensajes enviados por los vecinos a través del Buzón de Sugerencias aparecerán aquí.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {feedbacks.map((f) => (
                  <div key={f.id} style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 16px',
                    background: 'var(--surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
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
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(f.created_at).toLocaleDateString('es-MX')}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '4px' }}>
                      "{f.message}"
                    </p>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Enviado por: <strong>{f.author_name}</strong> {f.contact ? `(Contacto: ${f.contact})` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'categories' ? (
          <div>
            {/* Explicación de Categorías vs Especialidades */}
            <div style={{
              display: 'flex',
              gap: '12px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '16px'
            }}>
              <Lightbulb size={24} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.84rem', color: '#0369a1', lineHeight: 1.5 }}>
                <strong>¿Cómo funcionan las Categorías y Especialidades?</strong>
                <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                  <li><strong>Categoría General:</strong> Agrupa los establecimientos (ej. <em>Hospitales, Clínicas y Médicos</em>, <em>Consultorios Dentales</em>, <em>Talleres</em>).</li>
                  <li><strong>Especialidades Médicas:</strong> Disciplinas como <em>Pediatría y Salud Infantil</em>, <em>Alergología</em> o <em>Ginecología</em> entran dentro de <strong>Hospitales, Clínicas y Médicos</strong> y se asignan a los doctores o personal de cada clínica.</li>
                  <li><strong>Buscador Inteligente:</strong> Cuando los vecinos buscan <em>"pediatra"</em> o <em>"salud infantil"</em>, el buscador localiza automáticamente la clínica y el médico correspondiente en su municipio.</li>
                </ul>
              </div>
            </div>

            {/* Cabecera y Botón Nueva Categoría */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
                  Categorías Registradas ({categories.length})
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Las categorías activas aparecen en el carrusel de inicio y en los filtros de búsqueda.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              >
                <Plus size={15} />
                <span>{showAddForm ? 'Cerrar Formulario' : 'Agregar Categoría'}</span>
              </button>
            </div>

            {/* Formulario para Crear Categoría */}
            {showAddForm && (
              <form onSubmit={handleCreateCategory} style={{
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  Crear Nueva Categoría o Ramo Comercial
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
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
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                      Ícono Lucide
                    </label>
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        fontSize: '0.88rem',
                        backgroundColor: 'white'
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Descripción breve
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Servicios de copias, engargolados y útiles escolares en la región"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddForm(false)}
                    style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingCategory}
                    className="btn btn-primary"
                    style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                  >
                    {creatingCategory ? 'Guardando...' : 'Guardar Categoría'}
                  </button>
                </div>
              </form>
            )}

            {/* Listado de Categorías */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              {categories.map((cat) => (
                <div key={cat.id} style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px',
                  background: 'var(--surface)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      background: 'var(--surface-secondary)',
                      padding: '8px',
                      borderRadius: '8px',
                      color: 'var(--primary)',
                      display: 'flex',
                      flexShrink: 0
                    }}>
                      <Layers size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>
                        {cat.name}
                      </h4>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                        Ícono: <code>{cat.icon || 'Layers'}</code>
                      </div>
                      {cat.description && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>

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
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Cabecera de gestión de administradores */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <Shield size={24} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
                  Control de Administradores Autorizados
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#15803d', lineHeight: 1.5 }}>
                  Solo los usuarios listados a continuación recibirán acceso al <strong>Panel Admin</strong> al iniciar sesión con su número celular. Puedes agregar colaboradores de confianza o revocar accesos en cualquier momento.
                </p>
              </div>
            </div>

            {/* Formulario para designar nuevo admin */}
            <form
              onSubmit={handleAddAdmin}
              style={{
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '20px'
              }}
            >
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>
                Designar nuevo Administrador
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Nombre del Colaborador
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Uriel (Soporte)"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Celular (10 dígitos)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="7131234567"
                    value={newAdminPhone}
                    onChange={(e) => setNewAdminPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                >
                  <UserPlus size={15} />
                  <span>Autorizar</span>
                </button>
              </div>
            </form>

            {/* Lista de administradores activos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {adminsList.map((adm) => (
                <div
                  key={adm.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: adm.is_superadmin ? '#16a34a' : '#0284c7',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {adm.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{adm.name}</span>
                        {adm.is_superadmin ? (
                          <span style={{
                            background: '#dcfce7',
                            color: '#166534',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            Superadmin (Tú)
                          </span>
                        ) : (
                          <span style={{
                            background: '#e0f2fe',
                            color: '#0369a1',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            Admin Designado
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        📱 +52 {adm.phone} • Autorizado el {new Date(adm.added_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {!adm.is_superadmin && (
                    <button
                      type="button"
                      title="Revocar acceso de administrador"
                      onClick={() => handleRemoveAdmin(adm.id, adm.name)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '4px'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
