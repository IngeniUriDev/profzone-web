import type { Business, UserProfile } from '../types/database';

const MY_BUSINESSES_KEY = 'profzone_my_businesses_v1';

/**
 * Obtiene los IDs de negocios creados o vinculados en este navegador/dispositivo.
 */
export function getMyStoredBusinessIds(): string[] {
  try {
    const raw = localStorage.getItem(MY_BUSINESSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Registra un ID de negocio como de propiedad del usuario actual.
 */
export function addMyStoredBusinessId(id: string): void {
  try {
    const list = getMyStoredBusinessIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(MY_BUSINESSES_KEY, JSON.stringify(list));
    }
  } catch (err) {
    console.warn('Error al guardar negocio propio en localStorage:', err);
  }
}

/**
 * Vincula negocios buscando coincidencia por teléfono o WhatsApp.
 */
export function linkBusinessesByPhone(phone: string, businesses: Business[]): number {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 7) return 0;

  let linkedCount = 0;
  for (const b of businesses) {
    const bPhone = b.phone ? b.phone.replace(/\D/g, '') : '';
    const bWa = b.whatsapp ? b.whatsapp.replace(/\D/g, '') : '';
    const bSub = b.submitted_by ? b.submitted_by.replace(/\D/g, '') : '';

    if (bPhone.includes(cleanPhone) || cleanPhone.includes(bPhone) ||
        bWa.includes(cleanPhone) || cleanPhone.includes(bWa) ||
        bSub.includes(cleanPhone)) {
      addMyStoredBusinessId(b.id);
      linkedCount++;
    }
  }
  return linkedCount;
}

/**
 * Verifica de manera segura y exhaustiva si un usuario tiene permisos de edición sobre un negocio.
 * 
 * Reglas de negocio:
 * 1. Administradores (role === 'admin'): Pueden editar cualquier negocio.
 * 2. Creador registrado por ID (Supabase Auth ID): Coincide con submitted_by.
 * 3. Teléfono de contacto / WhatsApp: Si el teléfono del usuario coincide con el teléfono
 *    o WhatsApp del propio negocio o de submitted_by.
 * 4. Teléfono superadmin principal (7141087330): Tiene permisos plenos.
 * 5. Correo electrónico: Si el correo del usuario coincide con submitted_by.
 * 6. Nombre completo: Coincidencia con submitted_by.
 * 7. Negocios creados en el dispositivo/navegador actual (localStorage).
 */
export function isBusinessOwner(
  business: Business | null | undefined,
  user: UserProfile | null | undefined
): boolean {
  if (!business) return false;

  // 1. El administrador tiene permiso irrestricto de edición y moderación
  if (user && user.role === 'admin') {
    return true;
  }

  // 2. Si el negocio fue registrado o vinculado en este dispositivo/navegador
  if (business.id && getMyStoredBusinessIds().includes(business.id)) {
    return true;
  }

  if (!user) return false;

  const cleanUserPhone = user.phone ? user.phone.replace(/\D/g, '') : '';

  // 3. Superadministrador principal por teléfono reconocido
  if (cleanUserPhone && (cleanUserPhone === '7141087330' || cleanUserPhone.endsWith('7141087330'))) {
    return true;
  }

  // 4. Coincidencia por teléfono o WhatsApp del negocio con el del usuario conectado
  if (cleanUserPhone && cleanUserPhone.length >= 7) {
    const cleanBizPhone = business.phone ? business.phone.replace(/\D/g, '') : '';
    const cleanBizWhatsapp = business.whatsapp ? business.whatsapp.replace(/\D/g, '') : '';

    if (cleanBizPhone && (cleanBizPhone === cleanUserPhone || cleanBizPhone.endsWith(cleanUserPhone) || cleanUserPhone.endsWith(cleanBizPhone))) {
      return true;
    }
    if (cleanBizWhatsapp && (cleanBizWhatsapp === cleanUserPhone || cleanBizWhatsapp.endsWith(cleanUserPhone) || cleanUserPhone.endsWith(cleanBizWhatsapp))) {
      return true;
    }
  }

  // 5. Verificación por submitted_by
  if (business.submitted_by) {
    const submitted = business.submitted_by.trim();

    // 5a. Coincidencia por ID de usuario
    if (user.id && submitted === user.id.trim()) {
      return true;
    }

    // 5b. Coincidencia por Correo Electrónico
    if (user.email && user.email.trim() && submitted.toLowerCase() === user.email.trim().toLowerCase()) {
      return true;
    }

    // 5c. Coincidencia por Teléfono en submitted_by
    if (cleanUserPhone) {
      const cleanSubmitted = submitted.replace(/\D/g, '');
      if (cleanSubmitted && (cleanSubmitted === cleanUserPhone || cleanSubmitted.includes(cleanUserPhone) || cleanUserPhone.includes(cleanSubmitted))) {
        return true;
      }
    }

    // 5d. Coincidencia por Nombre Completo (exacto)
    if (user.full_name && user.full_name.trim()) {
      const uName = user.full_name.trim().toLowerCase();
      const sName = submitted.toLowerCase();
      if (uName === sName) {
        return true;
      }
    }
  }

  // 6. Negocio RoliCode oficial atribuido a la cuenta de administración
  if (business.name && business.name.toLowerCase().includes('rolicode')) {
    if (cleanUserPhone === '7141087330' || user.id === '994a4b45-4beb-4f25-a41a-40922909d547') {
      return true;
    }
  }

  return false;
}
