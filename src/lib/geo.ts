import type { Municipality } from '../types/database';

export const REGIONAL_MUNICIPALITIES: Municipality[] = [
  { id: 'muni-tianguistenco', name: 'Santiago Tianguistenco', lat: 19.1797, lng: -99.4678 },
  { id: 'muni-capulhuac', name: 'Capulhuac', lat: 19.1969, lng: -99.4664 },
  { id: 'muni-xalatlaco', name: 'Xalatlaco', lat: 19.1803, lng: -99.4183 },
  { id: 'muni-ocoyoacac', name: 'Ocoyoacac', lat: 19.2731, lng: -99.4628 },
  { id: 'muni-almoloya', name: 'Almoloya del Río', lat: 19.1578, lng: -99.4883 },
  { id: 'muni-atizapan', name: 'Santa Cruz Atizapán', lat: 19.1739, lng: -99.5000 },
  { id: 'muni-texcalyacac', name: 'Texcalyacac', lat: 19.1333, lng: -99.4975 },
  { id: 'muni-rayon', name: 'Rayón', lat: 19.1469, lng: -99.5794 },
  { id: 'muni-metepec', name: 'Metepec', lat: 19.2558, lng: -99.6050 }
];

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}
