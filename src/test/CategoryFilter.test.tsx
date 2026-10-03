import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilter } from '../components/common/CategoryFilter';
import type { Category } from '../types/database';

describe('CategoryFilter Component', () => {
  const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Salud y Médicos', icon: 'stethoscope', description: 'Médicos' },
    { id: 'cat-2', name: 'Música y Bandas', icon: 'music', description: 'Música' },
    { id: 'cat-3', name: 'Comida y Restaurantes', icon: 'utensils', description: 'Comida' },
  ];

  it('should render "Todos los Servicios" and all category buttons', () => {
    const onSelect = vi.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategoryId={null}
        onSelectCategory={onSelect}
      />
    );

    expect(screen.getByText('Todos los Servicios')).toBeInTheDocument();
    expect(screen.getByText('Salud y Médicos')).toBeInTheDocument();
    expect(screen.getByText('Música y Bandas')).toBeInTheDocument();
    expect(screen.getByText('Comida y Restaurantes')).toBeInTheDocument();
  });

  it('should trigger onSelectCategory with null when clicking "Todos los Servicios"', () => {
    const onSelect = vi.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategoryId="cat-1"
        onSelectCategory={onSelect}
      />
    );

    fireEvent.click(screen.getByText('Todos los Servicios'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('should trigger onSelectCategory with the category id when clicking a category button', () => {
    const onSelect = vi.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategoryId={null}
        onSelectCategory={onSelect}
      />
    );

    fireEvent.click(screen.getByText('Música y Bandas'));
    expect(onSelect).toHaveBeenCalledWith('cat-2');
  });
});
