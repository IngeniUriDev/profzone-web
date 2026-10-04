import { describe, it, expect, beforeEach, vi } from 'vitest';
import { businessService } from '../services/businessService';

vi.mock('../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false
}));

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

  it('should prevent duplicate registration if BOTH name and address match in same municipality', async () => {
    await businessService.createBusiness({
      name: 'Farmacia La Paz',
      municipality: 'Santiago Tianguistenco',
      address: 'Av. Hidalgo 10'
    });

    // Mismo nombre y misma dirección -> Debe arrojar error
    await expect(
      businessService.createBusiness({
        name: 'Farmacia La Paz',
        municipality: 'Santiago Tianguistenco',
        address: 'Av. Hidalgo 10'
      })
    ).rejects.toThrow(/ya se encuentra registrado con la dirección/);
  });

  it('should ALLOW registration if name is same but address is DIFFERENT (sucursales)', async () => {
    const sucursal1 = await businessService.createBusiness({
      name: 'OXXO Tianguistenco',
      municipality: 'Santiago Tianguistenco',
      address: 'Calle Morelos #100'
    });

    const sucursal2 = await businessService.createBusiness({
      name: 'OXXO Tianguistenco',
      municipality: 'Santiago Tianguistenco',
      address: 'Av. Juárez #450'
    });

    expect(sucursal1.id).toBeDefined();
    expect(sucursal2.id).toBeDefined();
    expect(sucursal1.id).not.toBe(sucursal2.id);

    const list = await businessService.getBusinesses({ municipality: 'Santiago Tianguistenco', status: 'pending' });
    const oxxos = list.filter(b => b.name === 'OXXO Tianguistenco');
    expect(oxxos.length).toBe(2);
  });

  it('should ALLOW registration if address is same but name is DIFFERENT (plazas/edificios)', async () => {
    const negocioA = await businessService.createBusiness({
      name: 'Consultorio Dental Sonrisas',
      municipality: 'Capulhuac',
      address: 'Plaza Central Local 4'
    });

    const negocioB = await businessService.createBusiness({
      name: 'Despacho Contable López',
      municipality: 'Capulhuac',
      address: 'Plaza Central Local 4'
    });

    expect(negocioA.id).toBeDefined();
    expect(negocioB.id).toBeDefined();

    const list = await businessService.getBusinesses({ municipality: 'Capulhuac', status: 'pending' });
    expect(list.some(b => b.name === 'Consultorio Dental Sonrisas')).toBe(true);
    expect(list.some(b => b.name === 'Despacho Contable López')).toBe(true);
  });
});
