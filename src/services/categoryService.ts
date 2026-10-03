import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Category } from '../types/database';
import { INITIAL_CATEGORIES } from '../data/mockData';

const LOCAL_STORAGE_CATEGORIES = 'profzone_categories_v5';

function getLocalCategories(): Category[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_CATEGORIES);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }
  try {
    const list: Category[] = JSON.parse(stored);
    return list && list.length > 0 ? list : INITIAL_CATEGORIES;
  } catch {
    return INITIAL_CATEGORIES;
  }
}

function saveLocalCategories(categories: Category[]) {
  localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(categories));
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('pz_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories from Supabase:', error);
        return getLocalCategories();
      }
      return data && data.length > 0 ? data : getLocalCategories();
    }
    return getLocalCategories();
  },

  async createCategory(cat: { name: string; icon: string; description?: string }): Promise<Category> {
    const newCat: Category = {
      id: isSupabaseConfigured ? undefined as unknown as string : `cat-${Date.now()}`,
      name: cat.name.trim(),
      icon: cat.icon.trim() || 'Layers',
      description: cat.description?.trim(),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('pz_categories')
        .insert([{
          name: newCat.name,
          icon: newCat.icon,
          description: newCat.description
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating category in Supabase:', error);
        throw error;
      }
      return data;
    }

    const current = getLocalCategories();
    const updated = [...current, newCat];
    saveLocalCategories(updated);
    return newCat;
  },

  async deleteCategory(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('pz_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category from Supabase:', error);
        throw error;
      }
      return;
    }

    const current = getLocalCategories();
    const updated = current.filter(c => c.id !== id);
    saveLocalCategories(updated);
  },

  async updateCategory(id: string, updates: { name: string; icon: string; description?: string }): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('pz_categories')
        .update({
          name: updates.name.trim(),
          icon: updates.icon.trim() || 'Layers',
          description: updates.description?.trim()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating category in Supabase:', error);
        throw error;
      }
      return;
    }

    const current = getLocalCategories();
    const updated = current.map(c => c.id === id ? {
      ...c,
      name: updates.name.trim(),
      icon: updates.icon.trim() || 'Layers',
      description: updates.description?.trim()
    } : c);
    saveLocalCategories(updated);
  }
};
