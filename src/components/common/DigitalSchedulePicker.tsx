import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sparkles } from 'lucide-react';

interface DigitalSchedulePickerProps {
  value: string;
  onChange: (schedule: string) => void;
}

const DAY_OPTIONS = [
  { key: 'lun', label: 'Lun', full: 'Lunes' },
  { key: 'mar', label: 'Mar', full: 'Martes' },
  { key: 'mie', label: 'Mié', full: 'Miércoles' },
  { key: 'jue', label: 'Jue', full: 'Jueves' },
  { key: 'vie', label: 'Vie', full: 'Viernes' },
  { key: 'sab', label: 'Sáb', full: 'Sábado' },
  { key: 'dom', label: 'Dom', full: 'Domingo' }
];

const PRESETS = [
  { label: 'Lun - Vie', days: ['lun', 'mar', 'mie', 'jue', 'vie'] },
  { label: 'Lun - Sáb', days: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab'] },
  { label: 'Toda la semana', days: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'] }
];

export const DigitalSchedulePicker: React.FC<DigitalSchedulePickerProps> = ({
  value,
  onChange
}) => {
  const [is24Hours, setIs24Hours] = useState<boolean>(() => {
    return value.toLowerCase().includes('24');
  });

  const [selectedDays, setSelectedDays] = useState<string[]>(() => {
    const v = value.toLowerCase();
    if (v.includes('lunes a viernes') || v.includes('lun - vie') || v.includes('lun-vie')) {
      return ['lun', 'mar', 'mie', 'jue', 'vie'];
    }
    if (v.includes('lunes a domingo') || v.includes('toda la semana') || v.includes('diario')) {
      return ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
    }
    // Default: Lun a Sáb
    return ['lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
  });

  const [openTime, setOpenTime] = useState<string>(() => {
    const match = value.match(/(\d{1,2}:\d{2})/);
    return match ? (match[1].length === 4 ? `0${match[1]}` : match[1]) : '09:00';
  });

  const [closeTime, setCloseTime] = useState<string>(() => {
    const matches = [...value.matchAll(/(\d{1,2}:\d{2})/g)];
    if (matches.length > 1) {
      const t = matches[1][1];
      return t.length === 4 ? `0${t}` : t;
    }
    return '19:00';
  });

  // Función para formatear a 12 horas (ej. 9:00 AM, 7:00 PM)
  const format12Hour = (timeStr: string) => {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // hora 0 es 12 AM
    return `${h}:${m} ${ampm}`;
  };

  // Construir texto de días
  const buildDaysLabel = (days: string[]): string => {
    if (days.length === 7) return 'Toda la semana';
    if (days.length === 5 && days.every(d => ['lun', 'mar', 'mie', 'jue', 'vie'].includes(d))) return 'Lun - Vie';
    if (days.length === 6 && days.every(d => ['lun', 'mar', 'mie', 'jue', 'vie', 'sab'].includes(d))) return 'Lun - Sáb';
    if (days.length === 2 && days.includes('sab') && days.includes('dom')) return 'Fines de semana';
    if (days.length === 0) return 'Sin días seleccionados';
    return days.map(d => DAY_OPTIONS.find(opt => opt.key === d)?.label || d).join(', ');
  };

  // Cada cambio sincroniza con onChange
  useEffect(() => {
    if (is24Hours) {
      onChange('Abierto 24 Horas');
      return;
    }

    const daysText = buildDaysLabel(selectedDays);
    const openFormatted = format12Hour(openTime);
    const closeFormatted = format12Hour(closeTime);

    if (selectedDays.length === 0) {
      onChange(`${openFormatted} a ${closeFormatted}`);
    } else {
      onChange(`${daysText}: ${openFormatted} a ${closeFormatted}`);
    }
  }, [is24Hours, selectedDays, openTime, closeTime, onChange]);

  const toggleDay = (key: string) => {
    if (selectedDays.includes(key)) {
      setSelectedDays(selectedDays.filter(d => d !== key));
    } else {
      setSelectedDays([...selectedDays, key]);
    }
  };

  const applyPreset = (presetDays: string[]) => {
    setIs24Hours(false);
    setSelectedDays(presetDays);
  };

  return (
    <div style={{
      background: 'var(--surface-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Encabezado con selector de 24 Horas */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
          <Clock size={16} color="var(--primary)" />
          <span>Configurar Horario de Atención</span>
        </div>

        <button
          type="button"
          onClick={() => setIs24Hours(!is24Hours)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '9999px',
            border: is24Hours ? '1px solid #16a34a' : '1px solid var(--border)',
            background: is24Hours ? '#dcfce7' : 'var(--surface)',
            color: is24Hours ? '#15803d' : 'var(--text-muted)',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Sparkles size={12} color={is24Hours ? '#16a34a' : '#94a3b8'} />
          <span>{is24Hours ? '✓ Abierto 24 Horas' : '¿Servicio 24 Horas?'}</span>
        </button>
      </div>

      {!is24Hours && (
        <>
          {/* Relojes Digitales: Apertura y Cierre */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            alignItems: 'center'
          }}>
            {/* Reloj de Apertura */}
            <div style={{
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              borderRadius: '10px',
              padding: '10px',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'border-color 0.2s'
            }}>
              <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Hora de Apertura
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    fontFamily: 'monospace, monospace',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    outline: 'none',
                    width: '120px'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                {format12Hour(openTime)}
              </span>
            </div>

            {/* Separador */}
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.9rem' }}>
              hasta
            </div>

            {/* Reloj de Cierre */}
            <div style={{
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              borderRadius: '10px',
              padding: '10px',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'border-color 0.2s'
            }}>
              <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Hora de Cierre
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    fontFamily: 'monospace, monospace',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    outline: 'none',
                    width: '120px'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                {format12Hour(closeTime)}
              </span>
            </div>
          </div>

          {/* Días de la semana */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} color="var(--primary)" />
                <span>Días de atención</span>
              </span>

              {/* Botones predefinidos rápidos */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {PRESETS.map((p) => {
                  const isActive = p.days.length === selectedDays.length && p.days.every(d => selectedDays.includes(d));
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p.days)}
                      style={{
                        padding: '2px 7px',
                        borderRadius: '6px',
                        border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                        background: isActive ? 'rgba(2, 132, 199, 0.15)' : 'var(--surface)',
                        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chips de Días */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {DAY_OPTIONS.map((d) => {
                const selected = selectedDays.includes(d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDay(d.key)}
                    style={{
                      padding: '6px 2px',
                      borderRadius: '8px',
                      border: selected ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: selected ? 'var(--primary)' : 'var(--surface)',
                      color: selected ? '#ffffff' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center'
                    }}
                    title={d.full}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Vista previa del horario resultante */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem'
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
          Horario resultante:
        </span>
        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
          {value || 'Sin horario'}
        </span>
      </div>
    </div>
  );
};
