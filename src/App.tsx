import { Search, MapPin, Building2 } from 'lucide-react';
import './App.css';
import { NotificationCenterModal } from './components/common/NotificationCenterModal';
import { feedbackService } from './services/feedbackService';
import type { Business, Category, SortOption, UserProfile, FeedbackSuggestion } from './types/database';
import { businessService } from './services/businessService';
import { categoryService } from './services/categoryService';
import { authService } from './services/authService';
import { REGIONAL_MUNICIPALITIES, calculateDistanceKm } from './lib/geo';
import { matchBusinessSearch } from './lib/search';
import { Navbar } from './components/common/Navbar';
import { MunicipalityFilter } from './components/common/MunicipalityFilter';
import { BusinessCard } from './components/business/BusinessCard';
import { BusinessDetailModal } from './components/business/BusinessDetailModal';
import { RegisterBusinessModal } from './components/business/RegisterBusinessModal';
import { AdminModal } from './components/admin/AdminModal';
import { AuthModal } from './components/auth/AuthModal';
import { FeedbackModal } from './components/common/FeedbackModal';
import { AboutModal } from './components/common/AboutModal';
import { ContactModal } from './components/common/ContactModal';
import { LegalModal } from './components/common/LegalModal';
import { SponsorBanner } from './components/common/SponsorBanner';
import { CURRENT_SPONSOR } from './data/sponsorData';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { useState, useEffect, useMemo } from 'react';

export function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sesión de usuario (Facebook / Celular SMS)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getCurrentUser());

  // Filtros principales
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('TODOS');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  // Geolocalización del usuario
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Modales
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'services' | 'feedback' | 'categories' | 'admins'>('services');
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackSuggestion[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'disclaimer' | 'terms' | 'privacy'>('disclaimer');
  const [openRegisterAfterAuth, setOpenRegisterAfterAuth] = useState(false);

  // Helper para verificar si el usuario conectado es propietario de un negocio
  const isBusinessOwner = (b: Business) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (!b.submitted_by) return false;
    return (
      b.submitted_by === currentUser.id ||
      b.submitted_by === currentUser.email ||
      b.submitted_by === currentUser.phone ||
      b.submitted_by === currentUser.full_name ||
      (currentUser.full_name && b.submitted_by.toLowerCase().includes(currentUser.full_name.toLowerCase()))
    );
  };

  // Tema Claro / Oscuro con persistencia en localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('pz_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pz_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleOpenRegister = () => {
    if (!currentUser) {
      setOpenRegisterAfterAuth(true);
      setShowAuthModal(true);
      return;
    }
    setShowRegisterModal(true);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, bizList, pendingList, feedbackList] = await Promise.all([
        categoryService.getCategories(),
        businessService.getBusinesses({ status: 'approved' }),
        businessService.getBusinesses({ status: 'pending' }),
        feedbackService.getFeedbacks()
      ]);
      setCategories(cats);
      setBusinesses(bizList);
      setPendingCount(pendingList.length);
      setFeedbacks(feedbackList);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Sincronizar sesión activa si Supabase está conectado (ej. retorno de Facebook OAuth)
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile = authService.mapSupabaseUser(session.user);
          setCurrentUser(profile);
          // Limpiar hash de la URL para que no quede expuesto el access_token
          if (window.location.hash.includes('access_token')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile = authService.mapSupabaseUser(session.user);
          setCurrentUser(profile);
          if (window.location.hash.includes('access_token')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else if (_event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      });

      // Escuchar nuevos mensajes del Buzón en tiempo real
      const feedbackChannel = supabase
        .channel('realtime:pz_feedback')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pz_feedback' }, () => {
          feedbackService.getFeedbacks().then(setFeedbacks);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
        if (supabase) {
          supabase.removeChannel(feedbackChannel);
        }
      };

    }

  }, []);

  // Función para restablecer filtros e ir al inicio
  const handleGoHome = () => {
    setSearchQuery('');
    setSelectedCategoryId(null);
    setSelectedMunicipality('TODOS');
    setSortBy('rating');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mapa de categorías para búsqueda y badges
  const categoriesObjMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  // Lista única de municipios disponibles en el sistema
  const availableMunicipalities = useMemo(() => {
    const fromData = businesses.map(b => b.municipality);
    const predefined = REGIONAL_MUNICIPALITIES.map(m => m.name);
    return Array.from(new Set([...predefined, ...fromData])).sort();
  }, [businesses]);

  // Referencia de coordenadas para cálculo de proximidad
  const referenceCoords = useMemo(() => {
    if (userCoords) return userCoords;
    if (selectedMunicipality !== 'TODOS') {
      const muniGeo = REGIONAL_MUNICIPALITIES.find(m => m.name.toLowerCase() === selectedMunicipality.toLowerCase());
      if (muniGeo) return { lat: muniGeo.lat, lng: muniGeo.lng };
    }
    // Por defecto centro de la región (Santiago Tianguistenco)
    return { lat: 19.1797, lng: -99.4678 };
  }, [userCoords, selectedMunicipality]);

  // Detección de GPS
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setDetectingLocation(false);
        setSortBy('distance');
      },
      (err) => {
        console.warn('Geolocation error or denied:', err);
        setDetectingLocation(false);
        alert('No se pudo acceder a tu ubicación. Puedes seleccionar tu municipio manualmente.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Filtrado y ordenamiento inteligente
  const processedBusinesses = useMemo(() => {
    // 1. Calcular distancia dinámica
    const withDistance = businesses.map(b => {
      let distanceKm: number | undefined = undefined;
      if (b.latitude && b.longitude && referenceCoords) {
        distanceKm = calculateDistanceKm(
          referenceCoords.lat,
          referenceCoords.lng,
          b.latitude,
          b.longitude
        );
      }
      return { ...b, distanceKm };
    });

    // 2. Filtro por municipio
    let filtered = withDistance;
    if (selectedMunicipality !== 'TODOS') {
      filtered = filtered.filter(b =>
        b.municipality.toLowerCase() === selectedMunicipality.toLowerCase()
      );
    }

    // 3. Filtro por categoría seleccionada
    if (selectedCategoryId) {
      filtered = filtered.filter(b => b.category_id === selectedCategoryId);
    }

    // 4. Búsqueda semántica / difusa inteligente (ej. 'hospital' -> 'clinica', 'medico', etc.)
    if (searchQuery.trim()) {
      filtered = filtered.filter(b =>
        matchBusinessSearch(b, searchQuery, categoriesObjMap)
      );
    }

    // 5. Ordenamiento
    return [...filtered].sort((a, b) => {
      if (sortBy === 'rating') {
        if (b.rating_avg !== a.rating_avg) {
          return b.rating_avg - a.rating_avg;
        }
        return b.rating_count - a.rating_count;
      }
      if (sortBy === 'reviews') {
        return b.rating_count - a.rating_count;
      }
      if (sortBy === 'distance') {
        const distA = a.distanceKm !== undefined ? a.distanceKm : 9999;
        const distB = b.distanceKm !== undefined ? b.distanceKm : 9999;
        return distA - distB;
      }
      if (sortBy === 'recent') {
        return (new Date(b.created_at || '').getTime()) - (new Date(a.created_at || '').getTime());
      }
      return 0;
    });
  }, [businesses, selectedMunicipality, selectedCategoryId, searchQuery, sortBy, referenceCoords, categoriesObjMap]);

  const handleSignOut = () => {
    authService.signOut();
    setCurrentUser(null);
  };

  const unreadFeedbackCount = feedbackService.getUnreadCount(feedbacks);

  return (
    <div>
      <Navbar
        onOpenRegister={handleOpenRegister}
        onOpenAdmin={() => {
          setAdminInitialTab('services');
          setShowAdminModal(true);
        }}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenFeedback={() => setShowFeedbackModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
        onOpenContact={() => setShowContactModal(true)}
        onGoHome={handleGoHome}
        currentUser={currentUser}
        onUserUpdated={setCurrentUser}
        onSignOut={handleSignOut}
        pendingCount={pendingCount}
        unreadFeedbackCount={unreadFeedbackCount}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="app-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div className="hero-pill-badge">
              <span className="hero-pulse-dot" />
              <span>Directorio Oficial de Profesionales & Comercios</span>
            </div>

            <h1 className="hero-title">
              Encuentra los mejores especialistas y servicios en{' '}
              <span className="hero-title-highlight">
                {selectedMunicipality === 'TODOS' ? 'tu región' : selectedMunicipality}
              </span>
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '20px', maxWidth: '600px', margin: '0 auto 20px auto' }}>
              Salud, mecánica, eventos, gastronomía, oficios y profesionales verificados cerca de ti.
            </p>

            {/* Barra de Búsqueda Flotante con Glassmorphism */}
            <div className="search-bar-container" style={{ margin: '0 auto' }}>
              <Search size={20} color="var(--primary)" style={{ marginRight: '10px', flexShrink: 0 }} />
              <input
                id="main-search-input"
                type="text"
                className="search-input"
                placeholder="¿Qué servicio buscas? (ej. Dentista, Plomero, Mariachi, Mecánico...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'var(--surface-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '4px 8px'
                  }}
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Barra Unificada de Filtros: Municipio, Especialidad, Ordenamiento y GPS */}
        <MunicipalityFilter
          municipalities={availableMunicipalities}
          selectedMunicipality={selectedMunicipality}
          onSelectMunicipality={setSelectedMunicipality}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          sortBy={sortBy}
          onSelectSortBy={setSortBy}
          onDetectLocation={handleDetectGPS}
          detectingLocation={detectingLocation}
          userCoords={userCoords}
        />

        {/* Grid de Negocios y Servicios */}
        <section>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              Cargando catálogo de servicios de la región...
            </div>
          ) : processedBusinesses.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)'
            }}>
              <Building2 size={40} color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
                No se encontraron servicios en esta búsqueda
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', maxWidth: '500px', margin: '0 auto 16px auto' }}>
                {selectedMunicipality !== 'TODOS'
                  ? `No encontramos registros para "${selectedMunicipality}". Puedes cambiar a "Todos los municipios" para ver opciones en municipios vecinos como Santiago Tianguistenco o Capulhuac.`
                  : 'Aún no hay servicios registrados con esos criterios.'}
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                {selectedMunicipality !== 'TODOS' && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedMunicipality('TODOS')}
                  >
                    Ver Toda la Región
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenRegister}
                >
                  + Registrar un servicio aquí
                </button>
              </div>
            </div>
          ) : (
            <div className="business-grid">
              {processedBusinesses.map((b) => (
                <BusinessCard
                  key={b.id}
                  business={b}
                  categoryName={b.category_id ? categoriesObjMap.get(b.category_id)?.name : undefined}
                  onClick={() => setSelectedBusiness(b)}
                  onEdit={isBusinessOwner(b) ? () => setEditingBusiness(b) : undefined}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Patrocinador Oficial al pie de página */}
      <SponsorBanner sponsor={CURRENT_SPONSOR} />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '30px 20px',
        textAlign: 'center',
        background: 'var(--surface)',
        marginTop: '30px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            <span>ProfZone</span>
            <span style={{ color: 'var(--primary)' }}>•</span>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>profzone.rolicode.com.mx</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Directorio y plataforma de recomendación comunitaria para la region.
          </p>

          {/* Enlaces de pie de página */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem', margin: '4px 0', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => setShowAboutModal(true)}
              style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: 600, padding: 0 }}
            >
              Acerca de ProfZone
            </button>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: 600, padding: 0 }}
            >
              Contacto y Soporte
            </button>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <button
              type="button"
              onClick={() => setShowFeedbackModal(true)}
              style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: 600, padding: 0 }}
            >
              Buzón de Sugerencias
            </button>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <button
              type="button"
              onClick={() => {
                setLegalModalTab('disclaimer');
                setShowLegalModal(true);
              }}
              style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: 600, padding: 0 }}
            >
              Términos & Deslinde Legal
            </button>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <button
              type="button"
              onClick={() => {
                setLegalModalTab('privacy');
                setShowLegalModal(true);
              }}
              style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: 600, padding: 0 }}
            >
              Aviso de Privacidad
            </button>
          </div>

          {/* Deslinde de Responsabilidad Permanente */}
          <div style={{
            maxWidth: '840px',
            margin: '8px auto',
            padding: '10px 16px',
            borderRadius: '10px',
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border)',
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            textAlign: 'center'
          }}>
            <strong>Deslinde de Responsabilidad Legal:</strong> ProfZone es un directorio comunitario e informativo independiente. No procesa pagos, no cobra comisiones ni valida cédulas de profesionistas. Cualquier acuerdo o contratación es responsabilidad exclusiva entre el usuario y el prestador del servicio. Consulta nuestros{' '}
            <span
              onClick={() => {
                setLegalModalTab('disclaimer');
                setShowLegalModal(true);
              }}
              style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
            >
              Términos y Deslinde Legal
            </span>.
          </div>

          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <MapPin size={13} />
            <span>Desarrollado bajo la firma <strong>RoliCode</strong></span>
          </div>
        </div>
      </footer>

      {/* Modales */}
      {selectedBusiness && (
        <BusinessDetailModal
          business={selectedBusiness}
          categoryName={selectedBusiness.category_id ? categoriesObjMap.get(selectedBusiness.category_id)?.name : undefined}
          currentUser={currentUser}
          onRequireAuth={() => setShowAuthModal(true)}
          onClose={() => setSelectedBusiness(null)}
          onReviewAdded={() => loadData()}
          onEditBusiness={(b) => {
            setSelectedBusiness(null);
            setEditingBusiness(b);
          }}
        />
      )}

      {(showRegisterModal || editingBusiness) && (
        <RegisterBusinessModal
          categories={categories}
          currentUser={currentUser}
          initialBusiness={editingBusiness}
          onRequireAuth={() => {
            setShowRegisterModal(false);
            setEditingBusiness(null);
            setOpenRegisterAfterAuth(true);
            setShowAuthModal(true);
          }}
          onClose={() => {
            setShowRegisterModal(false);
            setEditingBusiness(null);
          }}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {showAdminModal && currentUser?.role === 'admin' && (
        <AdminModal
          currentUser={currentUser}
          initialTab={adminInitialTab}
          onClose={() => setShowAdminModal(false)}
          onUpdate={() => {
            loadData();
          }}
        />
      )}

      {/* Centro de Notificaciones del Buzón para Administradores */}
      <NotificationCenterModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        feedbacks={feedbacks}
        onFeedbacksUpdated={async () => {
          const list = await feedbackService.getFeedbacks();
          setFeedbacks(list);
        }}
        onOpenAdminFeedback={() => {
          setAdminInitialTab('feedback');
          setShowAdminModal(true);
        }}
      />

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setOpenRegisterAfterAuth(false);
          }}
          onSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
            if (openRegisterAfterAuth) {
              setOpenRegisterAfterAuth(false);
              setShowRegisterModal(true);
            }
          }}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal
          currentUser={currentUser}
          onClose={() => setShowFeedbackModal(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {showAboutModal && (
        <AboutModal
          onClose={() => setShowAboutModal(false)}
          onOpenRegister={() => {
            setShowAboutModal(false);
            handleOpenRegister();
          }}
        />
      )}

      {showContactModal && (
        <ContactModal
          currentUser={currentUser}
          onClose={() => setShowContactModal(false)}
        />
      )}

      {showLegalModal && (
        <LegalModal
          initialTab={legalModalTab}
          onClose={() => setShowLegalModal(false)}
        />
      )}
    </div>
  );
}

export default App;
