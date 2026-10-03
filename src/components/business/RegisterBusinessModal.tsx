import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, MapPin, Globe, Lock, LogIn, UserCheck, Layers, Sparkles } from 'lucide-react';
import type { Business, Category, UserProfile } from '../../types/database';
import { businessService } from '../../services/businessService';
import { categoryService } from '../../services/categoryService';
import { REGIONAL_MUNICIPALITIES } from '../../lib/geo';

interface RegisterBusinessModalProps {
  categories: Category[];
  currentUser: UserProfile | null;
  initialBusiness?: Business | null;
  onRequireAuth: () => void;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegisterBusinessModal: React.FC<RegisterBusinessModalProps> = ({
  categories,
  currentUser,
  initialBusiness,
  onRequireAuth,
  onClose,
  onSuccess
}) => {
  const isEditing = Boolean(initialBusiness);

  const [name, setName] = useState(initialBusiness?.name || '');
  const [categoryId, setCategoryId] = useState(initialBusiness?.category_id || categories[0]?.id || '');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryChangeConfirmed, setCategoryChangeConfirmed] = useState(false);

  // Determinar si la categoría cambió respecto a la original
  const isCategoryChanged = Boolean(
    isEditing && initialBusiness?.category_id && categoryId !== initialBusiness.category_id
  );
  const originalCategory = categories.find(c => c.id === initialBusiness?.category_id);

  const isStandardMuni = REGIONAL_MUNICIPALITIES.some(m => m.name === initialBusiness?.municipality);
  const [selectedMunicipality, setSelectedMunicipality] = useState(
    initialBusiness ? (isStandardMuni ? initialBusiness.municipality : 'OTRO') : REGIONAL_MUNICIPALITIES[0].name
  );
  const [customMunicipality, setCustomMunicipality] = useState(
    initialBusiness && !isStandardMuni ? initialBusiness.municipality : ''
  );
  const [locality, setLocality] = useState(initialBusiness?.locality || 'Centro');
  const [address, setAddress] = useState(initialBusiness?.address || '');
  const [phone, setPhone] = useState(initialBusiness?.phone || '');
  const [whatsapp, setWhatsapp] = useState(initialBusiness?.whatsapp || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialBusiness?.website_url || '');
  const [schedule, setSchedule] = useState(initialBusiness?.schedule || '');
  const [description, setDescription] = useState(initialBusiness?.description || '');
  const [imageUrl, setImageUrl] = useState(initialBusiness?.image_url || '');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const finalMunicipality = selectedMunicipality === 'OTRO' 
    ? (customMunicipality.trim() || 'Santiago Tianguistenco')
    : selectedMunicipality;

  const matchedMuniGeo = REGIONAL_MUNICIPALITIES.find(m => m.name === finalMunicipality);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!name.trim() || !address.trim()) return;

    if (isCategoryChanged && !categoryChangeConfirmed) {
      alert('Por favor confirma que comprendes que el cambio de categoría pasará por verificación.');
      return;
    }

    setLoading(true);
    try {
      let finalCategoryId = categoryId;

      // Si el usuario eligió crear una nueva categoría que no existía
      if (categoryId === 'NEW_CATEGORY') {
        if (!newCategoryName.trim()) {
          alert('Por favor escribe el nombre de la nueva categoría.');
          setLoading(false);
          return;
        }
        const createdCat = await categoryService.createCategory({
          name: newCategoryName.trim(),
          icon: 'Layers',
          description: 'Categoría agregada por usuario'
        });
        finalCategoryId = createdCat.id;
      }

      if (isEditing && initialBusiness) {
        // Actualizar negocio existente
        await businessService.updateBusiness(initialBusiness.id, {
          name: name.trim(),
          category_id: finalCategoryId || undefined,
          municipality: finalMunicipality,
          locality: locality.trim(),
          address: address.trim(),
          phone: phone.trim() || undefined,
          whatsapp: whatsapp.trim() || undefined,
          website_url: websiteUrl.trim() || undefined,
          schedule: schedule.trim() || undefined,
          description: description.trim() || undefined,
          image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
          latitude: matchedMuniGeo?.lat,
          longitude: matchedMuniGeo?.lng,
          ...(isCategoryChanged ? { status: 'pending' } : {})
        });
      } else {
        // Crear nuevo negocio
        await businessService.createBusiness({
          name: name.trim(),
          category_id: finalCategoryId || undefined,
          municipality: finalMunicipality,
          locality: locality.trim(),
          address: address.trim(),
          phone: phone.trim() || undefined,
          whatsapp: whatsapp.trim() || undefined,
          website_url: websiteUrl.trim() || undefined,
          schedule: schedule.trim() || undefined,
          description: description.trim() || undefined,
          image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
          latitude: matchedMuniGeo?.lat,
          longitude: matchedMuniGeo?.lng,
          submitted_by: currentUser.id || currentUser.email || currentUser.phone || currentUser.full_name
        });
      }

      setSubmitted(true);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Error al guardar la información. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
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

        {!currentUser ? (
          <div style={{ textAlign: 'center', padding: '36px 12px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)'
            }}>
              <Lock size={30} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
              Acceso Exclusivo para Usuarios Registrados
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 24px auto' }}>
              Para garantizar la confianza y calidad de los negocios y profesionales recomendados en nuestra región, debes <strong>iniciar sesión o registrarte</strong> antes de gestionar o dar de alta un servicio.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                style={{ padding: '8px 18px' }}
              >
                Volver
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onRequireAuth();
                }}
                style={{ padding: '8px 20px' }}
              >
                <LogIn size={16} />
                <span>Iniciar Sesión / Registrarme</span>
              </button>
            </div>
          </div>
        ) : submitted ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>
              {isEditing ? '¡Publicación Actualizada con Éxito!' : '¡Solicitud Enviada con Éxito!'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
              {isEditing ? (
                isCategoryChanged ? (
                  <>
                    Los datos de <strong>{name}</strong> han sido actualizados. Como cambiaste la especialidad a una nueva categoría, el cambio pasará por una breve verificación administrativa para mantener el orden del directorio.
                  </>
                ) : (
                  <>
                    Los cambios de <strong>{name}</strong> en <strong>{finalMunicipality}</strong> han sido guardados correctamente y ya se encuentran visibles.
                  </>
                )
              ) : (
                <>
                  Tu registro para <strong>{name}</strong> en <strong>{finalMunicipality}</strong> fue recibido correctamente. Para garantizar la calidad en ProfZone, nuestro equipo revisará y autorizará la publicación en breve.
                </>
              )}
            </p>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Entendido
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {isEditing ? 'Editar mi Publicación' : 'Registrar un Servicio Local'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isEditing
                  ? 'Modifica los datos de tu consultorio, negocio o servicio profesional en ProfZone.'
                  : 'Agrega un consultorio, negocio o profesional de tu municipio a la red de ProfZone.'}
              </p>
            </div>

            {/* Distintivo de usuario conectado */}
            <div style={{
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-main)',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={16} color="var(--primary)" />
                <span>
                  {isEditing ? 'Editando como:' : 'Registrando como:'} <strong>{currentUser.full_name}</strong> {currentUser.phone ? `(${currentUser.phone})` : ''}
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                {currentUser.role === 'admin' ? 'Superadmin' : 'Usuario Verificado'}
              </span>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Nombre del Consultorio, Profesional o Negocio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Consultorio Pediátrico San Ángel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    background: 'var(--surface)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              {/* Selección de Municipio y Categoría */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    <MapPin size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                    Municipio *
                  </label>
                  <select
                    value={selectedMunicipality}
                    onChange={(e) => setSelectedMunicipality(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-main)'
                    }}
                  >
                    {REGIONAL_MUNICIPALITIES.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                    <option value="OTRO">+ Agregar otro municipio...</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    <Layers size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                    Especialidad / Categoría *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      if (e.target.value !== initialBusiness?.category_id) {
                        setCategoryChangeConfirmed(false);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: isCategoryChanged ? '2px solid #d97706' : '1px solid var(--border)',
                      fontSize: '0.9rem',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-main)'
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                    <option value="NEW_CATEGORY">✨ + ¿No existe tu especialidad? Agregar nueva categoría...</option>
                  </select>
                </div>
              </div>

              {/* Input para Nueva Categoría en caso de no existir */}
              {categoryId === 'NEW_CATEGORY' && (
                <div style={{
                  background: 'var(--surface-secondary)',
                  border: '1px solid var(--primary)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                    <Sparkles size={16} />
                    <span>Nombre de la nueva categoría / especialidad *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Barberías, Veterinarias, Herrería, Guarderías..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      background: 'var(--surface)',
                      color: 'var(--text-main)'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    💡 Esta categoría se registrará automáticamente en ProfZone y quedará disponible para tu publicación y futuros negocios.
                  </span>
                </div>
              )}

              {/* AVISO DE VERIFICACIÓN DE CAMBIO DE CATEGORÍA */}
              {isCategoryChanged && (
                <div style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#b45309' }}>
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>
                        Aviso de verificación por cambio de categoría
                      </div>
                      <div style={{ fontSize: '0.8rem', marginTop: '2px', lineHeight: 1.45, color: '#78350f' }}>
                        Estás cambiando la categoría de <strong>"{originalCategory?.name || 'la original'}"</strong> a{' '}
                        <strong>"{categoryId === 'NEW_CATEGORY' ? (newCategoryName || 'Nueva Categoría') : (categories.find(c => c.id === categoryId)?.name || 'nueva categoría')}"</strong>.
                        Para garantizar que los clientes encuentren negocios auténticos y clasificados correctamente, este cambio de especialidad pasará por una breve revisión de los administradores.
                      </div>
                    </div>
                  </div>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.8rem',
                    color: '#92400e',
                    cursor: 'pointer',
                    fontWeight: 700,
                    padding: '6px 8px',
                    background: '#fef3c7',
                    borderRadius: '6px'
                  }}>
                    <input
                      type="checkbox"
                      checked={categoryChangeConfirmed}
                      onChange={(e) => setCategoryChangeConfirmed(e.target.checked)}
                      required
                      style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>Confirmo que deseo cambiar la categoría de mi servicio y acepto la revisión</span>
                  </label>
                </div>
              )}

              {selectedMunicipality === 'OTRO' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Escribe el nombre del nuevo municipio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Joquicingo, Tenango del Valle..."
                    value={customMunicipality}
                    onChange={(e) => setCustomMunicipality(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--primary)',
                      fontSize: '0.9rem',
                      background: 'var(--surface)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Localidad / Barrio / Colonia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Centro, Guadalupe Yancuictlalpan"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      background: 'var(--surface)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Dirección o Calle y Número *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Av. Hidalgo #104"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      background: 'var(--surface)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Teléfono fijo o celular
                  </label>
                  <input
                    type="tel"
                    placeholder="713 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      background: 'var(--surface)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    WhatsApp (opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="713 123 4567"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      background: 'var(--surface)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Horario de atención
                  </label>
                  <input
                    type="text"
                    placeholder="Lun-Vie: 9am-6pm"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      background: 'var(--surface)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  <Globe size={14} color="var(--primary)" />
                  <span>Sitio Web / Red Social (opcional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://miexample.com o perfil de Facebook/Instagram"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    background: 'var(--surface)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  URL de Foto o Fachada (opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    background: 'var(--surface)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Descripción de servicios ofrecidos
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalla los tratamientos, platillos o especialidades que ofrece este lugar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    background: 'var(--surface)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  <Send size={15} />
                  <span>{loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Enviar Solicitud')}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
