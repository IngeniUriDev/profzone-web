import type { Category, Business, Review } from '../types/database';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Hospitales, Clínicas y Médicos',
    icon: 'Stethoscope',
    description: 'Hospitales generales, clínicas de especialidades, pediatría, medicina familiar y urgencias'
  },
  {
    id: 'cat-2',
    name: 'Consultorios Dentales y Odontología',
    icon: 'Smile',
    description: 'Odontología integral, ortodoncia, odontopediatría, limpieza y salud bucal'
  },
  {
    id: 'cat-3',
    name: 'Cocina Económica y Tradicional',
    icon: 'Utensils',
    description: 'Comida corrida con sazón casero, barbacoa de la región y antojitos'
  },
  {
    id: 'cat-4',
    name: 'Mariachi y Música Regional',
    icon: 'Music',
    description: 'Mariachis profesionales, agrupaciones y tríos para serenatas y celebraciones'
  },
  {
    id: 'cat-5',
    name: 'Talleres y Oficios',
    icon: 'Wrench',
    description: 'Plomería, electricidad, mecánica automotriz, herrería y carpintería de confianza'
  },
  {
    id: 'cat-6',
    name: 'Belleza, Barberías y Lashistas',
    icon: 'Sparkles',
    description: 'Cortes, barberías, diseño de cejas, pestañas, uñas y estilismo profesional'
  },
  {
    id: 'cat-7',
    name: 'Psicología y Salud Mental',
    icon: 'HeartHandshake',
    description: 'Terapia infantil, juvenil, familiar y acompañamiento psicológico'
  },
  {
    id: 'cat-8',
    name: 'Servicios Legales y Asesoría',
    icon: 'Scale',
    description: 'Abogados, notarías, asesoría jurídica y trámites civiles o mercantiles'
  }
];

export const INITIAL_BUSINESSES: Business[] = [];

export const INITIAL_REVIEWS: Review[] = [];
