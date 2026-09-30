import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, MapPin, Globe } from 'lucide-react';
import type { Category } from '../../types/database';
import { businessService } from '../../services/businessService';
import { REGIONAL_MUNICIPALITIES } from '../../lib/geo';

interface RegisterBusinessModalProps {
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export const RegisterBusinessModal: React.FC<RegisterBusinessModalProps> = ({
  categories,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [selectedMunicipality, setSelectedMunicipality] = useState(REGIONAL_MUNICIPALITIES[0].name);
  const [customMunicipality, setCustomMunicipality] = useState('');
  const [locality, setLocality] = useState('Centro');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const finalMunicipality = selectedMunicipality === 'OTRO' 
    ? (customMunicipality.trim() || 'Santiago Tianguistenco')
    : selectedMunicipality;

  const matchedMuniGeo = REGIONAL_MUNICIPALITIES.find(m => m.name === finalMunicipality);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    setLoading(true);
    try {
      await businessService.createBusiness({
        name: name.trim(),
        category_id: categoryId || undefined,
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
        longitude: matchedMuniGeo?.lng
      });
      setSubmitted(true);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Error al registrar el servicio. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
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

        {submitted ? (
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
              ¡Solicitud Enviada con Éxito!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
              Tu registro para <strong>{name}</strong> en <strong>{finalMunicipality}</strong> fue recibido correctamente. Para garantizar la calidad en ProfZone, nuestro administrador revisará y autorizará la publicación en breve.
            </p>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Entendido
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Registrar un Servicio Local
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Agrega un consultorio, negocio o profesional de tu municipio a la red de ProfZone.
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.8rem',
              color: '#475569'
            }}>
              <AlertCircle size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>
                Los registros pasan por un proceso de revisión antes de ser visibles en el catálogo general.
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
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Selección de Municipio y Categoría */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                      backgroundColor: 'white'
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
                    Especialidad / Categoría *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      backgroundColor: 'white'
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Colonia / Barrio
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Centro, San Bartolo, Guadalupe..."
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Horario de Atención
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Lun - Sáb: 9:00 AM - 6:00 PM"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Dirección Completa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Calle, número, referencias principales"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    WhatsApp (opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="7131234567"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    Teléfono de Llamadas
                  </label>
                  <input
                    type="tel"
                    placeholder="7131234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem'
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
                    fontSize: '0.9rem'
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
                    fontSize: '0.9rem'
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
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  <Send size={15} />
                  <span>{loading ? 'Enviando...' : 'Enviar Solicitud'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
