import type { Business, Category } from '../types/database';

// Normaliza texto: quita acentos, signos de puntuación y pasa a minúsculas
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos (á->a, é->e, etc.)
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

// Diccionario semántico de sinónimos y conceptos relacionados para la región
const SYNONYM_MAP: Record<string, string[]> = {
  // Salud y Medicina
  hospital: ['clinica', 'medico', 'doctor', 'salud', 'urgencias', 'sanatorio', 'pediatra', 'consultorio', 'hospitales'],
  clinica: ['hospital', 'medico', 'doctor', 'salud', 'consultorio', 'centro medico'],
  medico: ['doctor', 'hospital', 'clinica', 'pediatra', 'salud', 'consulta', 'medicina', 'especialista'],
  medicos: ['doctor', 'doctores', 'hospital', 'clinica', 'pediatras', 'salud'],
  doctor: ['medico', 'hospital', 'clinica', 'pediatra', 'especialista'],
  doctores: ['medicos', 'hospital', 'clinica', 'pediatras', 'especialistas'],
  pediatra: ['infantil', 'ninos', 'bebes', 'pediatria', 'vacunas', 'medico', 'doctor', 'clinica'],
  pediatras: ['infantil', 'ninos', 'bebes', 'pediatria', 'vacunas', 'medicos', 'doctores'],
  pediatria: ['pediatra', 'infantil', 'ninos', 'bebes', 'medico'],
  salud: ['medico', 'clinica', 'hospital', 'doctor', 'dental', 'pediatra'],

  // Odontología
  dentista: ['dental', 'odontologo', 'muela', 'dientes', 'brackets', 'ortodoncia', 'limpieza dental', 'odontologia'],
  dentistas: ['dental', 'odontologos', 'muelas', 'dientes', 'brackets', 'ortodoncia'],
  dental: ['dentista', 'odontologo', 'dientes', 'muela', 'brackets', 'ortodoncia', 'odontologia'],
  odontologo: ['dentista', 'dental', 'ortodoncia', 'dientes', 'muelas'],
  brackets: ['ortodoncia', 'dental', 'dentista'],

  // Alimentos y Gastronomía
  comida: ['cocina', 'economica', 'restaurante', 'almuerzo', 'antojitos', 'barbacoa', 'fondita', 'desayuno', 'sazon'],
  restaurante: ['comida', 'cocina', 'barbacoa', 'antojitos', 'fondita'],
  cocina: ['comida', 'economica', 'restaurante', 'fondita', 'guisado', 'sazon'],
  barbacoa: ['comida', 'capulhuac', 'consome', 'antojitos', 'carne', 'restaurante'],
  antojitos: ['comida', 'tacos', 'quesadillas', 'cocina', 'garnachas'],

  // Música y Entretenimiento
  mariachi: ['musica', 'serenata', 'canciones', 'trio', 'banda', 'fiesta', 'musicos', 'grupo'],
  mariachis: ['musica', 'serenatas', 'trios', 'bandas', 'musicos', 'grupos'],
  musica: ['mariachi', 'banda', 'trio', 'sonido', 'grupo musical'],

  // Mecánica y Automotriz
  mecanico: ['taller', 'auto', 'carro', 'frenos', 'afinacion', 'suspension', 'motor', 'automotriz'],
  mecanicos: ['taller', 'talleres', 'autos', 'carros', 'automotriz'],
  taller: ['mecanico', 'auto', 'carro', 'reparacion', 'afinacion', 'frenos', 'servicio automotriz'],
  talleres: ['mecanicos', 'autos', 'reparaciones']
};

// Expande los términos de búsqueda con sinónimos semánticos
export function expandQueryTerms(rawQuery: string): string[] {
  const normalized = normalizeText(rawQuery);
  const words = normalized.split(/\s+/).filter(w => w.length > 1);
  const termsSet = new Set<string>();

  words.forEach(w => {
    termsSet.add(w);
    // Buscar en el diccionario de sinónimos
    if (SYNONYM_MAP[w]) {
      SYNONYM_MAP[w].forEach(syn => termsSet.add(syn));
    }
    // Si la palabra contiene parte de un sinónimo (ej. 'hospitalario' -> 'hospital')
    Object.keys(SYNONYM_MAP).forEach(key => {
      if (w.includes(key) || key.includes(w)) {
        termsSet.add(key);
        SYNONYM_MAP[key].forEach(syn => termsSet.add(syn));
      }
    });
  });

  return Array.from(termsSet);
}

// Evalúa si un negocio coincide con la búsqueda (Fuzzy / Semántica)
export function matchBusinessSearch(
  business: Business,
  rawQuery: string,
  categoriesMap: Map<string, Category>
): boolean {
  if (!rawQuery.trim()) return true;

  const queryTerms = expandQueryTerms(rawQuery);
  const category = business.category_id ? categoriesMap.get(business.category_id) : undefined;

  // Construir el corpus de texto del negocio
  const corpusParts = [
    business.name,
    business.description || '',
    business.municipality,
    business.locality || '',
    business.address,
    category?.name || '',
    category?.description || ''
  ];

  // Agregar información de los doctores / staff si existen
  if (business.staff && business.staff.length > 0) {
    business.staff.forEach(s => {
      corpusParts.push(s.name);
      corpusParts.push(s.specialty);
      if (s.license_number) corpusParts.push(s.license_number);
    });
  }

  const normalizedCorpus = normalizeText(corpusParts.join(' '));

  // Si cualquiera de los términos expandidos coincide en el corpus
  return queryTerms.some(term => normalizedCorpus.includes(term));
}
