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
 * Patrocinador actual de ProfZone.
 * Si 'active' es false o no hay patrocinador, el banner en la parte superior no se mostrará.
 */
export const CURRENT_SPONSOR: Sponsor | null = {
  id: 'sponsor-1',
  name: 'RoliCode',
  badge: 'Espacio Publicitario',
  message: '¿Quieres anunciar tu negocio en el encabezado de ProfZone? Llega a miles de personas en la región.',
  linkUrl: 'https://wa.me/527131234567?text=Hola,%20me%20gustar%C3%ADa%20patrocinar%20en%20ProfZone',
  ctaText: 'Patrocinar aquí',
  active: true
};
