import { describe, it, expect, beforeEach } from 'vitest';
import { adminService } from '../services/adminService';

describe('Admin Service Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should verify the correct master PIN', () => {
    const pin = adminService.getMasterPin();
    expect(pin).toBeDefined();
    expect(adminService.verifyMasterPin(pin)).toBe(true);
    expect(adminService.verifyMasterPin('pin-incorrecto-123')).toBe(false);
    expect(adminService.verifyMasterPin('')).toBe(false);
  });

  it('should recognize the initial superadmin by default phone', () => {
    // 7141087330 is the default initial phone
    expect(adminService.isAdminPhone('7141087330')).toBe(true);
    expect(adminService.isAdminPhone('(714) 108-7330')).toBe(true);
    expect(adminService.isAdmin('7141087330')).toBe(true);
    expect(adminService.isSuperAdmin('7141087330')).toBe(true);
  });

  it('should allow adding a new admin role and check permissions', () => {
    const newAdmin = adminService.addAdmin({
      name: 'Moderador Prueba',
      email: 'moderador@profzone.com',
      role: 'moderator'
    });

    expect(newAdmin).toBeDefined();
    expect(newAdmin.role).toBe('moderator');
    expect(adminService.isAdmin(undefined, 'moderador@profzone.com')).toBe(true);
    expect(adminService.isSuperAdmin(undefined, 'moderador@profzone.com')).toBe(false);
  });

  it('should allow revoking an admin', () => {
    const newAdmin = adminService.addAdmin({
      name: 'Editor Temporal',
      email: 'editor@profzone.com',
      role: 'editor'
    });

    expect(adminService.isAdmin(undefined, 'editor@profzone.com')).toBe(true);
    adminService.removeAdmin(newAdmin.id);
    expect(adminService.isAdmin(undefined, 'editor@profzone.com')).toBe(false);
  });
});
