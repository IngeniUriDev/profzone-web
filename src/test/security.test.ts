import { describe, it, expect, beforeEach } from 'vitest';
import { securityService } from '../utils/security';

describe('securityService - Rate Limiting & Anti-Bot', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe iniciar sin bloqueo y con 3 intentos disponibles', () => {
    const state = securityService.getPinLockoutState();
    expect(state.isLocked).toBe(false);
    expect(state.remainingAttempts).toBe(3);
    expect(state.remainingSeconds).toBe(0);
  });

  it('debe descontar intentos tras fallos consecutivos', () => {
    const after1 = securityService.recordFailedPinAttempt();
    expect(after1.isLocked).toBe(false);
    expect(after1.remainingAttempts).toBe(2);

    const after2 = securityService.recordFailedPinAttempt();
    expect(after2.isLocked).toBe(false);
    expect(after2.remainingAttempts).toBe(1);
  });

  it('debe bloquear durante 5 minutos (300 segundos) al tercer fallo', () => {
    securityService.recordFailedPinAttempt();
    securityService.recordFailedPinAttempt();
    const after3 = securityService.recordFailedPinAttempt();

    expect(after3.isLocked).toBe(true);
    expect(after3.remainingAttempts).toBe(0);
    expect(after3.remainingSeconds).toBeGreaterThan(290);
    expect(after3.remainingSeconds).toBeLessThanOrEqual(300);
  });

  it('debe formatear los segundos a mm:ss correctamente', () => {
    expect(securityService.formatSeconds(300)).toBe('05:00');
    expect(securityService.formatSeconds(75)).toBe('01:15');
    expect(securityService.formatSeconds(9)).toBe('00:09');
    expect(securityService.formatSeconds(0)).toBe('00:00');
  });

  it('debe limpiar los intentos al resetear tras éxito', () => {
    securityService.recordFailedPinAttempt();
    securityService.recordFailedPinAttempt();
    securityService.resetPinAttempts();

    const cleanState = securityService.getPinLockoutState();
    expect(cleanState.isLocked).toBe(false);
    expect(cleanState.remainingAttempts).toBe(3);
  });

  it('debe generar retos de Captcha con preguntas y respuestas válidas', () => {
    const challenge = securityService.generateCaptchaChallenge();
    expect(challenge.question).toContain('¿Cuánto es');
    expect(challenge.answer).toBeGreaterThanOrEqual(2);
    expect(challenge.answer).toBeLessThanOrEqual(18);
  });
});
