import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Business, BusinessStatus } from '../types/database';
import { INITIAL_BUSINESSES } from '../data/mockData';

const LOCAL_STORAGE_KEY = 'profzone_businesses_v6';

function getLocalBusinesses(): Business[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_BUSINESSES));
    return INITIAL_BUSINESSES;
  }
  try {
    return JSON.parse(stored);
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
      const payload: any = {
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
        facebook_url: business.facebook_url,
        instagram_url: business.instagram_url,
        tiktok_url: business.tiktok_url,
        submitted_by: business.submitted_by,
        status: 'pending'
      };

      let { data, error } = await supabase
        .from('pz_businesses')
        .insert([payload])
        .select()
        .single();

      if (error && (error.message?.includes('facebook_url') || error.message?.includes('instagram_url') || error.message?.includes('tiktok_url'))) {
        console.warn('Columnas de redes sociales aún no migradas en Supabase. Reintentando inserción básica...');
        delete payload.facebook_url;
        delete payload.instagram_url;
        delete payload.tiktok_url;
        const retry = await supabase.from('pz_businesses').insert([payload]).select().single();
        data = retry.data ? {
          ...retry.data,
          facebook_url: business.facebook_url,
          instagram_url: business.instagram_url,
          tiktok_url: business.tiktok_url
        } : null;
        error = retry.error;
      }

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
  },

  async updateBusiness(id: string, updates: Partial<Business>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const updatePayload: any = {
        name: updates.name,
        category_id: updates.category_id,
        municipality: updates.municipality,
        locality: updates.locality,
        address: updates.address,
        phone: updates.phone,
        whatsapp: updates.whatsapp,
        website_url: updates.website_url,
        facebook_url: updates.facebook_url,
        instagram_url: updates.instagram_url,
        tiktok_url: updates.tiktok_url,
        schedule: updates.schedule,
        description: updates.description,
        image_url: updates.image_url,
        latitude: updates.latitude,
        longitude: updates.longitude,
        ...(updates.status ? { status: updates.status } : {})
      };

      let { error } = await supabase
        .from('pz_businesses')
        .update(updatePayload)
        .eq('id', id);

      if (error && (error.message?.includes('facebook_url') || error.message?.includes('instagram_url') || error.message?.includes('tiktok_url'))) {
        delete updatePayload.facebook_url;
        delete updatePayload.instagram_url;
        delete updatePayload.tiktok_url;
        const retry = await supabase.from('pz_businesses').update(updatePayload).eq('id', id);
        error = retry.error;
      }

      if (error) {
        console.error('Error updating business in Supabase:', error);
        throw error;
      }
      return;
    }

    const current = getLocalBusinesses();
    const updated = current.map(b => b.id === id ? { ...b, ...updates } : b);
    saveLocalBusinesses(updated);
  },

  async getAllBusinesses(): Promise<Business[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('pz_businesses')
        .select('*, category:pz_categories(*), staff:pz_staff(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all businesses from Supabase:', error);
        throw error;
      }
      return data || [];
    }

    return getLocalBusinesses();
  },

  async deleteBusiness(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pz_reviews').delete().eq('business_id', id);
        await supabase.from('pz_staff').delete().eq('business_id', id);
      } catch (e) {
        console.warn('Could not cascade delete reviews/staff:', e);
      }

      const { error } = await supabase
        .from('pz_businesses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting business from Supabase:', error);
        throw error;
      }
      return;
    }

    const current = getLocalBusinesses();
    const updated = current.filter(b => b.id !== id);
    saveLocalBusinesses(updated);
  },

  async clearAllBusinesses(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pz_reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('pz_staff').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('pz_businesses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.error('Error clearing businesses from Supabase:', err);
      }
    }

    this.clearAllLocalBusinesses();
  },

  clearAllLocalBusinesses(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem('profzone_businesses_v5');
    localStorage.removeItem('profzone_businesses');
    localStorage.removeItem('profzone_reviews');
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem('profzone_reviews', JSON.stringify([]));
  }
};
