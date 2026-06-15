'use client';

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Precisión - Cruz de puntero con círculo de enfoque
export const PrecisionIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" strokeDasharray="4 2" />
    <circle cx="12" cy="12" r="8" strokeOpacity="0.3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

// Velocidad - Rayo estilizado con líneas de movimiento
export const SpeedIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2L4.09 12.11a2.5 2.5 0 0 0 2.02 4.02L11 16.5" strokeOpacity="0.6" />
    <path d="M13 2l-1.09 7.26a2 2 0 0 0 1.55 2.23L17 12.5" />
    <path d="M13 2l6.36 8.64a2.5 2.5 0 0 1-1.77 4.36L15 15" />
    <path d="M17 12.5l-3.5 3.5" />
    <path d="M15 15l-2 6" strokeWidth="2" />
  </svg>
);

// Calidad - Círculo de certificación con estrella
export const QualityIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L14.5 8.5H21.5L16 12.5L18.5 19L12 15L5.5 19L8 12.5L2.5 8.5H9.5L12 2Z" fill="none" />
    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M12 4v2M12 18v2M4 12h2M18 12h2" strokeOpacity="0.5" />
  </svg>
);

// Seguridad - Escudo con huella/lock estilizado
export const SecurityIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="11" r="4.5" strokeOpacity="0.3" strokeDasharray="2 2" />
  </svg>
);
