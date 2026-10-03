-- =========================================================================
-- ProfZone - Esquema Oficial de Base de Datos para Supabase
-- Copia y pega este script en: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Tabla de Categorías de Servicios
CREATE TABLE IF NOT EXISTS public.pz_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'Layers',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Negocios y Profesionales
CREATE TABLE IF NOT EXISTS public.pz_businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.pz_categories(id) ON DELETE SET NULL,
  municipality TEXT NOT NULL,
  locality TEXT DEFAULT 'Centro',
  address TEXT NOT NULL,
  google_maps_url TEXT,
  website_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  phone TEXT,
  whatsapp TEXT,
  schedule TEXT,
  description TEXT,
  image_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating_avg NUMERIC(3, 2) DEFAULT 5.0,
  rating_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Personal Especializado (Doctores, Odontólogos, Maestros)
CREATE TABLE IF NOT EXISTS public.pz_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.pz_businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  license_number TEXT,
  schedule TEXT,
  avatar_url TEXT,
  rating_avg NUMERIC(3, 2) DEFAULT 5.0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Reseñas y Calificaciones Comunitarias
CREATE TABLE IF NOT EXISTS public.pz_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.pz_businesses(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.pz_staff(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_phone TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Buzón de Sugerencias y Nuevos Oficios
CREATE TABLE IF NOT EXISTS public.pz_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('new_profession', 'new_municipality', 'improvement', 'other')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  user_name TEXT,
  user_contact TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) con políticas públicas de lectura
ALTER TABLE public.pz_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pz_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pz_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pz_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pz_feedback ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
DROP POLICY IF EXISTS "Lectura pública de categorías" ON public.pz_categories;
CREATE POLICY "Lectura pública de categorías" ON public.pz_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserción de categorías" ON public.pz_categories;
CREATE POLICY "Inserción de categorías" ON public.pz_categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Lectura pública de negocios aprobados" ON public.pz_businesses;
CREATE POLICY "Lectura pública de negocios aprobados" ON public.pz_businesses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserción de negocios pendientes" ON public.pz_businesses;
CREATE POLICY "Inserción de negocios pendientes" ON public.pz_businesses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Actualización de negocios" ON public.pz_businesses;
CREATE POLICY "Actualización de negocios" ON public.pz_businesses FOR ALL USING (true);

DROP POLICY IF EXISTS "Lectura pública de staff" ON public.pz_staff;
CREATE POLICY "Lectura pública de staff" ON public.pz_staff FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gestión de staff" ON public.pz_staff;
CREATE POLICY "Gestión de staff" ON public.pz_staff FOR ALL USING (true);

DROP POLICY IF EXISTS "Lectura pública de reseñas" ON public.pz_reviews;
CREATE POLICY "Lectura pública de reseñas" ON public.pz_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserción pública de reseñas" ON public.pz_reviews;
CREATE POLICY "Inserción pública de reseñas" ON public.pz_reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Inserción pública de sugerencias" ON public.pz_feedback;
CREATE POLICY "Inserción pública de sugerencias" ON public.pz_feedback FOR ALL USING (true);

-- Insertar categorías iniciales si no existen
INSERT INTO public.pz_categories (name, icon, description) VALUES
  ('Hospitales, Clínicas y Médicos', 'Stethoscope', 'Hospitales generales, clínicas de especialidades, pediatría, medicina familiar y urgencias'),
  ('Consultorios Dentales y Odontología', 'Smile', 'Odontología integral, ortodoncia, odontopediatría, limpieza y salud bucal'),
  ('Cocina Económica y Tradicional', 'Utensils', 'Comida corrida con sazón casero, barbacoa de la región y antojitos'),
  ('Mariachi y Música Regional', 'Music', 'Mariachis profesionales, agrupaciones y tríos para serenatas y celebraciones'),
  ('Talleres y Oficios', 'Wrench', 'Plomería, electricidad, mecánica automotriz, herrería y carpintería de confianza'),
  ('Belleza, Barberías y Lashistas', 'Sparkles', 'Cortes, barberías, diseño de cejas, pestañas, uñas y estilismo profesional'),
  ('Psicología y Salud Mental', 'HeartHandshake', 'Terapia infantil, juvenil, familiar y acompañamiento psicológico'),
  ('Servicios Legales y Asesoría', 'Scale', 'Abogados, notarías, asesoría jurídica y trámites civiles o mercantiles')
ON CONFLICT (name) DO NOTHING;

-- 8. Migración para habilitar redes sociales en tablas existentes:
ALTER TABLE public.pz_businesses ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE public.pz_businesses ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.pz_businesses ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
