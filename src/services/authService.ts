import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile } from '../types/database';

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
        full_name: name || `Vecino (${cleanPhone.slice(-4)})`,
        phone: cleanPhone,
        role: 'user'
      };
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      return user;
    }

    // Modo local / demo
    const user: UserProfile = {
      id: `phone-${cleanPhone}`,
      provider: 'phone',
      full_name: name || `Usuario Celular (${cleanPhone.slice(-4)})`,
      phone: cleanPhone,
      role: 'user'
    };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    return user;
  },

  signOut(): void {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(console.error);
    }
    localStorage.removeItem(USER_SESSION_KEY);
  }
};
