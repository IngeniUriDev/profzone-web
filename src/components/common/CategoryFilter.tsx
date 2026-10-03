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
      gap: '10px',
      overflowX: 'auto',
      padding: '6px 2px 14px 2px',
      margin: '14px 0 20px 0',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 18px',
          borderRadius: '9999px',
          fontSize: '0.86rem',
          fontWeight: 700,
          border: '1px solid',
          borderColor: selectedCategoryId === null ? 'transparent' : 'var(--border)',
          backgroundColor: selectedCategoryId === null ? 'var(--primary)' : 'var(--surface)',
          color: selectedCategoryId === null ? '#ffffff' : 'var(--text-main)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: selectedCategoryId === null
            ? '0 4px 14px rgba(2, 132, 199, 0.35)'
            : 'var(--shadow-sm)'
        }}
        onMouseEnter={(e) => {
          if (selectedCategoryId !== null) {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (selectedCategoryId !== null) {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
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
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 700,
              border: '1px solid',
              borderColor: isSelected ? 'transparent' : 'var(--border)',
              backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface)',
              color: isSelected ? '#ffffff' : 'var(--text-main)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isSelected
                ? '0 4px 14px rgba(2, 132, 199, 0.35)'
                : 'var(--shadow-sm)'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
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
