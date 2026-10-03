import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Phone, MessageCircle, Edit3, MessageSquarePlus, Star, UserCheck, Stethoscope, Globe } from 'lucide-react';
import type { Business, Review, UserProfile } from '../../types/database';
import { StarRating } from '../common/StarRating';
import { reviewService } from '../../services/reviewService';

interface BusinessDetailModalProps {
  business: Business | null;
  categoryName?: string;
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
  onClose: () => void;
  onReviewAdded?: () => void;
  onEditBusiness?: (business: Business) => void;
}

export const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({
  business,
  categoryName,
  currentUser,
  onRequireAuth,
  onClose,
  onReviewAdded,
  onEditBusiness
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // Formulario de nueva reseña
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!business) return;
    loadReviews(business.id);
  }, [business]);

  const loadReviews = async (businessId: string) => {
    setLoadingReviews(true);
    try {
      const data = await reviewService.getReviewsForBusiness(businessId);
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  if (!business) return null;

  const handleWhatsApp = () => {
    if (!business.whatsapp) return;
    const cleanNumber = business.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(`Hola, vi ${business.name} en ProfZone y me gustaría solicitar información.`);
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  const isOwner = Boolean(
    currentUser && (
      currentUser.role === 'admin' ||
      (business.submitted_by && (
        business.submitted_by === currentUser.id ||
        business.submitted_by === currentUser.email ||
        business.submitted_by === currentUser.phone ||
        business.submitted_by === currentUser.full_name ||
        (currentUser.full_name && business.submitted_by.toLowerCase().includes(currentUser.full_name.toLowerCase()))
      ))
    )
  );

  const handlePhone = () => {
    if (!business.phone) return;
    window.open(`tel:${business.phone}`);
  };

  const handleWebsite = () => {
    if (!business.website_url) return;
    const url = business.website_url.startsWith('http')
      ? business.website_url
      : `https://${business.website_url}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenReviewForm = (staffId?: string) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (staffId) {
      setSelectedStaffId(staffId);
    }
    setShowAddReview(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!comment.trim()) return;

    setSubmittingReview(true);
    try {
      const targetStaff = business.staff?.find(s => s.id === selectedStaffId);
      await reviewService.addReview({
        business_id: business.id,
        staff_id: selectedStaffId || undefined,
        staff_name: targetStaff ? `${targetStaff.name} (${targetStaff.specialty})` : undefined,
        user_name: currentUser.full_name,
        user_phone: currentUser.phone,
        user_provider: currentUser.provider,
        rating,
        comment: comment.trim()
      });
      setComment('');
      setRating(5);
      setSelectedStaffId('');
      setShowAddReview(false);
      await loadReviews(business.id);
      onReviewAdded?.();
    } catch (err) {
      console.error(err);
      alert('Hubo un error al registrar la reseña');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        {/* Botón cerrar */}
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
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={18} />
        </button>

        {/* Imagen principal */}
        <div style={{
          position: 'relative',
          height: '240px',
          margin: '-24px -24px 20px -24px',
          overflow: 'hidden'
        }}>
          <img
            src={business.image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80'}
            alt={business.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '24px',
            right: '24px',
            color: '#fff'
          }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-category">
                {categoryName || 'Servicio Local'}
              </span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                <MapPin size={11} />
                {business.municipality}
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {business.name}
            </h2>
          </div>
        </div>

        {/* Calificación y Métricas */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '1.2rem'
            }}>
              <Star size={18} fill="#f59e0b" color="#f59e0b" />
              <span>{business.rating_avg.toFixed(1)}</span>
            </div>
            <div>
              <StarRating rating={Math.round(business.rating_avg)} size={18} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {business.staff && business.staff.length > 0 
                  ? `Promedio ponderado del personal médico y ${reviews.length || business.rating_count} reseñas`
                  : `Basado en ${reviews.length || business.rating_count} opiniones ciudadanas`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {business.whatsapp && (
              <button type="button" className="btn btn-whatsapp" onClick={handleWhatsApp}>
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </button>
            )}
            {business.phone && (
              <button type="button" className="btn btn-secondary" onClick={handlePhone}>
                <Phone size={16} />
                <span>Llamar</span>
              </button>
            )}
            {business.website_url && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleWebsite}
                style={{ color: 'var(--primary)', borderColor: '#bae6fd' }}
                title="Visitar sitio web oficial o perfil"
              >
                <Globe size={16} />
                <span>Sitio Web</span>
              </button>
            )}
            {isOwner && onEditBusiness && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  onClose();
                  onEditBusiness(business);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  fontWeight: 700,
                  background: 'var(--surface-secondary)'
                }}
                title="Editar datos de mi servicio o consultorio"
              >
                <Edit3 size={15} />
                <span>Editar Publicación</span>
              </button>
            )}
          </div>
        </div>

        {/* Descripción y Ubicación */}
        <div style={{ margin: '18px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Información general
            </h4>
            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
              {business.description || 'Sin descripción detallada disponible.'}
            </p>
          </div>

          <div style={{
            background: 'var(--surface-secondary)',
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={18} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Dirección</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{business.address}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {business.locality ? `${business.locality}, ` : ''}{business.municipality}
                  </div>
                </div>
              </div>
            </div>

            {business.schedule && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                <Clock size={16} color="#64748b" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{business.schedule}</div>
              </div>
            )}

            {business.website_url && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <Globe size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <a
                    href={business.website_url.startsWith('http') ? business.website_url : `https://${business.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {business.website_url}
                  </a>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleWebsite}
                  style={{ fontSize: '0.75rem', padding: '4px 8px', flexShrink: 0 }}
                >
                  Abrir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Especialistas / Doctores / Personal */}
        {business.staff && business.staff.length > 0 && (
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '18px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Stethoscope size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                Especialistas y Personal del Establecimiento ({business.staff.length})
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {business.staff.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                    background: 'var(--surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <img
                      src={doc.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80'}
                      alt={doc.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--primary-light)'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                        {doc.specialty}
                      </div>
                      {doc.license_number && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {doc.license_number}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span>{doc.rating_avg.toFixed(1)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        ({doc.rating_count} calif.)
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleOpenReviewForm(doc.id)}
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    >
                      Calificar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección de Reseñas */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
              Opiniones de la Comunidad ({reviews.length})
            </h3>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleOpenReviewForm()}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <MessageSquarePlus size={15} />
              <span>{showAddReview ? 'Cancelar' : 'Dejar Reseña'}</span>
            </button>
          </div>

          {/* Formulario para agregar reseña */}
          {showAddReview && (
            <form onSubmit={handleSubmitReview} style={{
              background: 'var(--surface-secondary)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Comparte tu experiencia</h4>

              {/* Si el establecimiento tiene especialistas, permitir seleccionar a quién califica */}
              {business.staff && business.staff.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    ¿A quién deseas calificar?
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Al establecimiento / consultorio en general</option>
                    {business.staff.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialty}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Tu Calificación
                </label>
                <StarRating rating={rating} interactive size={24} onRatingChange={setRating} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Comentario u opinión
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="¿Cómo fue el trato, diagnóstico, puntualidad o calidad de la atención?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {currentUser ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={14} color="#16a34a" />
                  <span>Publicando como: <strong>{currentUser.full_name}</strong> (✓ {currentUser.provider === 'google' ? 'Google' : 'Cuenta Verificada'})</span>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                  * Inicia sesión con tu cuenta de Google para publicar tu reseña con tu nombre.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddReview(false)}
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  {submittingReview ? 'Publicando...' : 'Publicar Opinión'}
                </button>
              </div>
            </form>
          )}

          {/* Lista de Reseñas */}
          {loadingReviews ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
              Cargando opiniones...
            </div>
          ) : reviews.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              color: 'var(--text-muted)',
              background: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem'
            }}>
              Sé el primero en calificar este servicio o a sus especialistas.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  backgroundColor: 'var(--surface)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {rev.user_name}
                      </span>
                      {rev.user_provider && (
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: rev.user_provider === 'facebook' ? '#e0f2fe' : (rev.user_provider === 'google' ? '#fee2e2' : '#f0fdf4'),
                          color: rev.user_provider === 'facebook' ? '#0369a1' : (rev.user_provider === 'google' ? '#b91c1c' : '#166534'),
                          fontWeight: 700
                        }}>
                          {rev.user_provider === 'facebook' ? '✓ Facebook' : (rev.user_provider === 'google' ? '✓ Google' : (rev.user_provider === 'azure' ? '✓ Microsoft' : '✓ Celular SMS'))}
                        </span>
                      )}
                    </div>
                    <StarRating rating={rev.rating} size={14} />
                  </div>

                  {rev.staff_name && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '6px'
                    }}>
                      <Stethoscope size={12} />
                      <span>Calificación a: {rev.staff_name}</span>
                    </div>
                  )}

                  <p style={{ fontSize: '0.88rem', color: '#334155' }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deslinde de Responsabilidad Profesional */}
        <div style={{
          marginTop: '18px',
          padding: '10px 12px',
          borderRadius: '8px',
          background: 'var(--surface-secondary)',
          border: '1px solid var(--border)',
          fontSize: '0.74rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          lineHeight: 1.4
        }}>
          <span style={{ fontSize: '1rem' }}>🛡️</span>
          <span>
            <strong>Aviso Legal:</strong> ProfZone es un directorio comunitario e informativo. No certifica cédulas ni intermedia contrataciones. Verifica siempre las credenciales oficiales del profesional antes de recibir atención.
          </span>
        </div>
      </div>
    </div>
  );
};
