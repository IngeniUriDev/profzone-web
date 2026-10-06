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

  it('should allow revoking a non-root superadmin', () => {
    const superAdmin = adminService.addAdmin({
      name: 'Admin Secundario',
      email: 'secundario@profzone.com',
      role: 'superadmin'
    });

    expect(adminService.isSuperAdmin(undefined, 'secundario@profzone.com')).toBe(true);
    adminService.removeAdmin(superAdmin.id);
    expect(adminService.isSuperAdmin(undefined, 'secundario@profzone.com')).toBe(false);
  });

  it('should purge duplicate or orphan admins without email or phone', () => {
    adminService.addAdmin({
      name: 'Usuario Google',
      role: 'superadmin'
    });
    adminService.addAdmin({
      name: 'Uriel Verificado',
      email: 'uriel@profzone.com',
      role: 'superadmin'
    });

    const purged = adminService.purgeDuplicateAdmins(undefined, 'uriel@profzone.com');
    // Root superadmin + valid admin kept, orphan Usuario Google removed
    expect(purged.some(a => a.name === 'Usuario Google')).toBe(false);
    expect(purged.some(a => a.email === 'uriel@profzone.com')).toBe(true);
    expect(purged.some(a => a.id === 'superadmin-1')).toBe(true);
  });
});
