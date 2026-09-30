import React from 'react';
import { MapPin, Navigation, ArrowUpDown, Check } from 'lucide-react';
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
      padding: '14px 18px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '14px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Selector de Municipio */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
          <MapPin size={16} />
          <span>Municipio:</span>
        </div>

        <select
          id="select-municipality"
          value={selectedMunicipality}
          onChange={(e) => onSelectMunicipality(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            fontSize: '0.9rem',
            fontWeight: 600,
            backgroundColor: '#ffffff',
            color: 'var(--text-main)',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          <option value="TODOS">Todos los municipios</option>
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
            fontSize: '0.8rem',
            padding: '6px 12px',
            border: userCoords ? '1px solid #0284c7' : '1px solid var(--border)',
            background: userCoords ? '#f0f9ff' : 'var(--surface-secondary)',
            color: userCoords ? '#0284c7' : 'var(--text-main)'
          }}
          title="Usa el GPS de tu dispositivo para ordenar por los más cercanos a ti"
        >
          {userCoords ? <Check size={14} color="#0284c7" /> : <Navigation size={14} />}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
          <ArrowUpDown size={15} />
          <span>Ordenar por:</span>
        </div>

        <select
          id="select-sort-by"
          value={sortBy}
          onChange={(e) => onSelectSortBy(e.target.value as SortOption)}
          style={{
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            fontSize: '0.88rem',
            fontWeight: 600,
            backgroundColor: '#ffffff',
            color: 'var(--text-main)',
            cursor: 'pointer'
          }}
        >
          <option value="rating">⭐ Mejor Calificados (5 estrellas)</option>
          <option value="reviews">💬 Más Recomendados (Reseñas)</option>
          <option value="distance">📍 Más Cercanos (Proximidad)</option>
          <option value="recent">🕒 Más Recientes</option>
        </select>
      </div>
    </div>
  );
};
