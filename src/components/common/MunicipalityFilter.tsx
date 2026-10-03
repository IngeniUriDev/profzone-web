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
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const comboboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar el menú desplegable al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normalizar texto para búsqueda insensible a mayúsculas y acentos
  const normalize = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Filtrado de municipios en tiempo real
  const filteredMunicipalities = municipalities.filter((muni) => {
    if (!searchTerm.trim()) return true;
    return normalize(muni).includes(normalize(searchTerm));
  });

  const handleSelect = (muni: string) => {
    onSelectMunicipality(muni);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectMunicipality('TODOS');
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredMunicipalities.length > 0) {
        handleSelect(filteredMunicipalities[0]);
      } else if (normalize(searchTerm).includes('todo') || searchTerm.trim() === '') {
        handleSelect('TODOS');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const placeholderText = selectedMunicipality === 'TODOS'
    ? '📍 Toda la Región (Buscar o elegir...)'
    : `📍 ${selectedMunicipality}`;

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
      gap: '14px',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
      zIndex: 20
    }}>
      {/* 1. Selector de Municipio con Búsqueda Escribible (Combobox) */}
      <div
        ref={comboboxRef}
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
          <MapPin size={16} />
          <span>Municipio:</span>
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
          <input
            ref={inputRef}
            id="input-search-municipality"
            type="text"
            value={isOpen ? searchTerm : (selectedMunicipality === 'TODOS' ? '' : selectedMunicipality)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
              setSearchTerm('');
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            autoComplete="off"
            style={{
              width: '100%',
              padding: '8px 32px 8px 12px',
              borderRadius: '10px',
              border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border)',
              fontSize: '0.86rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              backgroundColor: 'var(--surface-secondary)',
              color: 'var(--text-main)',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              boxShadow: isOpen ? '0 0 0 3px var(--primary-light)' : 'none'
            }}
          />

          {/* Botón borrar selección o flecha desplegable */}
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
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '50%'
                }}
                title="Quitar filtro de municipio"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
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
                size={14}
                style={{
                  transition: 'transform 0.2s ease',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </button>
          </div>

          {/* Menú desplegable flotante de municipios */}
          {isOpen && (
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
              zIndex: 50,
              padding: '6px 0'
            }}>
              {/* Opción 1: Toda la región */}
              <div
                onClick={() => handleSelect('TODOS')}
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

              {/* Lista filtrada de municipios */}
              {filteredMunicipalities.map((muni) => {
                const isSelected = selectedMunicipality === muni;
                return (
                  <div
                    key={muni}
                    onClick={() => handleSelect(muni)}
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
                  No se encontró el municipio "{searchTerm}".
                  <button
                    type="button"
                    onClick={() => handleSelect('TODOS')}
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

      {/* 2. Selector de Especialidad / Categoría en la misma barra */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: '1 1 210px',
        minWidth: '200px'
      }}>
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

        <select
          id="select-specialty"
          value={selectedCategoryId || ''}
          onChange={(e) => onSelectCategory(e.target.value ? e.target.value : null)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '10px',
            border: selectedCategoryId ? '1px solid var(--primary)' : '1px solid var(--border)',
            fontSize: '0.86rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            backgroundColor: selectedCategoryId ? 'var(--primary-light)' : 'var(--surface-secondary)',
            color: selectedCategoryId ? 'var(--primary)' : 'var(--text-main)',
            cursor: 'pointer',
            outline: 'none',
            transition: 'border-color 0.2s ease, background-color 0.2s ease'
          }}
        >
          <option value="">✨ Todas las Especialidades</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Ordenamiento y GPS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
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

        {/* Botón Detectar Ubicación GPS */}
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
            whiteSpace: 'nowrap'
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
    </div>
  );
};
