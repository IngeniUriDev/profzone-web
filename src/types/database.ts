export type BusinessStatus = 'pending' | 'approved' | 'rejected';

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  created_at?: string;
}

export interface Municipality {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface StaffMember {
  id: string;
  business_id: string;
  name: string;
  specialty: string;
  license_number?: string;
  schedule?: string;
  avatar_url?: string;
  rating_avg: number;
  rating_count: number;
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
  status: BusinessStatus;
  submitted_by?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  staff?: StaffMember[];
  created_at?: string;
}

export interface Review {
  id: string;
  business_id: string;
  staff_id?: string;
  staff_name?: string;
  user_id?: string;
  user_name: string;
  user_phone?: string;
  user_provider?: 'facebook' | 'phone';
  rating: number;
  comment: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  provider: 'facebook' | 'phone';
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  role: 'admin' | 'user';
}

export interface FeedbackSuggestion {
  id: string;
  type: 'category' | 'municipality' | 'feature' | 'correction' | 'other';
  author_name: string;
  contact?: string;
  message: string;
  created_at: string;
}

export type SortOption = 'rating' | 'reviews' | 'distance' | 'recent';
