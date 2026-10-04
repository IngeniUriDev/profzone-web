import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { securityService } from '../../utils/security';

interface SimpleCaptchaProps {
  onVerify: (isValid: boolean) => void;
  onHoneypotTriggered?: () => void;
}

export const SimpleCaptcha: React.FC<SimpleCaptchaProps> = ({ onVerify, onHoneypotTriggered }) => {
  const [challenge, setChallenge] = useState<{ question: string; answer: number }>({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [honeypotValue, setHoneypotValue] = useState('');
  const [isAnswerValid, setIsAnswerValid] = useState(false);

  const refreshCaptcha = () => {
    const newChallenge = securityService.generateCaptchaChallenge();
    setChallenge(newChallenge);
    setUserAnswer('');
    setIsAnswerValid(false);
    onVerify(false);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleInputChange = (val: string) => {
    setUserAnswer(val);
    const parsed = parseInt(val.trim(), 10);
    const valid = !isNaN(parsed) && parsed === challenge.answer && honeypotValue === '';
    setIsAnswerValid(valid);
    onVerify(valid);
  };

  const handleHoneypotChange = (val: string) => {
    setHoneypotValue(val);
    // Si el honeypot tiene contenido, es un bot
    setIsAnswerValid(false);
    onVerify(false);
    if (onHoneypotTriggered) {
      onHoneypotTriggered();
    }
  };

  return (
    <div style={{
      background: 'var(--surface-secondary)',
      border: `1px solid ${isAnswerValid ? '#10b981' : 'var(--border)'}`,
      borderRadius: '10px',
      padding: '12px 14px',
      marginTop: '8px',
      transition: 'border-color 0.2s ease'
    }}>
      {/* Honeypot Invisible para atrapar bots automatizados */}
      <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label htmlFor="website_url_hp">Por favor no llenes este campo</label>
        <input
          id="website_url_hp"
          type="text"
          name="website_url_hp"
          value={honeypotValue}
          onChange={(e) => handleHoneypotChange(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
          <ShieldCheck size={16} color={isAnswerValid ? '#10b981' : 'var(--primary)'} />
          <span>Verificación Anti-Bot (Captcha)</span>
        </div>
        <button
          type="button"
          onClick={refreshCaptcha}
          title="Cambiar desafío"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <RefreshCw size={13} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '6px 10px',
          fontSize: '0.86rem',
          fontWeight: 800,
          color: 'var(--primary)',
          letterSpacing: '0.03em',
          userSelect: 'none'
        }}>
          {challenge.question || 'Cargando...'}
        </div>

        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Resultado..."
          value={userAnswer}
          onChange={(e) => handleInputChange(e.target.value)}
          style={{
            width: '100px',
            padding: '6px 10px',
            borderRadius: '6px',
            border: `1px solid ${isAnswerValid ? '#10b981' : '#cbd5e1'}`,
            fontSize: '0.86rem',
            textAlign: 'center',
            fontWeight: 700,
            outline: 'none'
          }}
        />

        {isAnswerValid && (
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>
            ✓ Verificado
          </span>
        )}
      </div>
    </div>
  );
};
