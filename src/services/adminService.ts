export type AdminRole = 'superadmin' | 'moderator' | 'editor';

export interface AdminUser {
  id: string;
  phone?: string;
  email?: string;
  name: string;
  role: AdminRole;
  added_at: string;
  is_superadmin?: boolean;
  assigned_by?: string;
}

const ADMIN_STORAGE_KEY = 'profzone_admin_whitelist_v1';

// Clave o PIN maestro de Superadministrador (configurable también por VITE_ADMIN_PIN en .env o Vercel)
const MASTER_PIN = import.meta.env.VITE_ADMIN_PIN || 'Ipoduri5s';

// Celular o Email inicial por defecto del Superadministrador Principal
const INITIAL_SUPERADMIN_PHONE = import.meta.env.VITE_SUPERADMIN_PHONE || '7141087330';
const INITIAL_SUPERADMIN_EMAIL = import.meta.env.VITE_SUPERADMIN_EMAIL || '';

function getStoredAdmins(): AdminUser[] {
  const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!stored) {
    const defaultList: AdminUser[] = [
      {
        id: 'superadmin-1',
        phone: INITIAL_SUPERADMIN_PHONE,
        email: INITIAL_SUPERADMIN_EMAIL,
        name: 'Superadministrador Principal (RoliCode)',
        role: 'superadmin',
        added_at: new Date().toISOString(),
        is_superadmin: true,
        assigned_by: 'Sistema'
      }
    ];
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(defaultList));
    return defaultList;
  }
  try {
    const list: AdminUser[] = JSON.parse(stored);
    // Asegurar que el superadmin inicial siempre esté en la lista con rol superadmin
    const initialClean = INITIAL_SUPERADMIN_PHONE.replace(/\D/g, '');
    const found = list.find(a => a.phone && a.phone.replace(/\D/g, '') === initialClean);
    if (!found) {
      list.unshift({
        id: 'superadmin-1',
        phone: INITIAL_SUPERADMIN_PHONE,
        email: INITIAL_SUPERADMIN_EMAIL,
        name: 'Superadministrador Principal (RoliCode)',
        role: 'superadmin',
        added_at: new Date().toISOString(),
        is_superadmin: true,
        assigned_by: 'Sistema'
      });
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(list));
    } else {
      found.is_superadmin = true;
      found.role = 'superadmin';
    }
    return list;
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
    const initialClean = INITIAL_SUPERADMIN_PHONE.replace(/\D/g, '');
    if (initialClean && clean === initialClean) return true;
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

  isSuperAdmin(phone?: string, email?: string): boolean {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    const initialClean = INITIAL_SUPERADMIN_PHONE.replace(/\D/g, '');
    if (cleanPhone && cleanPhone === initialClean) return true;
    if (email && INITIAL_SUPERADMIN_EMAIL && email.toLowerCase().trim() === INITIAL_SUPERADMIN_EMAIL.toLowerCase().trim()) return true;

    const list = getStoredAdmins();
    return list.some(a => 
      ((cleanPhone && a.phone && a.phone.replace(/\D/g, '') === cleanPhone) ||
       (email && a.email && a.email.toLowerCase().trim() === email.toLowerCase().trim())) &&
      (a.is_superadmin || a.role === 'superadmin')
    );
  },

  getAdminUser(phone?: string, email?: string): AdminUser | null {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const list = getStoredAdmins();
    return list.find(a => 
      (cleanPhone && a.phone && a.phone.replace(/\D/g, '') === cleanPhone) ||
      (cleanEmail && a.email && a.email.toLowerCase().trim() === cleanEmail)
    ) || null;
  },

  getAdmins(): AdminUser[] {
    return getStoredAdmins();
  },

  addAdmin(params: {
    name: string;
    phone?: string;
    email?: string;
    role?: AdminRole;
    assigned_by?: string;
  }): AdminUser {
    const clean = params.phone ? params.phone.replace(/\D/g, '') : '';
    const cleanEmail = params.email ? params.email.toLowerCase().trim() : '';
    const list = getStoredAdmins();

    const existing = list.find(a => 
      (clean && a.phone && a.phone.replace(/\D/g, '') === clean) ||
      (cleanEmail && a.email && a.email.toLowerCase().trim() === cleanEmail)
    );

    if (existing) {
      if (params.role) existing.role = params.role;
      if (params.name) existing.name = params.name;
      saveAdmins(list);
      return existing;
    }

    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      phone: clean || undefined,
      email: cleanEmail || undefined,
      name: params.name.trim() || (clean ? `Admin (${clean.slice(-4)})` : cleanEmail || 'Admin'),
      role: params.role || 'moderator',
      added_at: new Date().toISOString(),
      is_superadmin: params.role === 'superadmin',
      assigned_by: params.assigned_by || 'Superadministrador Principal'
    };
    list.push(newAdmin);
    saveAdmins(list);
    return newAdmin;
  },

  updateAdminRole(id: string, newRole: AdminRole): void {
    const list = getStoredAdmins();
    const admin = list.find(a => a.id === id);
    if (admin) {
      admin.role = newRole;
      admin.is_superadmin = newRole === 'superadmin';
      saveAdmins(list);
    }
  },

  removeAdmin(id: string): void {
    let list = getStoredAdmins();
    // Protege al superadministrador principal de ser borrado
    list = list.filter(a => a.id !== id || a.is_superadmin);
    saveAdmins(list);
  }
};
