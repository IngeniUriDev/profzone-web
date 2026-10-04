import { createClient } from '@supabase/supabase-js';

// Credenciales de conexión oficial ProfZone en Supabase
const DEFAULT_SUPABASE_URL = 'https://rwuteyazndqcnzciugtd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dXRleWF6bmRxY256Y2l1Z3RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwODc0OTMsImV4cCI6MjEwNjY2MzQ5M30.ts3at_UvpQR4_iPiqJJ46-2j_JPDC_CjgL7HIi5PYMk';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseUrl = rawSupabaseUrl ? rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '') : '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
