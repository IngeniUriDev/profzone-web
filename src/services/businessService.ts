import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Business, BusinessStatus } from '../types/database';
import { INITIAL_BUSINESSES } from '../data/mockData';

const LOCAL_STORAGE_KEY = 'profzone_businesses_v5';

function getLocalBusinesses(): Business[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_BUSINESSES));
    return INITIAL_BUSINESSES;
  }
  try {
    const list: Business[] = JSON.parse(stored);
    // Si los datos en el navegador no tienen el personal / doctores actualizados, re-sincronizar
    if (!list.some(b => b.staff && b.staff.length > 0)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_BUSINESSES));
      return INITIAL_BUSINESSES;
    }
    return list;
  } catch {
    return INITIAL_BUSINESSES;
  }
}

function saveLocalBusinesses(businesses: Business[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(businesses));
}

export const businessService = {
  resetToInitialData(): Business[] {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_BUSINESSES));
    return INITIAL_BUSINESSES;
  },

  async getBusinesses(options?: {
    status?: BusinessStatus;
    categoryId?: string;
    municipality?: string;
    searchQuery?: string;
  }): Promise<Business[]> {
    const { status = 'approved', categoryId, municipality, searchQuery } = options || {};

    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('pz_businesses')
        .select('*, category:pz_categories(*), staff:pz_staff(*)')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      if (municipality && municipality !== 'TODOS') {
        query = query.eq('municipality', municipality);
      }
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,locality.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching businesses from Supabase:', error);
        throw error;
      }
      return data || [];
    }

    // Modo local / Fallback
    let list = getLocalBusinesses();
    if (status) {
      list = list.filter(b => b.status === status);
    }
    if (categoryId) {
      list = list.filter(b => b.category_id === categoryId);
    }
    if (municipality && municipality !== 'TODOS') {
      list = list.filter(b => b.municipality.toLowerCase() === municipality.toLowerCase());
    }
    return list;
  },

  async createBusiness(business: Omit<Business, 'id' | 'status' | 'rating_avg' | 'rating_count' | 'created_at'>): Promise<Business> {
    const newRecord: Business = {
      ...business,
      id: isSupabaseConfigured ? undefined as unknown as string : `biz-${Date.now()}`,
      status: 'pending',
      rating_avg: 5.0,
      rating_count: 0,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('pz_businesses')
        .insert([{
          name: business.name,
          category_id: business.category_id,
          municipality: business.municipality || 'Santiago Tianguistenco',
          locality: business.locality,
          address: business.address,
          google_maps_url: business.google_maps_url,
          phone: business.phone,
          whatsapp: business.whatsapp,
          schedule: business.schedule,
          description: business.description,
          image_url: business.image_url,
          latitude: business.latitude,
          longitude: business.longitude,
          website_url: business.website_url,
          submitted_by: business.submitted_by,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating business in Supabase:', error);
        throw error;
      }
      return data;
    }

    const current = getLocalBusinesses();
    const updated = [newRecord, ...current];
    saveLocalBusinesses(updated);
    return newRecord;
  },

  async updateBusinessStatus(id: string, status: BusinessStatus): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('pz_businesses')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating status in Supabase:', error);
        throw error;
      }
      return;
    }

    const current = getLocalBusinesses();
    const updated = current.map(b => b.id === id ? { ...b, status } : b);
    saveLocalBusinesses(updated);
  }
};
