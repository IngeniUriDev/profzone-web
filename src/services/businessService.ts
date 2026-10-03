import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Business, BusinessStatus, UserProfile } from '../types/database';
import { INITIAL_BUSINESSES } from '../data/mockData';
import { isBusinessOwner } from '../utils/ownership';

export { isBusinessOwner };

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

function deduplicateBusinesses(list: Business[]): Business[] {
  const map = new Map<string, Business>();

  for (const b of list) {
    if (!b) continue;

    const normName = (b.name || '').trim().toLowerCase();
    const normMuni = (b.municipality || '').trim().toLowerCase();
    const key = (normName && normMuni) ? `${normName}||${normMuni}` : (b.id || Math.random().toString());

    const existing = map.get(key);
    if (!existing) {
      map.set(key, b);
    } else {
      // Priorizar siempre status 'approved' frente a 'rejected' o 'pending'
      if (b.status === 'approved' && existing.status !== 'approved') {
        map.set(key, b);
      }
    }
  }

  return Array.from(map.values());
}

function saveLocalBusinesses(businesses: Business[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(deduplicateBusinesses(businesses)));
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
      return deduplicateBusinesses(data || []);
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
    return deduplicateBusinesses(list);
  },

  async createBusiness(business: Omit<Business, 'id' | 'status' | 'rating_avg' | 'rating_count' | 'created_at'>): Promise<Business> {
    const trimmedName = business.name.trim();
    const cleanMuni = (business.municipality || 'Santiago Tianguistenco').trim();

    const newRecord: Business = {
      ...business,
      name: trimmedName,
      municipality: cleanMuni,
      id: isSupabaseConfigured ? undefined as unknown as string : `biz-${Date.now()}`,
      status: 'pending',
      rating_avg: 5.0,
      rating_count: 0,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      // 1. Verificación defensiva contra duplicados antes de insertar en Supabase
      const { data: existingMatches } = await supabase
        .from('pz_businesses')
        .select('id, name, municipality')
        .ilike('name', trimmedName)
        .ilike('municipality', cleanMuni)
        .limit(1);

      if (existingMatches && existingMatches.length > 0) {
        throw new Error(`El servicio "${trimmedName}" ya se encuentra registrado en ${cleanMuni}. No es necesario volver a darlo de alta.`);
      }

      const payload: any = {
        name: trimmedName,
        category_id: business.category_id,
        municipality: cleanMuni,
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
    const isDuplicate = current.some(
      b => b.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
           b.municipality.trim().toLowerCase() === cleanMuni.toLowerCase()
    );
    if (isDuplicate) {
      throw new Error(`El servicio "${trimmedName}" ya se encuentra registrado en ${cleanMuni}.`);
    }

    const updated = [newRecord, ...current];
    saveLocalBusinesses(updated);
    return newRecord;
  },

  async updateBusinessStatus(id: string, status: BusinessStatus): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      // Obtener datos del negocio para detectar duplicados por nombre y municipio
      const { data: targetBiz } = await supabase
        .from('pz_businesses')
        .select('name, municipality')
        .eq('id', id)
        .maybeSingle();

      const { error } = await supabase
        .from('pz_businesses')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating status in Supabase:', error);
        throw error;
      }

      // Si existen filas duplicadas con el mismo nombre y municipio, sincronizarlas
      if (targetBiz?.name) {
        await supabase
          .from('pz_businesses')
          .update({ status })
          .ilike('name', targetBiz.name.trim())
          .ilike('municipality', (targetBiz.municipality || '').trim());
      }

      return;
    }

    const current = getLocalBusinesses();
    const updated = current.map(b => b.id === id ? { ...b, status } : b);
    saveLocalBusinesses(updated);
  },

  async updateBusiness(id: string, updates: Partial<Business>, user?: UserProfile | null): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      if (user && user.role !== 'admin') {
        const { data: existingBiz, error: fetchErr } = await supabase
          .from('pz_businesses')
          .select('id, submitted_by')
          .eq('id', id)
          .single();
        if (fetchErr || !existingBiz || !isBusinessOwner(existingBiz as Business, user)) {
          throw new Error('No tienes permisos para editar esta publicación. Solo el creador o un administrador pueden modificarla.');
        }
      }

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
    const existing = current.find(b => b.id === id);
    if (user && user.role !== 'admin' && existing && !isBusinessOwner(existing, user)) {
      throw new Error('No tienes permisos para editar esta publicación. Solo el creador o un administrador pueden modificarla.');
    }

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
      return deduplicateBusinesses(data || []);
    }

    return deduplicateBusinesses(getLocalBusinesses());
  },

  async deleteBusiness(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { data: targetBiz } = await supabase
        .from('pz_businesses')
        .select('name, municipality')
        .eq('id', id)
        .maybeSingle();

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

      // Limpiar también duplicados por nombre y municipio si existieran
      if (targetBiz?.name) {
        await supabase
          .from('pz_businesses')
          .delete()
          .ilike('name', targetBiz.name.trim())
          .ilike('municipality', (targetBiz.municipality || '').trim());
      }

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
