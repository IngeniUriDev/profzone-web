export interface AdminUser {
  id: string;
  phone?: string;
  email?: string;
  name: string;
  added_at: string;
  is_superadmin?: boolean;
}

const ADMIN_STORAGE_KEY = 'profzone_admin_whitelist_v1';

// Clave o PIN maestro de Superadministrador (configurable también por VITE_ADMIN_PIN en .env o Vercel)
const MASTER_PIN = import.meta.env.VITE_ADMIN_PIN || 'admin2026';

// Celular o Email inicial por defecto
const INITIAL_SUPERADMIN_PHONE = import.meta.env.VITE_SUPERADMIN_PHONE || '7131234567';
const INITIAL_SUPERADMIN_EMAIL = import.meta.env.VITE_SUPERADMIN_EMAIL || '';

function getStoredAdmins(): AdminUser[] {
  const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!stored) {
    const defaultList: AdminUser[] = [
      {
        id: 'superadmin-1',
        phone: INITIAL_SUPERADMIN_PHONE,
        email: INITIAL_SUPERADMIN_EMAIL,
        name: 'Superadministrador (RoliCode)',
        added_at: new Date().toISOString(),
        is_superadmin: true
      }
    ];
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(defaultList));
    return defaultList;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveAdmins(admins: AdminUser[]): void {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admins));
}

export const adminService = {
  getMasterPin(): string {
    return MASTER_PIN;
  },

  verifyMasterPin(pin: string): boolean {
    return pin.trim() === MASTER_PIN;
  },

  isAdminPhone(phoneNumber: string): boolean {
    const clean = phoneNumber.replace(/\D/g, '');
    if (!clean) return false;
    const list = getStoredAdmins();
    return list.some(a => a.phone && a.phone.replace(/\D/g, '') === clean);
  },

  isAdminEmail(email: string): boolean {
    const clean = email.toLowerCase().trim();
    if (!clean) return false;
    if (INITIAL_SUPERADMIN_EMAIL && clean === INITIAL_SUPERADMIN_EMAIL.toLowerCase().trim()) return true;
    const list = getStoredAdmins();
    return list.some(a => a.email && a.email.toLowerCase().trim() === clean);
  },

  isAdmin(phone?: string, email?: string): boolean {
    if (phone && this.isAdminPhone(phone)) return true;
    if (email && this.isAdminEmail(email)) return true;
    return false;
  },

  getAdmins(): AdminUser[] {
    return getStoredAdmins();
  },

  addAdmin(phone: string, name: string): AdminUser {
    const clean = phone.replace(/\D/g, '');
    const list = getStoredAdmins();
    const existing = list.find(a => a.phone && a.phone.replace(/\D/g, '') === clean);
    if (existing) {
      return existing;
    }
    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      phone: clean,
      name: name.trim() || `Admin (${clean.slice(-4)})`,
      added_at: new Date().toISOString(),
      is_superadmin: false
    };
    list.push(newAdmin);
    saveAdmins(list);
    return newAdmin;
  },

  removeAdmin(id: string): void {
    let list = getStoredAdmins();
    // Protege al superadministrador principal de ser borrado
    list = list.filter(a => a.id !== id || a.is_superadmin);
    saveAdmins(list);
  }
};
