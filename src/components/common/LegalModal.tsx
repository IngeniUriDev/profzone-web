import React, { useState } from 'react';
import { X, ShieldAlert, Scale, FileText, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface LegalModalProps {
  onClose: () => void;
  initialTab?: 'disclaimer' | 'terms' | 'privacy';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  onClose,
  initialTab = 'disclaimer'
}) => {
  const [activeTab, setActiveTab] = useState<'disclaimer' | 'terms' | 'privacy'>(initialTab);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '740px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          borderRadius: '20px',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
        }}
      >
        {/* Botón Cerrar */}
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
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Scale size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Marco Legal y Deslinde de Responsabilidad
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              ProfZone • Directorio Comunitario y Comercial Regional (México)
            </p>
          </div>
        </div>

        {/* Selector de pestañas */}
        <div style={{
          display: 'flex',
          gap: '6px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '10px',
          marginBottom: '18px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('disclaimer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'disclaimer' ? 'var(--primary)' : 'var(--surface-secondary)',
              color: activeTab === 'disclaimer' ? '#fff' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <ShieldAlert size={15} />
            <span>Deslinde Legal de Responsabilidad</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'terms' ? 'var(--primary)' : 'var(--surface-secondary)',
              color: activeTab === 'terms' ? '#fff' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <FileText size={15} />
            <span>Términos y Condiciones</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'privacy' ? 'var(--primary)' : 'var(--surface-secondary)',
              color: activeTab === 'privacy' ? '#fff' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <Lock size={15} />
            <span>Aviso de Privacidad</span>
          </button>
        </div>

        {/* CONTENIDO 1: DESLINDE LEGAL */}
        {activeTab === 'disclaimer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              color: '#92400e'
            }}>
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '2px' }}>
                  Aviso Importante a los Usuarios de ProfZone
                </strong>
                ProfZone opera exclusivamente como un canal digital y catálogo informativo independiente para conectar a la comunidad local con prestadores de servicios de la región.
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                1. Deslinde sobre Servicios Médicos y Especialidades de Salud
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                La información publicada sobre médicos, dentistas, pediatras, psicólogos y especialistas de la salud tiene carácter estrictamente <strong>informativo y de contacto público</strong>. ProfZone no expide, certifica ni audita cédulas profesionales, títulos universitarios ni licencias sanitarias (COFEPRIS). 
                Es responsabilidad única y exclusiva del paciente o usuario constatar la vigencia y legalidad de las credenciales del profesional ante el <strong>Registro Nacional de Profesionistas (SEP)</strong> antes de someterse a tratamientos o consultas.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                2. Inexistencia de Intermediación Mercantil o Financiera
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                ProfZone <strong>no cobra comisiones, no retiene dinero ni procesa pagos</strong> por las transacciones o servicios contratados. El acuerdo de honorarios, plazos, anticipos y garantías es pactado 100% de manera directa y privada entre el cliente y el prestador del servicio (vía telefónica, WhatsApp o presencial). 
                ProfZone queda legalmente exonerada de cualquier inconformidad, incumplimiento contractual o controversia ante autoridades como la PROFECO.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                3. Responsabilidad por Reseñas y Contenido de Usuarios
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                Las calificaciones y comentarios expresados en la plataforma reflejan única y exclusivamente la opinión personal y vivencia de los usuarios que los emiten, quienes son legalmente responsables de sus manifestaciones bajo el Código Civil y las leyes aplicables en materia de daño moral y difamación.
                ProfZone actúa bajo el principio de <strong>Notificación y Retiro (Notice and Takedown)</strong>: si el titular de un negocio detecta un comentario difamatorio, con insultos o falso, puede reportarlo a través del Buzón de Sugerencias para su análisis y remoción administrativa.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                4. Marcas y Nombres Comerciales
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                Las marcas registradas, nombres de establecimientos y logotipos mostrados en el directorio pertenecen a sus respectivos legítimos titulares. Su mención e inclusión en ProfZone es nominativa y de carácter informativo conforme al artículo 92 de la Ley Federal de Protección a la Propiedad Industrial.
              </p>
            </div>
          </div>
        )}

        {/* CONTENIDO 2: TÉRMINOS Y CONDICIONES */}
        {activeTab === 'terms' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                1. Aceptación de los Términos
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                Al ingresar, registrar una cuenta, publicar un negocio o calificar un servicio en ProfZone (profzone.rolicode.com.mx), el usuario acepta expresamente apegarse a los presentes Términos y Condiciones, así como a las leyes vigentes en los Estados Unidos Mexicanos.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                2. Requisitos para el Registro y Publicación
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                Para publicar un negocio, consultorio u oficio, el titular debe estar debidamente registrado en la plataforma. Toda información proporcionada (dirección, teléfonos, horario) debe ser verídica y verificable. ProfZone se reserva el derecho de rechazar, suspender o dar de baja publicaciones que contengan datos falsos, números telefónicos no autorizados o prácticas comerciales dudosas.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                3. Reglas de Convivencia en Calificaciones y Reseñas
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                Se prohíbe terminantemente:
              </p>
              <ul style={{ margin: '4px 0 0 20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <li>El uso de lenguaje soez, discriminatorio, difamatorio o de acoso.</li>
                <li>Autocalificaciones fraudulentas o reseñas pagadas por competidores.</li>
                <li>Divulgar datos personales sensibles de particulares ajenos al negocio.</li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                4. Modificación de la Plataforma
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                RoliCode se reserva el derecho de actualizar, optimizar o modificar las funcionalidades de ProfZone en cualquier momento para mantener la estabilidad, seguridad y calidad del servicio para la comunidad.
              </p>
            </div>
          </div>
        )}

        {/* CONTENIDO 3: AVISO DE PRIVACIDAD */}
        {activeTab === 'privacy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                1. Responsable del Tratamiento de Datos
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                En cumplimiento con la <em>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</em>, <strong>RoliCode</strong>, con domicilio en la región de Santiago Tianguistenco, Estado de México y correo de contacto <strong>contacto@rolicode.com.mx</strong>, es responsable de resguardar la privacidad de los datos personales recabados.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                2. Finalidad del Tratamiento de Datos
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                Los datos solicitados al iniciar sesión mediante Google (Nombre, Correo electrónico y foto de perfil) se utilizan única y exclusivamente para:
              </p>
              <ul style={{ margin: '4px 0 0 20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <li>Identificar y autenticar a los autores de las calificaciones y reseñas ciudadanas.</li>
                <li>Permitir a los dueños de servicios administrar y editar sus publicaciones registradas.</li>
                <li>Prevenir cuentas falsas, ataques automatizados (spam) y usurpación de identidad.</li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                3. No Transferencia de Datos
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                ProfZone <strong>no vende, no comercializa ni transfiere</strong> sus datos personales a terceros, agencias de publicidad o empresas de telemercadeo.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                4. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                Cualquier usuario o titular puede solicitar la eliminación de su cuenta, baja de su negocio o rectificación de información en cualquier momento mediante solicitud a través de nuestro <strong>Buzón de Sugerencias</strong> o enviando un correo a <strong>contacto@rolicode.com.mx</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Pie con botón de conformidad */}
        <div style={{
          marginTop: '22px',
          borderTop: '1px solid var(--border)',
          paddingTop: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#16a34a' }}>
            <CheckCircle2 size={15} />
            <span>Documento legal vigente para el Estado de México y territorio nacional</span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
            style={{ fontSize: '0.82rem', padding: '7px 18px' }}
          >
            Entendido y Conforme
          </button>
        </div>
      </div>
    </div>
  );
};
