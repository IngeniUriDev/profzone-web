import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, ArrowUpDown, Layers, ChevronDown, X, Check } from 'lucide-react';
import type { Category, SortOption } from '../../types/database';

interface MunicipalityFilterProps {
  municipalities: string[];
  selectedMunicipality: string;
  onSelectMunicipality: (muni: string) => void;
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  sortBy: SortOption;
  onSelectSortBy: (sort: SortOption) => void;
  onDetectLocation: () => void;
  detectingLocation: boolean;
  userCoords: { lat: number; lng: number } | null;
}

export const MunicipalityFilter: React.FC<MunicipalityFilterProps> = ({
  municipalities,
  selectedMunicipality,
  onSelectMunicipality,
  categories,
  selectedCategoryId,
  onSelectCategory,
  sortBy,
  onSelectSortBy,
  onDetectLocation,
  detectingLocation,
  userCoords
}) => {
  // Estado para Combobox de Municipio
  const [isOpenMuni, setIsOpenMuni] = useState(false);
  const [searchMuni, setSearchMuni] = useState('');
  const muniComboboxRef = useRef<HTMLDivElement>(null);
  const muniInputRef = useRef<HTMLInputElement>(null);

  // Estado para Combobox de Especialidad
  const [isOpenCat, setIsOpenCat] = useState(false);
  const [searchCat, setSearchCat] = useState('');
  const catComboboxRef = useRef<HTMLDivElement>(null);
  const catInputRef = useRef<HTMLInputElement>(null);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (muniComboboxRef.current && !muniComboboxRef.current.contains(event.target as Node)) {
        setIsOpenMuni(false);
        setSearchMuni('');
      }
      if (catComboboxRef.current && !catComboboxRef.current.contains(event.target as Node)) {
        setIsOpenCat(false);
        setSearchCat('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para normalizar texto (sin acentos, minúsculas)
  const normalize = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Filtrado de municipios
  const filteredMunicipalities = municipalities.filter((muni) => {
    if (!searchMuni.trim()) return true;
    return normalize(muni).includes(normalize(searchMuni));
  });

  // Filtrado de especialidades / categorías (busca por nombre y descripción)
  const filteredCategories = categories.filter((cat) => {
    if (!searchCat.trim()) return true;
    const term = normalize(searchCat);
    return normalize(cat.name).includes(term) || (cat.description && normalize(cat.description).includes(term));
  });

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);

  // Handlers Municipio
  const handleSelectMuni = (muni: string) => {
    onSelectMunicipality(muni);
    setSearchMuni('');
    setIsOpenMuni(false);
  };

  const handleClearMuni = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectMunicipality('TODOS');
    setSearchMuni('');
    setIsOpenMuni(false);
    muniInputRef.current?.focus();
  };

  const handleKeyDownMuni = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredMunicipalities.length > 0) {
        handleSelectMuni(filteredMunicipalities[0]);
      } else if (normalize(searchMuni).includes('todo') || searchMuni.trim() === '') {
        handleSelectMuni('TODOS');
      }
    } else if (e.key === 'Escape') {
      setIsOpenMuni(false);
      setSearchMuni('');
    }
  };

  // Handlers Especialidad
  const handleSelectCat = (catId: string | null) => {
    onSelectCategory(catId);
    setSearchCat('');
    setIsOpenCat(false);
  };

  const handleClearCat = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectCategory(null);
    setSearchCat('');
    setIsOpenCat(false);
    catInputRef.current?.focus();
  };

  const handleKeyDownCat = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCategories.length > 0) {
        handleSelectCat(filteredCategories[0].id);
      } else if (normalize(searchCat).includes('todo') || searchCat.trim() === '') {
        handleSelectCat(null);
      }
    } else if (e.key === 'Escape') {
      setIsOpenCat(false);
      setSearchCat('');
    }
  };

  const placeholderMuni = selectedMunicipality === 'TODOS'
    ? '📍 Toda la Región (Escribir o buscar...)'
    : `📍 ${selectedMunicipality}`;

  const placeholderCat = selectedCategoryObj
    ? `🏷️ ${selectedCategoryObj.name}`
    : '✨ Todas las Especialidades (Buscar...)';

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 18px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
      zIndex: 20
    }}>
      {/* 1. SECCIÓN MUNICIPIO + GPS A SU DERECHA */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: '1 1 340px',
        minWidth: '270px'
      }}>
        {/* Combobox de Municipio */}
        <div
          ref={muniComboboxRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            position: 'relative'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--primary)',
            fontWeight: 700,
            fontSize: '0.84rem',
            whiteSpace: 'nowrap'
          }}>
            <MapPin size={16} />
            <span>Municipio:</span>
          </div>

          <div style={{ position: 'relative', flex: 1, minWidth: '150px' }}>
            <input
              ref={muniInputRef}
              id="input-search-municipality"
              type="text"
              value={isOpenMuni ? searchMuni : (selectedMunicipality === 'TODOS' ? '' : selectedMunicipality)}
              onChange={(e) => {
                setSearchMuni(e.target.value);
                if (!isOpenMuni) setIsOpenMuni(true);
              }}
              onFocus={() => {
                setIsOpenMuni(true);
                setIsOpenCat(false);
                setSearchMuni('');
              }}
              onKeyDown={handleKeyDownMuni}
              placeholder={placeholderMuni}
              autoComplete="off"
              style={{
                width: '100%',
                padding: '8px 30px 8px 12px',
                borderRadius: '10px',
                border: isOpenMuni ? '1px solid var(--primary)' : '1px solid var(--border)',
                fontSize: '0.86rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-main)',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                boxShadow: isOpenMuni ? '0 0 0 3px var(--primary-light)' : 'none'
              }}
            />

            {/* Acciones del input municipio: borrar y flecha */}
            <div style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {selectedMunicipality !== 'TODOS' && (
                <button
                  type="button"
                  onClick={handleClearMuni}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Quitar filtro de municipio"
                >
                  <X size={13} />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsOpenMuni(!isOpenMuni);
                  setIsOpenCat(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronDown
                  size={13}
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: isOpenMuni ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </button>
            </div>

            {/* Menú flotante de municipios */}
            {isOpenMuni && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: '100%',
                minWidth: '220px',
                maxHeight: '260px',
                overflowY: 'auto',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                zIndex: 60,
                padding: '6px 0'
              }}>
                <div
                  onClick={() => handleSelectMuni('TODOS')}
                  style={{
                    padding: '9px 14px',
                    fontSize: '0.84rem',
                    fontWeight: selectedMunicipality === 'TODOS' ? 700 : 500,
                    color: selectedMunicipality === 'TODOS' ? 'var(--primary)' : 'var(--text-main)',
                    backgroundColor: selectedMunicipality === 'TODOS' ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedMunicipality !== 'TODOS') e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMunicipality !== 'TODOS') e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>📍 Toda la Región (Ver todos)</span>
                  {selectedMunicipality === 'TODOS' && <Check size={14} color="var(--primary)" />}
                </div>

                {filteredMunicipalities.map((muni) => {
                  const isSelected = selectedMunicipality === muni;
                  return (
                    <div
                      key={muni}
                      onClick={() => handleSelectMuni(muni)}
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.84rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span>{muni}</span>
                      {isSelected && <Check size={14} color="var(--primary)" />}
                    </div>
                  );
                })}

                {filteredMunicipalities.length === 0 && (
                  <div style={{ padding: '14px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    No se encontró "{searchMuni}".
                    <button
                      type="button"
                      onClick={() => handleSelectMuni('TODOS')}
                      style={{
                        display: 'block',
                        margin: '6px auto 0 auto',
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Ver Toda la Región
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Botón Detectar Ubicación GPS a la DERECHA del Municipio */}
        <button
          id="btn-detect-gps"
          type="button"
          className="btn btn-secondary"
          onClick={onDetectLocation}
          disabled={detectingLocation}
          style={{
            fontSize: '0.82rem',
            padding: '7px 12px',
            borderRadius: '10px',
            border: userCoords ? '1px solid #0284c7' : '1px solid var(--border)',
            background: userCoords ? 'var(--primary-light)' : 'var(--surface-secondary)',
            color: userCoords ? '#0284c7' : 'var(--text-main)',
            gap: '6px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
          title="Usa el GPS para ordenar por distancia exacta a tu posición"
        >
          {userCoords ? (
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#0284c7',
              boxShadow: '0 0 8px #0284c7',
              display: 'inline-block'
            }} />
          ) : (
            <Navigation size={14} color="var(--primary)" />
          )}
          <span>
            {detectingLocation
              ? 'Localizando...'
              : userCoords
                ? 'GPS Activo'
                : 'Cerca de mí (GPS)'}
          </span>
        </button>
      </div>

      {/* 2. SELECTOR DE ESPECIALIDAD CON BÚSQUEDA ESCRIBIBLE (COMBOBOX) */}
      <div
        ref={catComboboxRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: '1 1 240px',
          minWidth: '220px',
          position: 'relative'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--primary)',
          fontWeight: 700,
          fontSize: '0.84rem',
          whiteSpace: 'nowrap'
        }}>
          <Layers size={16} />
          <span>Especialidad:</span>
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: '150px' }}>
          <input
            ref={catInputRef}
            id="input-search-specialty"
            type="text"
            value={isOpenCat ? searchCat : (selectedCategoryObj ? selectedCategoryObj.name : '')}
            onChange={(e) => {
              setSearchCat(e.target.value);
              if (!isOpenCat) setIsOpenCat(true);
            }}
            onFocus={() => {
              setIsOpenCat(true);
              setIsOpenMuni(false);
              setSearchCat('');
            }}
            onKeyDown={handleKeyDownCat}
            placeholder={placeholderCat}
            autoComplete="off"
            style={{
              width: '100%',
              padding: '8px 30px 8px 12px',
              borderRadius: '10px',
              border: isOpenCat ? '1px solid var(--primary)' : selectedCategoryId ? '1px solid var(--primary)' : '1px solid var(--border)',
              fontSize: '0.86rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              backgroundColor: selectedCategoryId ? 'var(--primary-light)' : 'var(--surface-secondary)',
              color: selectedCategoryId ? 'var(--primary)' : 'var(--text-main)',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              boxShadow: isOpenCat ? '0 0 0 3px var(--primary-light)' : 'none'
            }}
          />

          {/* Acciones del input especialidad: borrar y flecha */}
          <div style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {selectedCategoryId !== null && (
              <button
                type="button"
                onClick={handleClearCat}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Quitar filtro de especialidad"
              >
                <X size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsOpenCat(!isOpenCat);
                setIsOpenMuni(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronDown
                size={13}
                style={{
                  transition: 'transform 0.2s ease',
                  transform: isOpenCat ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </button>
          </div>

          {/* Menú flotante de especialidades */}
          {isOpenCat && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: '100%',
              minWidth: '240px',
              maxHeight: '260px',
              overflowY: 'auto',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              zIndex: 60,
              padding: '6px 0'
            }}>
              <div
                onClick={() => handleSelectCat(null)}
                style={{
                  padding: '9px 14px',
                  fontSize: '0.84rem',
                  fontWeight: selectedCategoryId === null ? 700 : 500,
                  color: selectedCategoryId === null ? 'var(--primary)' : 'var(--text-main)',
                  backgroundColor: selectedCategoryId === null ? 'var(--primary-light)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategoryId !== null) e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                }}
                onMouseLeave={(e) => {
                  if (selectedCategoryId !== null) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>✨ Todas las Especialidades</span>
                {selectedCategoryId === null && <Check size={14} color="var(--primary)" />}
              </div>

              {filteredCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCat(cat.id)}
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.84rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span>{cat.name}</span>
                    {isSelected && <Check size={14} color="var(--primary)" />}
                  </div>
                );
              })}

              {filteredCategories.length === 0 && (
                <div style={{ padding: '14px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  No se encontró "{searchCat}".
                  <button
                    type="button"
                    onClick={() => handleSelectCat(null)}
                    style={{
                      display: 'block',
                      margin: '6px auto 0 auto',
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Ver Todas las Especialidades
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. ORDENAMIENTO */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontSize: '0.84rem',
          fontWeight: 600,
          whiteSpace: 'nowrap'
        }}>
          <ArrowUpDown size={15} />
          <span>Ordenar:</span>
        </div>

        <select
          id="select-sort-by"
          value={sortBy}
          onChange={(e) => onSelectSortBy(e.target.value as SortOption)}
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            fontSize: '0.86rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            backgroundColor: 'var(--surface-secondary)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="rating">⭐ Mejor Calificados</option>
          <option value="reviews">💬 Más Recomendados</option>
          <option value="distance">📍 Más Cercanos (GPS)</option>
          <option value="recent">🕒 Más Recientes</option>
        </select>
      </div>
    </div>
  );
};
