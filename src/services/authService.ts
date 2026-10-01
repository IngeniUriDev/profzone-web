import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile } from '../types/database';
import { adminService } from './adminService';

const USER_SESSION_KEY = 'profzone_user_session';

export const authService = {
  getCurrentUser(): UserProfile | null {
    const stored = localStorage.getItem(USER_SESSION_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  async signInWithFacebook(): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    }

    // Modo demostración o persistencia de sesión inmediata
    const demoUser: UserProfile = {
      id: `fb-${Date.now()}`,
      provider: 'facebook',
      full_name: 'Usuario Facebook Verificado',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'user'
    };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(demoUser));
    return demoUser;
  },

  async sendPhoneOtp(phoneNumber: string): Promise<boolean> {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+52${cleanPhone}`
      });
      if (error) {
        console.error('Error enviando SMS con Supabase:', error);
        throw error;
      }
    }
    // En modo demo o esperando confirmación
    return true;
  },

  async verifyPhoneOtp(phoneNumber: string, code: string, name?: string): Promise<UserProfile> {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const isAdmin = adminService.isAdminPhone(cleanPhone);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+52${cleanPhone}`,
        token: code,
        type: 'sms'
      });
      if (error) {
        console.error('Error verificando código SMS:', error);
        throw error;
      }
      const user: UserProfile = {
        id: data.user?.id || `phone-${cleanPhone}`,
        provider: 'phone',
        full_name: name || (isAdmin ? `Administrador (${cleanPhone.slice(-4)})` : `Vecino (${cleanPhone.slice(-4)})`),
        phone: cleanPhone,
        role: isAdmin ? 'admin' : 'user'
      };
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      return user;
    }

    // Modo local / demo
    const user: UserProfile = {
      id: `phone-${cleanPhone}`,
      provider: 'phone',
      full_name: name || (isAdmin ? `Administrador (${cleanPhone.slice(-4)})` : `Usuario Celular (${cleanPhone.slice(-4)})`),
      phone: cleanPhone,
      role: isAdmin ? 'admin' : 'user'
    };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async signInWithAdminPin(pin: string, adminName?: string): Promise<UserProfile> {
    if (!adminService.verifyMasterPin(pin)) {
      throw new Error('Clave de administrador incorrecta');
    }
    const adminUser: UserProfile = {
      id: `admin-master-${Date.now()}`,
      provider: 'phone',
      full_name: adminName?.trim() || 'Superadministrador',
      role: 'admin'
    };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(adminUser));
    return adminUser;
  },

  signOut(): void {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(console.error);
    }
    localStorage.removeItem(USER_SESSION_KEY);
  },

  claimAdminWithPin(pin: string): UserProfile {
    if (!adminService.verifyMasterPin(pin)) {
      throw new Error('Clave maestra incorrecta');
    }
    const current = this.getCurrentUser();
    if (!current) {
      throw new Error('No hay sesión activa');
    }
    const updated: UserProfile = {
      ...current,
      role: 'admin'
    };
    if (current.email) {
      adminService.addAdmin(current.phone || '', current.full_name, current.email);
    } else if (current.phone) {
      adminService.addAdmin(current.phone, current.full_name);
    }
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updated));
    return updated;
  },

  mapSupabaseUser(sbUser: { id: string; email?: string; phone?: string; user_metadata?: Record<string, any>; app_metadata?: Record<string, any> }): UserProfile {
    const meta = sbUser.user_metadata || {};
    const email = sbUser.email || meta.email || '';
    const rawPhone = sbUser.phone || meta.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '').replace(/^52/, '');
    const fullName = meta.full_name || meta.name || (email ? email.split('@')[0] : '') || (cleanPhone ? `Usuario (${cleanPhone.slice(-4)})` : 'Usuario Facebook');

    // Extraer avatar de Facebook (soporta string de Supabase y objeto Graph API)
    let avatarUrl: string | undefined = undefined;
    if (typeof meta.avatar_url === 'string') {
      avatarUrl = meta.avatar_url;
    } else if (typeof meta.picture === 'string') {
      avatarUrl = meta.picture;
    } else if (meta.picture?.data?.url && typeof meta.picture.data.url === 'string') {
      avatarUrl = meta.picture.data.url;
    } else if (typeof meta.picture_url === 'string') {
      avatarUrl = meta.picture_url;
    }

    const isAdmin = adminService.isAdmin(cleanPhone, email);

    const profile: UserProfile = {
      id: sbUser.id,
      provider: sbUser.app_metadata?.provider === 'facebook' ? 'facebook' : 'phone',
      full_name: fullName,
      email: email || undefined,
      phone: cleanPhone || undefined,
      avatar_url: avatarUrl,
      role: isAdmin ? 'admin' : 'user'
    };

    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile));
    return profile;
  }
};
