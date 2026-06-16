'use client';

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// Icono Gratuito - Caja de regalo con moño
export const GiftIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="8" width="18" height="13" rx="2" stroke={color} strokeWidth="1.5"/>
    <path d="M12 8V21" stroke={color} strokeWidth="1.5"/>
    <path d="M12 8C12 8 9 6 9 4.5C9 3.12 10.12 2 11.5 2C12.88 2 14 3.12 14 4.5C14 6 12 8 12 8Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8C12 8 15 6 15 4.5C15 3.12 13.88 2 12.5 2C11.12 2 10 3.12 10 4.5C10 6 12 8 12 8Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 8V6C3 5.45 3.45 5 4 5H20C20.55 5 21 5.45 21 6V8" stroke={color} strokeWidth="1.5"/>
  </svg>
);

// Icono Estudiante - Gorro de graduación
export const StudentIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 4L2 9L12 14L22 9L12 4Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 9V14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M19 11V16C19 18.5 15.5 20 12 20C8.5 20 5 18.5 5 16V11" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M22 9V15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="9" r="2" fill={color} fillOpacity="0.3"/>
  </svg>
);

// Icono Inicial - Cohete despegando
export const StarterIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2C12 2 7 6 7 12V16L5 20L12 18L19 20L17 16V12C17 6 12 2 12 2Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.5"/>
    <path d="M12 18V22" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
    <path d="M9 15C9 15 8 16 8 17C8 18 9 19 9 19" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 15C15 15 16 16 16 17C16 18 15 19 15 19" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Icono Pro - Diana con flecha
export const ProIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="1.5" fill={color}/>
    <path d="M20 4L15 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 4L18 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 4L14 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Icono Empresa - Edificio corporativo
export const EnterpriseIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth="1.5"/>
    <rect x="7" y="8" width="4" height="4" rx="0.5" stroke={color} strokeWidth="1.5"/>
    <rect x="13" y="8" width="4" height="4" rx="0.5" stroke={color} strokeWidth="1.5"/>
    <rect x="7" y="14" width="4" height="4" rx="0.5" stroke={color} strokeWidth="1.5"/>
    <rect x="13" y="14" width="4" height="4" rx="0.5" stroke={color} strokeWidth="1.5"/>
    <path d="M4 20H20" stroke={color} strokeWidth="1.5"/>
    <path d="M1 22H23" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="4" r="1.5" fill={color}/>
  </svg>
);
