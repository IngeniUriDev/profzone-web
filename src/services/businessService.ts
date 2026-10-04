import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Business, BusinessStatus, UserProfile } from '../types/database';
import { INITIAL_BUSINESSES } from '../data/mockData';
import { isBusinessOwner } from '../utils/ownership';
import { adminService } from './adminService';

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

function normalizeText(str?: string | null): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function deduplicateBusinesses(list: Business[]): Business[] {
  const map = new Map<string, Business>();

  for (const b of list) {
    if (!b) continue;

    const normName = normalizeText(b.name);
    const normAddress = normalizeText(b.address);
    const normMuni = normalizeText(b.municipality);
    // Un negocio se considera duplicado exacto solo si coinciden nombre, dirección y municipio
    const key = (normName && normMuni) ? `${normName}||${normAddress}||${normMuni}` : (b.id || Math.random().toString());

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
    const cleanAddress = (business.address || '').trim();

    // Verificación de límite de 3 negocios al día por usuario
    const ownerId = business.user_id || business.submitted_by;
    if (ownerId) {
      const dailyCount = await this.getUserDailyBusinessCount(ownerId);
      if (dailyCount >= 3) {
        throw new Error('Has alcanzado el límite diario permitido de 3 negocios registrados por día. Por seguridad y calidad comunitaria, podrás registrar más negocios en 24 horas.');
      }
    }

    const newRecord: Business = {
      ...business,
      name: trimmedName,
      municipality: cleanMuni,
      address: cleanAddress,
      id: isSupabaseConfigured ? undefined as unknown as string : `biz-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      status: 'pending',
      rating_avg: 5.0,
      rating_count: 0,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      // 1. Verificación contra duplicados: Solo se rechaza si coinciden NOMBRE y DIRECCIÓN en el mismo municipio.
      // Si tienen el mismo nombre pero diferente dirección, o la misma dirección pero diferente nombre, sí se permite el registro.
      let query = supabase
        .from('pz_businesses')
        .select('id, name, address, municipality')
        .ilike('name', trimmedName)
        .ilike('municipality', cleanMuni);

      if (cleanAddress) {
        query = query.ilike('address', cleanAddress);
      }

      const { data: existingMatches } = await query;

      if (existingMatches && existingMatches.length > 0) {
        const hasExactDuplicate = existingMatches.some(found => {
          const sameName = normalizeText(found.name) === normalizeText(trimmedName);
          const sameMuni = normalizeText(found.municipality) === normalizeText(cleanMuni);
          const sameAddress = normalizeText(found.address) === normalizeText(cleanAddress);
          return sameName && sameMuni && sameAddress;
        });

        if (hasExactDuplicate) {
          throw new Error(`El negocio "${trimmedName}" ya se encuentra registrado con la dirección "${cleanAddress || 'esta ubicación'}" en ${cleanMuni}. No es necesario volver a darlo de alta.`);
        }
      }

      const payload: any = {
        name: trimmedName,
        category_id: business.category_id,
        municipality: cleanMuni,
        locality: business.locality,
        address: cleanAddress,
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

    // Modo local / Fallback
    const current = getLocalBusinesses();
    const isDuplicate = current.some(b => {
      const sameName = normalizeText(b.name) === normalizeText(trimmedName);
      const sameMuni = normalizeText(b.municipality) === normalizeText(cleanMuni);
      const sameAddress = normalizeText(b.address) === normalizeText(cleanAddress);
      // Solo es duplicado si coinciden nombre Y dirección en el mismo municipio
      return sameName && sameMuni && sameAddress;
    });

    if (isDuplicate) {
      throw new Error(`El negocio "${trimmedName}" ya se encuentra registrado con la dirección "${cleanAddress || 'esta ubicación'}" en ${cleanMuni}.`);
    }

    const updated = [newRecord, ...current];
    saveLocalBusinesses(updated);
    return newRecord;
  },

  async updateBusinessStatus(id: string, status: BusinessStatus): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { data: targetBiz } = await supabase
        .from('pz_businesses')
        .select('name, municipality, address')
        .eq('id', id)
        .maybeSingle();

      // 1. Intentar actualizar mediante RPC segura de moderación ejecutiva (con PIN maestro)
      let updateSuccessful = false;
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('pz_update_business_status', {
          business_id: id,
          new_status: status,
          admin_pin: adminService.getMasterPin()
        });
        if (!rpcError && rpcData) {
          updateSuccessful = true;
        }
      } catch {
        // RPC aún no ejecutada en Supabase, continuar con UPDATE directo
      }

      // 2. Si la función RPC aún no está creada, intentar UPDATE directo vía REST
      if (!updateSuccessful) {
        const { data, error } = await supabase
          .from('pz_businesses')
          .update({ status })
          .eq('id', id)
          .select();

        if (error) {
          console.error('Error updating status in Supabase:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          throw new Error('Supabase no permitió actualizar el estado (0 filas modificadas por RLS). Aplica el script actualizado de supabase_schema.sql en el SQL Editor de Supabase.');
        }
      }

      // Si existen filas duplicadas exactas con el mismo nombre, dirección y municipio, sincronizarlas
      if (targetBiz?.name) {
        let updateQuery = supabase
          .from('pz_businesses')
          .update({ status })
          .ilike('name', targetBiz.name.trim())
          .ilike('municipality', (targetBiz.municipality || '').trim());

        if (targetBiz.address?.trim()) {
          updateQuery = updateQuery.ilike('address', targetBiz.address.trim());
        }

        await updateQuery;
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
        .select('name, municipality, address')
        .eq('id', id)
        .maybeSingle();

      try {
        await supabase.from('pz_reviews').delete().eq('business_id', id);
        await supabase.from('pz_staff').delete().eq('business_id', id);
      } catch (e) {
        console.warn('Could not cascade delete reviews/staff:', e);
      }

      // 1. Intentar eliminar vía RPC segura de administración (con PIN maestro)
      let deleteSuccessful = false;
      try {
        const { error: rpcError } = await supabase.rpc('pz_admin_delete_business', {
          business_id: id,
          admin_pin: adminService.getMasterPin()
        });
        if (!rpcError) {
          deleteSuccessful = true;
        }
      } catch {
        // RPC fallback
      }

      if (!deleteSuccessful) {
        const { error } = await supabase
          .from('pz_businesses')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting business from Supabase:', error);
          throw error;
        }
      }

      // Limpiar también duplicados idénticos por nombre, dirección y municipio si existieran
      if (targetBiz?.name) {
        let delQuery = supabase
          .from('pz_businesses')
          .delete()
          .ilike('name', targetBiz.name.trim())
          .ilike('municipality', (targetBiz.municipality || '').trim());

        if (targetBiz.address?.trim()) {
          delQuery = delQuery.ilike('address', targetBiz.address.trim());
        }

        await delQuery;
      }
      return;
    }

    const current = getLocalBusinesses();
    const updated = current.filter(b => b.id !== id);
    saveLocalBusinesses(updated);
  },

  async getUserDailyBusinessCount(userId: string): Promise<number> {
    if (!userId) return 0;
    if (isSupabaseConfigured && supabase) {
      try {
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count, error } = await supabase
          .from('pz_businesses')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', since24h);
        if (!error && typeof count === 'number') {
          return count;
        }
      } catch (err) {
        console.warn('Error checking daily count in Supabase:', err);
      }
    }
    const sinceTime = Date.now() - 24 * 60 * 60 * 1000;
    const current = getLocalBusinesses();
    return current.filter(b => (b.user_id === userId || b.submitted_by === userId) && b.created_at && new Date(b.created_at).getTime() >= sinceTime).length;
  },

  async clearAllBusinesses(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.rpc('pz_admin_clear_all_businesses', {
          admin_pin: adminService.getMasterPin()
        });
      } catch {
        // RPC fallback
      }
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
