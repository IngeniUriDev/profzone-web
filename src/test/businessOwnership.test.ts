import { describe, it, expect, beforeEach } from 'vitest';
import { isBusinessOwner } from '../utils/ownership';
import { businessService } from '../services/businessService';
import type { Business, UserProfile } from '../types/database';

describe('Business Ownership & Authorization Tests', () => {
  const adminUser: UserProfile = {
    id: 'admin-uuid-001',
    full_name: 'Super Admin',
    email: 'admin@profzone.com',
    role: 'admin',
    provider: 'phone'
  };

  const userAlice: UserProfile = {
    id: 'user-alice-123',
    full_name: 'Alice Mendoza',
    email: 'alice@example.com',
    phone: '7221234567',
    role: 'user',
    provider: 'google'
  };

  const userBob: UserProfile = {
    id: 'user-bob-456',
    full_name: 'Bob Ramírez',
    email: 'bob@example.com',
    phone: '7229876543',
    role: 'user',
    provider: 'facebook'
  };

  const userSimilarName: UserProfile = {
    id: 'user-charlie-789',
    full_name: 'Alice',
    email: 'charlie@example.com',
    role: 'user',
    provider: 'google'
  };

  const baseBusiness: Business = {
    id: 'biz-test-01',
    name: 'Consultorio Dental Santa Fe',
    municipality: 'Santiago Tianguistenco',
    address: 'Av. Juárez 10',
    rating_avg: 5.0,
    rating_count: 1,
    status: 'approved',
    submitted_by: 'user-alice-123'
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('isBusinessOwner function', () => {
    it('allows admin to edit any business regardless of submitted_by', () => {
      expect(isBusinessOwner(baseBusiness, adminUser)).toBe(true);
      expect(isBusinessOwner({ ...baseBusiness, submitted_by: 'anyone-else' }, adminUser)).toBe(true);
      expect(isBusinessOwner({ ...baseBusiness, submitted_by: undefined }, adminUser)).toBe(true);
    });

    it('allows creator matching user.id to edit', () => {
      expect(isBusinessOwner(baseBusiness, userAlice)).toBe(true);
    });

    it('allows creator matching user.email (case-insensitive) to edit', () => {
      const bizByEmail: Business = {
        ...baseBusiness,
        submitted_by: 'ALICE@EXAMPLE.COM'
      };
      expect(isBusinessOwner(bizByEmail, userAlice)).toBe(true);
    });

    it('allows creator matching user.phone (clean digits) to edit', () => {
      const bizByPhone: Business = {
        ...baseBusiness,
        submitted_by: '(722) 123-4567'
      };
      expect(isBusinessOwner(bizByPhone, userAlice)).toBe(true);
    });

    it('allows creator matching user.full_name (exact match, case-insensitive) to edit', () => {
      const bizByName: Business = {
        ...baseBusiness,
        submitted_by: 'alice mendoza'
      };
      expect(isBusinessOwner(bizByName, userAlice)).toBe(true);
    });

    it('DENIES editing if user has only a substring of the creator name (prevents accidental access)', () => {
      const bizByName: Business = {
        ...baseBusiness,
        submitted_by: 'Alice Mendoza'
      };
      // userSimilarName is named "Alice", NOT "Alice Mendoza"
      expect(isBusinessOwner(bizByName, userSimilarName)).toBe(false);
    });

    it('DENIES editing to other regular users (Bob cannot edit Alice\'s business)', () => {
      expect(isBusinessOwner(baseBusiness, userBob)).toBe(false);
    });

    it('DENIES editing when user is not logged in / null', () => {
      expect(isBusinessOwner(baseBusiness, null)).toBe(false);
      expect(isBusinessOwner(baseBusiness, undefined)).toBe(false);
    });

    it('DENIES regular user if business has no submitted_by recorded', () => {
      const orphanBiz: Business = {
        ...baseBusiness,
        submitted_by: undefined
      };
      expect(isBusinessOwner(orphanBiz, userAlice)).toBe(false);
      expect(isBusinessOwner(orphanBiz, userBob)).toBe(false);
      // Admin should still be allowed
      expect(isBusinessOwner(orphanBiz, adminUser)).toBe(true);
    });
  });

  describe('businessService.updateBusiness ownership enforcement', () => {
    it('allows owner to update their own business in service layer', async () => {
      // Create business registered by Alice
      const created = await businessService.createBusiness({
        name: 'Pastelería de Alice',
        municipality: 'Santiago Tianguistenco',
        address: 'Calle Hidalgo #5',
        submitted_by: userAlice.id
      });

      expect(created.id).toBeDefined();

      // Alice updates her business
      await expect(
        businessService.updateBusiness(created.id, { name: 'Pastelería Gourmet de Alice' }, userAlice)
      ).resolves.not.toThrow();

      const all = await businessService.getAllBusinesses();
      const updated = all.find(b => b.id === created.id);
      expect(updated?.name).toBe('Pastelería Gourmet de Alice');
    });

    it('prevents another user from updating Alice\'s business in service layer', async () => {
      const created = await businessService.createBusiness({
        name: 'Boutique de Alice',
        municipality: 'Santiago Tianguistenco',
        address: 'Calle Morelos #8',
        submitted_by: userAlice.id
      });

      // Bob attempts to update Alice's business
      await expect(
        businessService.updateBusiness(created.id, { name: 'Hackeado por Bob' }, userBob)
      ).rejects.toThrow(/No tienes permisos para editar esta publicación/);
    });

    it('allows admin to update any business in service layer', async () => {
      const created = await businessService.createBusiness({
        name: 'Taller Mecánico',
        municipality: 'Santiago Tianguistenco',
        address: 'Carretera Federal #1',
        submitted_by: userAlice.id
      });

      // Admin updates it
      await expect(
        businessService.updateBusiness(created.id, { name: 'Taller Mecánico Certificado' }, adminUser)
      ).resolves.not.toThrow();

      const all = await businessService.getAllBusinesses();
      const updated = all.find(b => b.id === created.id);
      expect(updated?.name).toBe('Taller Mecánico Certificado');
    });
  });
});
