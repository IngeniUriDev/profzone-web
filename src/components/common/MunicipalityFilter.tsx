import React from 'react';
import { MapPin, Navigation, ArrowUpDown } from 'lucide-react';
import type { SortOption } from '../../types/database';

interface MunicipalityFilterProps {
  municipalities: string[];
  selectedMunicipality: string;
  onSelectMunicipality: (muni: string) => void;
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
  sortBy,
  onSelectSortBy,
  onDetectLocation,
  detectingLocation,
  userCoords
}) => {
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
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Selector de Municipio */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--primary)',
          fontWeight: 700,
          fontSize: '0.84rem'
        }}>
          <MapPin size={16} />
          <span>Municipio:</span>
        </div>

        <select
          id="select-municipality"
          value={selectedMunicipality}
          onChange={(e) => onSelectMunicipality(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            fontSize: '0.88rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            backgroundColor: 'var(--surface-secondary)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            minWidth: '210px',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
        >
          <option value="TODOS">📍 Toda la Región</option>
          {municipalities.map((muni) => (
            <option key={muni} value={muni}>
              {muni}
            </option>
          ))}
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
            gap: '6px'
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

      {/* Ordenamiento */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 600 }}>
          <ArrowUpDown size={15} />
          <span>Ordenar:</span>
        </div>

        <select
          id="select-sort-by"
          value={sortBy}
          onChange={(e) => onSelectSortBy(e.target.value as SortOption)}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            fontSize: '0.88rem',
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
