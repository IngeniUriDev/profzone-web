import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { FeedbackSuggestion } from '../types/database';

const LOCAL_STORAGE_FEEDBACK = 'profzone_feedback_v1';
const LOCAL_STORAGE_READ_IDS = 'profzone_read_feedback_ids_v1';

function getLocalFeedback(): FeedbackSuggestion[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_FEEDBACK);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalFeedback(list: FeedbackSuggestion[]) {
  localStorage.setItem(LOCAL_STORAGE_FEEDBACK, JSON.stringify(list));
}

function getReadIds(): string[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_READ_IDS);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveReadIds(list: string[]) {
  localStorage.setItem(LOCAL_STORAGE_READ_IDS, JSON.stringify(list));
}

function mapTypeToDb(type: string): 'new_profession' | 'new_municipality' | 'improvement' | 'other' {
  switch (type) {
    case 'category':
    case 'new_profession':
      return 'new_profession';
    case 'municipality':
    case 'new_municipality':
      return 'new_municipality';
    case 'feature':
    case 'improvement':
      return 'improvement';
    case 'correction':
    case 'other':
    default:
      return 'other';
  }
}

function mapTypeFromDb(type: string): FeedbackSuggestion['type'] {
  switch (type) {
    case 'new_profession':
      return 'category';
    case 'new_municipality':
      return 'municipality';
    case 'improvement':
      return 'feature';
    case 'correction':
      return 'correction';
    case 'category':
      return 'category';
    case 'municipality':
      return 'municipality';
    case 'feature':
      return 'feature';
    default:
      return 'other';
  }
}

function getTitleForType(type: FeedbackSuggestion['type']): string {
  switch (type) {
    case 'category':
      return 'Sugerencia de nueva categoría u oficio';
    case 'municipality':
      return 'Sugerir nuevo municipio o colonia de la zona';
    case 'feature':
      return 'Mejora para la plataforma';
    case 'correction':
      return 'Reporte de corrección o negocio cerrado';
    default:
      return 'Sugerencia de vecino';
  }
}

export const feedbackService = {
  async getFeedbacks(): Promise<FeedbackSuggestion[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('pz_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener sugerencias de Supabase:', error);
        return getLocalFeedback();
      }

      if (data && Array.isArray(data)) {
        return data.map((row: any) => ({
          id: row.id,
          type: mapTypeFromDb(row.type),
          author_name: row.user_name || row.author_name || 'Vecino Verificado',
          contact: row.user_contact || row.contact,
          message: row.message,
          created_at: row.created_at,
          status: (row.status || 'pending') as 'pending' | 'reviewed' | 'implemented',
          title: row.title
        }));
      }

      return [];
    }

    return getLocalFeedback();
  },

  async submitFeedback(data: Omit<FeedbackSuggestion, 'id' | 'created_at'>): Promise<FeedbackSuggestion> {
    const dbType = mapTypeToDb(data.type);
    const title = getTitleForType(data.type);

    if (isSupabaseConfigured && supabase) {
      const payload = {
        type: dbType,
        title: title,
        message: data.message,
        user_name: data.author_name || 'Vecino Verificado',
        user_contact: data.contact || null,
        status: 'pending'
      };

      const { data: inserted, error } = await supabase
        .from('pz_feedback')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Error guardando sugerencia en Supabase:', error);
        // Fallback a localStorage para no perder el mensaje del usuario
        const localRecord: FeedbackSuggestion = {
          ...data,
          id: `feed-${Date.now()}`,
          created_at: new Date().toISOString(),
          status: 'pending'
        };
        const current = getLocalFeedback();
        saveLocalFeedback([localRecord, ...current]);
        throw error;
      }

      const formatted: FeedbackSuggestion = {
        id: inserted.id,
        type: mapTypeFromDb(inserted.type),
        author_name: inserted.user_name || data.author_name,
        contact: inserted.user_contact || data.contact,
        message: inserted.message,
        created_at: inserted.created_at,
        status: (inserted.status || 'pending') as 'pending' | 'reviewed' | 'implemented',
        title: inserted.title
      };

      // Sincronizar en localStorage
      const current = getLocalFeedback();
      saveLocalFeedback([formatted, ...current.filter(f => f.id !== formatted.id)]);

      return formatted;
    }

    const newRecord: FeedbackSuggestion = {
      ...data,
      id: `feed-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'pending'
    };
    const current = getLocalFeedback();
    const updated = [newRecord, ...current];
    saveLocalFeedback(updated);
    return newRecord;
  },

  async updateFeedbackStatus(id: string, status: 'pending' | 'reviewed' | 'implemented'): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('pz_feedback')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error actualizando estado en Supabase:', error);
        throw error;
      }
    }

    // Actualizar en localStorage
    const current = getLocalFeedback();
    const updated = current.map(f => f.id === id ? { ...f, status } : f);
    saveLocalFeedback(updated);

    // Si se atiende, marcarlo como leído también
    if (status !== 'pending') {
      this.markAsRead(id);
    }
  },

  async deleteFeedback(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('pz_feedback')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error eliminando sugerencia en Supabase:', error);
        throw error;
      }
    }

    const current = getLocalFeedback();
    saveLocalFeedback(current.filter(f => f.id !== id));
  },

  getReadIds(): string[] {
    return getReadIds();
  },

  isRead(id: string): boolean {
    return getReadIds().includes(id);
  },

  markAsRead(id: string): void {
    const list = getReadIds();
    if (!list.includes(id)) {
      list.push(id);
      saveReadIds(list);
    }
  },

  markAllAsRead(feedbacks: FeedbackSuggestion[]): void {
    const list = getReadIds();
    feedbacks.forEach(f => {
      if (!list.includes(f.id)) {
        list.push(f.id);
      }
    });
    saveReadIds(list);
  },

  getUnreadCount(feedbacks: FeedbackSuggestion[]): number {
    const readList = getReadIds();
    // Solo contar como no leídas las sugerencias que sigan pendientes
    return feedbacks.filter(f => (!f.status || f.status === 'pending') && !readList.includes(f.id)).length;
  },

  getPendingCount(feedbacks: FeedbackSuggestion[]): number {
    return feedbacks.filter(f => !f.status || f.status === 'pending').length;
  }
};
