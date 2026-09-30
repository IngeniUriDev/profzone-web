export interface Sponsor {
  id: string;
  name: string;
  badge?: string;
  message: string;
  linkUrl?: string;
  ctaText?: string;
  active: boolean;
}

/**
 * Patrocinador oficial en ProfZone.
 * Para pausarlo o desactivarlo, simplemente cambia 'active: false' o asigna 'null'.
 */
export const CURRENT_SPONSOR: Sponsor | null = {
  id: 'sponsor-rolicode',
  name: 'RoliCode',
  badge: 'Patrocinador Oficial',
  message: 'Desarrollo web a la medida, aplicaciones y software para negocios en el Valle de Toluca y la región.',
  linkUrl: 'https://rolicode.com.mx',
  ctaText: 'Ver Soluciones',
  active: true
};
