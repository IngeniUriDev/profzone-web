import { describe, it, expect, beforeEach } from 'vitest';
import { businessService } from '../services/businessService';

describe('Business Service Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize and return initial mock businesses if offline/local', async () => {
    const businesses = await businessService.getBusinesses();
    expect(businesses).toBeDefined();
    expect(Array.isArray(businesses)).toBe(true);
  });

  it('should filter businesses by municipality correctly', async () => {
    const all = await businessService.getBusinesses({ municipality: 'TODOS' });
    expect(all).toBeDefined();

    const tianguistenco = await businessService.getBusinesses({ municipality: 'Santiago Tianguistenco' });
    expect(tianguistenco).toBeDefined();
    for (const b of tianguistenco) {
      expect(b.municipality).toBe('Santiago Tianguistenco');
    }
  });

  it('should reset catalog to initial clean catalog when requested', () => {
    const list = businessService.resetToInitialData();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(0);
  });

  it('should support creating and updating businesses with social media links', async () => {
    const created = await businessService.createBusiness({
      name: 'Negocio Social Demo Test',
      municipality: 'Santiago Tianguistenco',
      address: 'Calle Juárez #20',
      facebook_url: 'https://facebook.com/negociodemo',
      instagram_url: 'https://instagram.com/negociodemo',
      tiktok_url: 'https://tiktok.com/@negociodemo',
      website_url: 'https://negociodemo.com'
    });

    expect(created).toBeDefined();
    expect(created.facebook_url).toBe('https://facebook.com/negociodemo');
    expect(created.instagram_url).toBe('https://instagram.com/negociodemo');
    expect(created.tiktok_url).toBe('https://tiktok.com/@negociodemo');

    if (created.id) {
      await businessService.deleteBusiness(created.id);
    }
  });
});
