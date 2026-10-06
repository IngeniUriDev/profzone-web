export type AdminRole = 'superadmin' | 'moderator' | 'editor';

export interface AdminUser {
  id: string;
  user_id?: string;
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
  const initialClean = INITIAL_SUPERADMIN_PHONE.replace(/\D/g, '');

  if (!stored) {
    const defaultList: AdminUser[] = [
      {
        id: 'superadmin-1',
        phone: INITIAL_SUPERADMIN_PHONE,
        email: INITIAL_SUPERADMIN_EMAIL || undefined,
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
    let list: AdminUser[] = JSON.parse(stored);
    if (!Array.isArray(list)) list = [];

    // Sanitizar: SOLO el superadmin raíz superadmin-1 tiene is_superadmin = true
    list = list.map(a => {
      const isRoot = Boolean(a.id === 'superadmin-1' || (initialClean && a.phone && a.phone.replace(/\D/g, '') === initialClean));
      return {
        ...a,
        is_superadmin: isRoot
      };
    });

    // Asegurar que el superadmin inicial siempre esté en la lista con rol superadmin
    const foundRoot = list.find(a => a.id === 'superadmin-1' || (a.phone && a.phone.replace(/\D/g, '') === initialClean));
    if (!foundRoot) {
      list.unshift({
        id: 'superadmin-1',
        phone: INITIAL_SUPERADMIN_PHONE,
        email: INITIAL_SUPERADMIN_EMAIL || undefined,
        name: 'Superadministrador Principal (RoliCode)',
        role: 'superadmin',
        added_at: new Date().toISOString(),
        is_superadmin: true,
        assigned_by: 'Sistema'
      });
    } else {
      foundRoot.is_superadmin = true;
      foundRoot.role = 'superadmin';
    }

    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(list));
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

  isAdmin(phone?: string, email?: string, userId?: string): boolean {
    if (phone && this.isAdminPhone(phone)) return true;
    if (email && this.isAdminEmail(email)) return true;
    if (userId) {
      const list = getStoredAdmins();
      if (list.some(a => a.user_id === userId || a.id === userId)) return true;
    }
    return false;
  },

  isSuperAdmin(phone?: string, email?: string, userId?: string): boolean {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    const initialClean = INITIAL_SUPERADMIN_PHONE.replace(/\D/g, '');
    if (cleanPhone && cleanPhone === initialClean) return true;
    if (email && INITIAL_SUPERADMIN_EMAIL && email.toLowerCase().trim() === INITIAL_SUPERADMIN_EMAIL.toLowerCase().trim()) return true;

    const list = getStoredAdmins();
    return list.some(a => 
      ((cleanPhone && a.phone && a.phone.replace(/\D/g, '') === cleanPhone) ||
       (email && a.email && a.email.toLowerCase().trim() === email.toLowerCase().trim()) ||
       (userId && (a.user_id === userId || a.id === userId))) &&
      (a.is_superadmin || a.role === 'superadmin')
    );
  },

  getAdminUser(phone?: string, email?: string, userId?: string): AdminUser | null {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const list = getStoredAdmins();
    return list.find(a => 
      (cleanPhone && a.phone && a.phone.replace(/\D/g, '') === cleanPhone) ||
      (cleanEmail && a.email && a.email.toLowerCase().trim() === cleanEmail) ||
      (userId && (a.user_id === userId || a.id === userId))
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
    user_id?: string;
  }): AdminUser {
    const clean = params.phone ? params.phone.replace(/\D/g, '') : '';
    const cleanEmail = params.email ? params.email.toLowerCase().trim() : '';
    const list = getStoredAdmins();

    // Deduplicación inteligente: coincidencia por teléfono, correo, user_id o nombre idéntico
    const existing = list.find(a => 
      (clean && a.phone && a.phone.replace(/\D/g, '') === clean) ||
      (cleanEmail && a.email && a.email.toLowerCase().trim() === cleanEmail) ||
      (params.user_id && a.user_id === params.user_id) ||
      (!clean && !cleanEmail && a.name.trim().toLowerCase() === params.name.trim().toLowerCase())
    );

    if (existing) {
      if (params.role) existing.role = params.role;
      if (params.name) existing.name = params.name;
      if (cleanEmail) existing.email = cleanEmail;
      if (clean) existing.phone = clean;
      if (params.user_id) existing.user_id = params.user_id;
      saveAdmins(list);
      return existing;
    }

    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      user_id: params.user_id,
      phone: clean || undefined,
      email: cleanEmail || undefined,
      name: params.name.trim() || (clean ? `Admin (${clean.slice(-4)})` : cleanEmail || 'Admin'),
      role: params.role || 'moderator',
      added_at: new Date().toISOString(),
      is_superadmin: false, // Solo el superadmin-1 del sistema es inmutable
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
      admin.is_superadmin = admin.id === 'superadmin-1';
      saveAdmins(list);
    }
  },

  removeAdmin(id: string): void {
    let list = getStoredAdmins();
    const initialClean = INITIAL_SUPERADMIN_PHONE.replace(/\D/g, '');
    // Protege EXCLUSIVAMENTE al superadministrador raíz del sistema
    list = list.filter(a => {
      const isRoot = a.id === 'superadmin-1' || (a.phone && a.phone.replace(/\D/g, '') === initialClean);
      if (isRoot) return true;
      return a.id !== id;
    });
    saveAdmins(list);
  },

  purgeDuplicateAdmins(currentUserId?: string, currentUserEmail?: string): AdminUser[] {
    const list = getStoredAdmins();
    const initialClean = INITIAL_SUPERADMIN_PHONE.replace(/\D/g, '');
    const cleanCurrentEmail = currentUserEmail ? currentUserEmail.toLowerCase().trim() : '';

    const cleaned: AdminUser[] = [];
    const seenEmails = new Set<string>();

    for (const a of list) {
      // 1. Conservar siempre al superadmin raíz del sistema
      const isRoot = a.id === 'superadmin-1' || (a.phone && a.phone.replace(/\D/g, '') === initialClean);
      if (isRoot) {
        cleaned.push(a);
        continue;
      }

      // 2. Si es el usuario activo actual con sesión, conservarlo
      if (
        (currentUserId && a.user_id === currentUserId) ||
        (cleanCurrentEmail && a.email && a.email.toLowerCase().trim() === cleanCurrentEmail)
      ) {
        if (cleanCurrentEmail) seenEmails.add(cleanCurrentEmail);
        cleaned.push(a);
        continue;
      }

      // 3. Descartar cuentas anónimas sin correo y sin teléfono (accesos fantasma / pruebas pasadas)
      if (!a.email && !a.phone) {
        continue;
      }

      // 4. Descartar duplicados por correo
      const emailKey = a.email ? a.email.toLowerCase().trim() : undefined;
      if (emailKey) {
        if (seenEmails.has(emailKey)) continue;
        seenEmails.add(emailKey);
        cleaned.push(a);
      } else if (a.phone) {
        cleaned.push(a);
      }
    }

    saveAdmins(cleaned);
    return cleaned;
  }
};
