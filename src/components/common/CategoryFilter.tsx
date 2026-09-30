import React from 'react';
import { Baby, Smile, Utensils, Music, Stethoscope, Wrench, Layers } from 'lucide-react';
import type { Category } from '../../types/database';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'baby': return <Baby size={16} />;
      case 'smile': return <Smile size={16} />;
      case 'utensils': return <Utensils size={16} />;
      case 'music': return <Music size={16} />;
      case 'stethoscope': return <Stethoscope size={16} />;
      case 'wrench': return <Wrench size={16} />;
      default: return <Layers size={16} />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      overflowX: 'auto',
      paddingBottom: '8px',
      margin: '16px 0 24px 0'
    }}>
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '9999px',
          fontSize: '0.85rem',
          fontWeight: 600,
          border: '1px solid',
          borderColor: selectedCategoryId === null ? 'var(--primary)' : 'var(--border)',
          backgroundColor: selectedCategoryId === null ? 'var(--primary)' : 'var(--surface)',
          color: selectedCategoryId === null ? '#ffffff' : 'var(--text-main)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
          boxShadow: selectedCategoryId === null ? '0 2px 8px rgba(2,132,199,0.3)' : 'none'
        }}
      >
        <Layers size={16} />
        <span>Todos los Servicios</span>
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1px solid',
              borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
              backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface)',
              color: isSelected ? '#ffffff' : 'var(--text-main)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              boxShadow: isSelected ? '0 2px 8px rgba(2,132,199,0.3)' : 'none'
            }}
          >
            {getIcon(cat.icon)}
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
