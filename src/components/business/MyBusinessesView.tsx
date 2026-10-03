import React, { useState } from 'react';
import { Briefcase, PlusCircle, Phone, CheckCircle2, Clock, Edit3, Link2, ExternalLink } from 'lucide-react';
import type { Business, Category, UserProfile } from '../../types/database';
import { linkBusinessesByPhone } from '../../utils/ownership';

interface MyBusinessesViewProps {
  businesses: Business[];
  currentUser: UserProfile | null;
  onEditBusiness: (business: Business) => void;
  onSelectBusiness: (business: Business) => void;
  onOpenRegister: () => void;
  onOpenAuth: () => void;
  categoriesMap: Map<string, Category>;
  onBusinessLinked?: () => void;
}

export const MyBusinessesView: React.FC<MyBusinessesViewProps> = ({
  businesses,
  currentUser,
  onEditBusiness,
  onSelectBusiness,
  onOpenRegister,
  onOpenAuth,
  categoriesMap,
  onBusinessLinked
}) => {
  const [linkPhoneInput, setLinkPhoneInput] = useState('');
  const [linkMsg, setLinkMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLinkByPhone = (e: React.FormEvent) => {
    e.preventDefault();
    setLinkMsg(null);
    if (!linkPhoneInput.trim()) return;

    const count = linkBusinessesByPhone(linkPhoneInput, businesses);
    if (count > 0) {
      setLinkMsg({
        type: 'success',
        text: `¡Se ${count === 1 ? 'vinculó 1 negocio' : `vincularon ${count} negocios`} exitosamente a tu dispositivo!`
      });
      setLinkPhoneInput('');
      if (onBusinessLinked) {
        onBusinessLinked();
      }
    } else {
      setLinkMsg({
        type: 'error',
        text: 'No se encontraron negocios con ese número de teléfono o WhatsApp. Verifica el número e intenta nuevamente.'
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
      {/* Cabecera de la Pestaña Mis Negocios */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '24px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
          }}>
            <Briefcase size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Mis Negocios y Publicaciones</span>
              <span style={{
                fontSize: '0.75rem',
                background: 'rgba(2, 132, 199, 0.1)',
                color: 'var(--primary)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontWeight: 700
              }}>
                {businesses.length} {businesses.length === 1 ? 'publicación' : 'publicaciones'}
              </span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px', margin: 0 }}>
              Administra la información, redes sociales, horarios y servicios de tus establecimientos registrados.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenRegister}
          style={{
            padding: '10px 18px',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <PlusCircle size={18} />
          <span>Registrar Nuevo Negocio</span>
        </button>
      </div>

      {/* Si el usuario NO ha iniciado sesión */}
      {!currentUser && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.92rem' }}>
              Inicia sesión para sincronizar todos tus negocios
            </div>
            <div style={{ color: '#b45309', fontSize: '0.82rem', marginTop: '2px' }}>
              Conéctate para que tus publicaciones se vinculen de forma permanente a tu perfil de Google o teléfono.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAuth}
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            Iniciar Sesión
          </button>
        </div>
      )}

      {/* Lista de Mis Negocios */}
      {businesses.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '50px 20px',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--surface-secondary)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Briefcase size={30} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>
            Aún no tienes negocios registrados en esta cuenta
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
            Registra tu primer negocio, consultorio o taller para que miles de vecinos de la región puedan encontrarte y contactarte por WhatsApp.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenRegister}
              style={{ padding: '10px 20px', fontWeight: 700 }}
            >
              <PlusCircle size={16} />
              <span>Dar de Alta mi Negocio</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {businesses.map((b) => {
            const isApproved = b.status === 'approved';
            const cat = b.category_id ? categoriesMap.get(b.category_id) : undefined;

            return (
              <div
                key={b.id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative'
                }}
              >
                {/* Cabecera del negocio */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <img
                    src={b.image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80'}
                    alt={b.name}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: '1px solid var(--border)'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: isApproved ? '#dcfce7' : '#fef3c7',
                        color: isApproved ? '#166534' : '#92400e'
                      }}>
                        {isApproved ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        <span>{isApproved ? 'Publicado' : 'En Revisión'}</span>
                      </span>

                      <span style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        background: 'var(--surface-secondary)',
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}>
                        {b.municipality}
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {b.name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {cat?.name || 'Servicio Local'}
                    </div>
                  </div>
                </div>

                {/* Datos de contacto */}
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  background: 'var(--surface-secondary)',
                  padding: '8px 10px',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={12} color="var(--primary)" />
                    <span>Tel / WA: {b.whatsapp || b.phone || 'Sin teléfono'}</span>
                  </div>
                  <div>
                    <span>📍 {b.address}</span>
                  </div>
                </div>

                {/* Botones de acción directa */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => onEditBusiness(b)}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      fontSize: '0.84rem',
                      padding: '8px 12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Edit3 size={15} />
                    <span>Editar Negocio</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onSelectBusiness(b)}
                    style={{
                      justifyContent: 'center',
                      fontSize: '0.84rem',
                      padding: '8px 12px'
                    }}
                    title="Ver ficha pública del negocio"
                  >
                    <ExternalLink size={15} />
                    <span>Ver</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Herramienta para vincular negocios creados anteriormente */}
      <div style={{
        background: 'var(--surface-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '18px 20px',
        marginTop: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Link2 size={16} color="var(--primary)" />
          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
            ¿No ves algún negocio que diste de alta anteriormente?
          </h4>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.45 }}>
          Si registraste tu negocio antes de iniciar sesión o desde otro navegador, escribe el número de teléfono o WhatsApp con el que diste de alta el negocio para vincularlo inmediatamente a tu cuenta.
        </p>

        <form onSubmit={handleLinkByPhone} style={{ display: 'flex', gap: '8px', maxWidth: '460px' }}>
          <input
            type="tel"
            placeholder="Ej. 7141087330"
            value={linkPhoneInput}
            onChange={(e) => setLinkPhoneInput(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '8px 14px', whiteSpace: 'nowrap' }}
          >
            Vincular
          </button>
        </form>

        {linkMsg && (
          <div style={{
            marginTop: '10px',
            fontSize: '0.82rem',
            padding: '8px 12px',
            borderRadius: '6px',
            background: linkMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: linkMsg.type === 'success' ? '#166534' : '#dc2626',
            border: `1px solid ${linkMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}>
            {linkMsg.text}
          </div>
        )}
      </div>
    </div>
  );
};
