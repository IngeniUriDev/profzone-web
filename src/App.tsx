import { Search, MapPin, Building2 } from 'lucide-react';
import './App.css';
import type { Business, Category, SortOption, UserProfile } from './types/database';
import { businessService } from './services/businessService';
import { categoryService } from './services/categoryService';
import { authService } from './services/authService';
import { REGIONAL_MUNICIPALITIES, calculateDistanceKm } from './lib/geo';
import { matchBusinessSearch } from './lib/search';
import { Navbar } from './components/common/Navbar';
import { CategoryFilter } from './components/common/CategoryFilter';
import { MunicipalityFilter } from './components/common/MunicipalityFilter';
import { BusinessCard } from './components/business/BusinessCard';
import { BusinessDetailModal } from './components/business/BusinessDetailModal';
import { RegisterBusinessModal } from './components/business/RegisterBusinessModal';
import { AdminModal } from './components/admin/AdminModal';
import { AuthModal } from './components/auth/AuthModal';
import { FeedbackModal } from './components/common/FeedbackModal';
import { SponsorBanner } from './components/common/SponsorBanner';
import { CURRENT_SPONSOR } from './data/sponsorData';
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
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [openRegisterAfterAuth, setOpenRegisterAfterAuth] = useState(false);

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
      const [cats, bizList, pendingList] = await Promise.all([
        categoryService.getCategories(),
        businessService.getBusinesses({ status: 'approved' }),
        businessService.getBusinesses({ status: 'pending' })
      ]);
      setCategories(cats);
      setBusinesses(bizList);
      setPendingCount(pendingList.length);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  return (
    <div>
      <Navbar
        onOpenRegister={handleOpenRegister}
        onOpenAdmin={() => setShowAdminModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenFeedback={() => setShowFeedbackModal(true)}
        onGoHome={handleGoHome}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        pendingCount={pendingCount}
      />

      <main className="app-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div style={{ maxWidth: '720px' }}>
            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.85rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '6px' }}>
              Encuentra los mejores profesionales y servicios en{' '}
              <span style={{ color: '#55c5f5ff' }}>
                {selectedMunicipality === 'TODOS' ? 'Tu Región' : selectedMunicipality}
              </span>
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.4, marginBottom: '6px' }}>
              Doctores, Mecánicos, Psicólogos, Abogados, Estéticas, Plomeros y más en tu zona.
            </p>

            {/* Barra de Búsqueda Semántica */}
            <div className="search-bar-container">
              <Search size={18} color="#0284c7" style={{ marginRight: '8px', flexShrink: 0 }} />
              <input
                id="main-search-input"
                type="text"
                className="search-input"
                placeholder="¿Qué servicio buscas? (ej. Dentista, Plomero, Barbacoa...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    fontSize: '0.8rem',
                    padding: '2px 6px'
                  }}
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Sugerencias rápidas de búsqueda semántica */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '8px', fontSize: '0.74rem' }}>
              <span style={{ color: '#94a3b8' }}>Buscar rápido:</span>
              {['Hospital', 'Pediatra', 'Dentista', 'Barbacoa', 'Mariachi', 'Mecánico'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearchQuery(term)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.74rem'
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Barra de Filtro de Municipio y Ordenamiento */}
        <MunicipalityFilter
          municipalities={availableMunicipalities}
          selectedMunicipality={selectedMunicipality}
          onSelectMunicipality={setSelectedMunicipality}
          sortBy={sortBy}
          onSelectSortBy={setSortBy}
          onDetectLocation={handleDetectGPS}
          detectingLocation={detectingLocation}
          userCoords={userCoords}
        />

        {/* Filtro por Categorías */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Explorar por Especialidad</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {processedBusinesses.length} servicios encontrados
            </span>
          </div>

          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </section>

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
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
        />
      )}

      {showRegisterModal && (
        <RegisterBusinessModal
          categories={categories}
          currentUser={currentUser}
          onRequireAuth={() => {
            setShowRegisterModal(false);
            setOpenRegisterAfterAuth(true);
            setShowAuthModal(true);
          }}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {showAdminModal && currentUser?.role === 'admin' && (
        <AdminModal
          onClose={() => setShowAdminModal(false)}
          onUpdate={() => {
            loadData();
          }}
        />
      )}

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
    </div>
  );
}

export default App;
