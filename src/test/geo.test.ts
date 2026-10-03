import { describe, it, expect } from 'vitest';
import { calculateDistanceKm, REGIONAL_MUNICIPALITIES } from '../lib/geo';

describe('Geo & Distance Calculations', () => {
  it('should list all regional municipalities with valid coordinates', () => {
    expect(REGIONAL_MUNICIPALITIES.length).toBeGreaterThan(5);
    for (const muni of REGIONAL_MUNICIPALITIES) {
      expect(muni.id).toBeDefined();
      expect(muni.name.length).toBeGreaterThan(2);
      expect(muni.lat).toBeGreaterThan(18);
      expect(muni.lat).toBeLessThan(20);
      expect(muni.lng).toBeLessThan(-98);
      expect(muni.lng).toBeGreaterThan(-101);
    }
  });

  it('should calculate 0 km between identical coordinates', () => {
    const dist = calculateDistanceKm(19.1797, -99.4678, 19.1797, -99.4678);
    expect(dist).toBe(0);
  });

  it('should calculate accurate distance between Tianguistenco and Capulhuac', () => {
    // Santiago Tianguistenco (19.1797, -99.4678) to Capulhuac (19.1969, -99.4664)
    const dist = calculateDistanceKm(19.1797, -99.4678, 19.1969, -99.4664);
    expect(dist).toBeGreaterThan(1.5);
    expect(dist).toBeLessThan(2.5);
  });

  it('should satisfy symmetry: distance(A, B) equals distance(B, A)', () => {
    const dist1 = calculateDistanceKm(19.1797, -99.4678, 19.2558, -99.6050);
    const dist2 = calculateDistanceKm(19.2558, -99.6050, 19.1797, -99.4678);
    expect(dist1).toBe(dist2);
  });
});
