import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Review, Business } from '../types/database';
import { INITIAL_REVIEWS } from '../data/mockData';

const LOCAL_STORAGE_REVIEWS = 'profzone_reviews';
const LOCAL_STORAGE_BUSINESSES = 'profzone_businesses';

function getLocalReviews(): Review[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_REVIEWS);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    return INITIAL_REVIEWS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_REVIEWS;
  }
}

function saveLocalReviews(reviews: Review[]) {
  localStorage.setItem(LOCAL_STORAGE_REVIEWS, JSON.stringify(reviews));
}

export const reviewService = {
  async getReviewsForBusiness(businessId: string): Promise<Review[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('pz_reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }
      return data || [];
    }

    const all = getLocalReviews();
    return all.filter(r => r.business_id === businessId);
  },

  async addReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const newRecord: Review = {
      ...review,
      id: isSupabaseConfigured ? undefined as unknown as string : `rev-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('pz_reviews')
        .insert([{
          business_id: review.business_id,
          staff_id: review.staff_id,
          staff_name: review.staff_name,
          user_id: review.user_id,
          user_name: review.user_name,
          user_phone: review.user_phone,
          user_provider: review.user_provider,
          rating: review.rating,
          comment: review.comment
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding review in Supabase:', error);
        throw error;
      }
      return data;
    }

    // Modo local: Guardar reseña y recalcular promedios
    const current = getLocalReviews();
    const updatedReviews = [newRecord, ...current];
    saveLocalReviews(updatedReviews);

    // Actualizar calificación en negocio y especialista
    try {
      const bizStored = localStorage.getItem(LOCAL_STORAGE_BUSINESSES);
      if (bizStored) {
        const businesses: Business[] = JSON.parse(bizStored);
        const bizIndex = businesses.findIndex(b => b.id === review.business_id);
        if (bizIndex !== -1) {
          const biz = businesses[bizIndex];
          const bizReviews = updatedReviews.filter(r => r.business_id === biz.id);
          const totalRating = bizReviews.reduce((acc, r) => acc + r.rating, 0);
          biz.rating_avg = Math.round((totalRating / bizReviews.length) * 10) / 10;
          biz.rating_count = bizReviews.length;

          // Si la reseña fue para un doctor/personal específico
          if (review.staff_id && biz.staff) {
            const staffIdx = biz.staff.findIndex(s => s.id === review.staff_id);
            if (staffIdx !== -1) {
              const staffDoc = biz.staff[staffIdx];
              const staffReviews = bizReviews.filter(r => r.staff_id === staffDoc.id);
              const staffTotal = staffReviews.reduce((acc, r) => acc + r.rating, 0);
              staffDoc.rating_avg = Math.round((staffTotal / staffReviews.length) * 10) / 10;
              staffDoc.rating_count = staffReviews.length;
            }
          }
          localStorage.setItem(LOCAL_STORAGE_BUSINESSES, JSON.stringify(businesses));
        }
      }
    } catch (err) {
      console.error('Error recalculating ratings locally:', err);
    }

    return newRecord;
  }
};
