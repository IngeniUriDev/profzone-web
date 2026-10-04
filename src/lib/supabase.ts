import { createClient } from '@supabase/supabase-js';

// Credenciales de conexión oficial ProfZone en Supabase
const DEFAULT_SUPABASE_URL = 'https://tusphruuyvkzrsuyavin.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1c3BocnV1eXZrenJzdXlhdmluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3ODk0OTAsImV4cCI6MjEwNjM2NTQ5MH0.QUr3vkEgBMfc6qdvDpc_zVw6lZvX7VTxA6gs8dWHc5Y';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
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
