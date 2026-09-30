import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { FeedbackSuggestion } from '../types/database';

const LOCAL_STORAGE_FEEDBACK = 'profzone_feedback_v1';

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
      return data || [];
    }

    return getLocalFeedback();
  },

  async submitFeedback(data: Omit<FeedbackSuggestion, 'id' | 'created_at'>): Promise<FeedbackSuggestion> {
    const newRecord: FeedbackSuggestion = {
      ...data,
      id: isSupabaseConfigured ? undefined as unknown as string : `feed-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data: inserted, error } = await supabase
        .from('pz_feedback')
        .insert([{
          type: data.type,
          author_name: data.author_name,
          contact: data.contact,
          message: data.message
        }])
        .select()
        .single();

      if (error) {
        console.error('Error guardando sugerencia en Supabase:', error);
        throw error;
      }
      return inserted;
    }

    const current = getLocalFeedback();
    const updated = [newRecord, ...current];
    saveLocalFeedback(updated);
    return newRecord;
  }
};
