// ========================================================
// PROFZONE (by RoliCode) - DEFINICIÓN DE TIPOS
// Capa de Tipos (TypeScript): Garantiza tipado estricto
// ========================================================

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  created_at?: string;
}

export interface Business {
  id: string;
  name: string;
  category_id?: string;
  category?: Category;
  municipality: string;
  locality?: string;
  address: string;
  google_maps_url?: string;
  website_url?: string;
  phone?: string;
  whatsapp?: string;
  schedule?: string;
  description?: string;
  image_url?: string;
  rating_avg: number;
  rating_count: number;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  business_id: string;
  user_id: string;
  user_name: string;
  rating: number; // 1 to 5
  comment: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
}

export interface FilterState {
  municipality: string;
  categoryId: string | null;
  searchQuery: string;
}
