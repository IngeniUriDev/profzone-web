/**
 * Utilidades de seguridad, Rate Limiting y Protección Anti-Bot para ProfZone
 */

const PIN_ATTEMPTS_KEY = 'profzone_pin_failed_attempts';
const PIN_LOCKOUT_KEY = 'profzone_pin_lockout_timestamp';
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutos (300,000 ms)

export interface PinLockoutState {
  isLocked: boolean;
  remainingSeconds: number;
  remainingAttempts: number;
  lockoutEndTime: number | null;
}

export const securityService = {
  /**
   * Obtiene el estado actual del rate limiter para la clave de administrador
   */
  getPinLockoutState(): PinLockoutState {
    const lockoutStr = localStorage.getItem(PIN_LOCKOUT_KEY);
    const attemptsStr = localStorage.getItem(PIN_ATTEMPTS_KEY);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) || 0 : 0;

    if (lockoutStr) {
      const lockoutEndTime = parseInt(lockoutStr, 10);
      const now = Date.now();
      const diffMs = lockoutEndTime - now;

      if (diffMs > 0) {
        return {
          isLocked: true,
          remainingSeconds: Math.ceil(diffMs / 1000),
          remainingAttempts: 0,
          lockoutEndTime
        };
      } else {
        // El tiempo de bloqueo ya expiró: limpiamos el estado
        this.resetPinAttempts();
      }
    }

    return {
      isLocked: false,
      remainingSeconds: 0,
      remainingAttempts: Math.max(0, MAX_ATTEMPTS - attempts),
      lockoutEndTime: null
    };
  },

  /**
   * Registra un intento fallido de PIN.
   * Si llega a 3 intentos, activa el bloqueo de 5 minutos.
   */
  recordFailedPinAttempt(): PinLockoutState {
    const currentState = this.getPinLockoutState();
    if (currentState.isLocked) {
      return currentState;
    }

    const currentAttempts = (parseInt(localStorage.getItem(PIN_ATTEMPTS_KEY) || '0', 10) || 0) + 1;
    localStorage.setItem(PIN_ATTEMPTS_KEY, currentAttempts.toString());

    if (currentAttempts >= MAX_ATTEMPTS) {
      const lockoutEndTime = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(PIN_LOCKOUT_KEY, lockoutEndTime.toString());
      return {
        isLocked: true,
        remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
        remainingAttempts: 0,
        lockoutEndTime
      };
    }

    return {
      isLocked: false,
      remainingSeconds: 0,
      remainingAttempts: Math.max(0, MAX_ATTEMPTS - currentAttempts),
      lockoutEndTime: null
    };
  },

  /**
   * Limpia los intentos fallidos al ingresar la clave correctamente
   */
  resetPinAttempts(): void {
    localStorage.removeItem(PIN_ATTEMPTS_KEY);
    localStorage.removeItem(PIN_LOCKOUT_KEY);
  },

  /**
   * Formatea segundos a mm:ss (ej. 295 seg -> "04:55")
   */
  formatSeconds(totalSeconds: number): string {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Genera un desafío matemático sencillo anti-bot
   */
  generateCaptchaChallenge(): { question: string; answer: number } {
    const num1 = Math.floor(Math.random() * 9) + 1; // 1 - 9
    const num2 = Math.floor(Math.random() * 9) + 1; // 1 - 9
    return {
      question: `¿Cuánto es ${num1} + ${num2}?`,
      answer: num1 + num2
    };
  }
};
