import type { Business, UserProfile } from '../types/database';

/**
 * Verifica estrictamente si un usuario tiene permisos de edición sobre un negocio.
 * Reglas de negocio:
 * 1. Los administradores (role === 'admin') pueden editar cualquier negocio.
 * 2. Un usuario regular solo puede editar el negocio si fue quien lo registró (submitted_by).
 * 3. La comprobación es estricta por:
 *    - ID de usuario (Supabase Auth ID / UUID)
 *    - Correo electrónico (exacto, sin importar mayúsculas/minúsculas)
 *    - Número de teléfono (comparando los dígitos numéricos limpios)
 *    - Nombre completo (coincidencia exacta sin espacios residuales e insensible a mayúsculas)
 * 4. Visitantes anónimos o usuarios no autorizados reciben 'false'.
 */
export function isBusinessOwner(
  business: Business | null | undefined,
  user: UserProfile | null | undefined
): boolean {
  if (!business || !user) return false;

  // 1. El administrador tiene permiso irrestricto de edición y moderación
  if (user.role === 'admin') {
    return true;
  }

  // 2. Si el negocio no tiene autor registrado, un usuario común no puede editarlo
  if (!business.submitted_by) {
    return false;
  }

  const submitted = business.submitted_by.trim();

  // 3. Coincidencia por ID de usuario
  if (user.id && submitted === user.id.trim()) {
    return true;
  }

  // 4. Coincidencia exacta por Correo Electrónico
  if (user.email && user.email.trim() && submitted.toLowerCase() === user.email.trim().toLowerCase()) {
    return true;
  }

  // 5. Coincidencia por Teléfono (comparando solo dígitos numéricos)
  if (user.phone) {
    const cleanUserPhone = user.phone.replace(/\D/g, '');
    const cleanSubmitted = submitted.replace(/\D/g, '');
    if (cleanUserPhone && cleanSubmitted && cleanUserPhone === cleanSubmitted) {
      return true;
    }
  }

  // 6. Coincidencia exacta por Nombre Completo (no subcadenas sueltas)
  if (user.full_name && user.full_name.trim()) {
    if (submitted.toLowerCase() === user.full_name.trim().toLowerCase()) {
      return true;
    }
  }

  return false;
}
