'use client';

import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

// Icono para PDF
export function PdfIcon({ size = 24, color = '#EF4444', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="8" y="4" width="48" height="56" rx="4" stroke={color} strokeWidth="2.5" fill="none" />
      <path d="M20 12H32" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M20 18H44" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M20 24H44" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M20 30H36" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <rect x="16" y="40" width="32" height="12" rx="2" stroke={color} strokeWidth="2" fill={`${color}20`} />
      <text x="32" y="50" textAnchor="middle" fill={color} fontSize="10" fontWeight="bold">PDF</text>
    </svg>
  );
}

// Icono para DOCX/DOC
export function DocIcon({ size = 24, color = '#3B82F6', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="8" y="4" width="48" height="56" rx="4" stroke={color} strokeWidth="2.5" fill="none" />
      <path d="M20 12H32" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M20 18H44" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M20 24H44" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M20 30H36" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <rect x="16" y="40" width="32" height="12" rx="2" stroke={color} strokeWidth="2" fill={`${color}20`} />
      <text x="32" y="50" textAnchor="middle" fill={color} fontSize="8" fontWeight="bold">DOC</text>
    </svg>
  );
}

// Icono para imágenes (JPG, PNG, etc.)
export function ImageIcon({ size = 24, color = '#22C55E', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="8" y="8" width="48" height="48" rx="4" stroke={color} strokeWidth="2.5" fill="none" />
      <circle cx="24" cy="24" r="6" stroke={color} strokeWidth="2" fill={`${color}20`} />
      <path d="M16 48L28 32L36 40L44 28L48 48H16Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={`${color}15`} />
      <circle cx="48" cy="16" r="4" stroke={color} strokeWidth="2" fill={`${color}20`} />
    </svg>
  );
}

// Icono para hojas de cálculo (XLSX, CSV)
export function SpreadsheetIcon({ size = 24, color = '#22C55E', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="8" y="4" width="48" height="56" rx="4" stroke={color} strokeWidth="2.5" fill="none" />
      {/* Grid lines */}
      <path d="M16 16H48" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M16 28H48" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M16 40H48" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M24 16V52" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M40 16V52" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      {/* Cells highlight */}
      <rect x="16" y="16" width="8" height="12" fill={`${color}20`} />
      <rect x="40" y="28" width="8" height="12" fill={`${color}15`} />
    </svg>
  );
}

// Icono para código/HTML
export function CodeIcon({ size = 24, color = '#F97316', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="8" y="8" width="48" height="48" rx="4" stroke={color} strokeWidth="2.5" fill="none" />
      <path d="M24 24L16 32L24 40" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 24L48 32L40 40" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 20L28 44" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// Icono para JSON/Datos
export function JsonIcon({ size = 24, color = '#F59E0B', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="8" y="8" width="48" height="48" rx="4" stroke={color} strokeWidth="2.5" fill="none" />
      <text x="32" y="38" textAnchor="middle" fill={color} fontSize="20" fontWeight="bold" fontFamily="monospace">{'{ }'}</text>
      <circle cx="20" cy="20" r="3" fill={color} />
      <circle cx="44" cy="44" r="3" fill={color} />
    </svg>
  );
}

// Icono para presentaciones (PPTX)
export function PresentationIcon({ size = 24, color = '#F97316', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="8" y="12" width="48" height="36" rx="4" stroke={color} strokeWidth="2.5" fill="none" />
      {/* Screen/Slide */}
      <rect x="12" y="16" width="40" height="28" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}10`} />
      {/* Stand */}
      <path d="M32 48V56" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 56H40" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Content lines on slide */}
      <path d="M16 24H36" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M16 30H32" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <circle cx="44" cy="30" r="4" stroke={color} strokeWidth="1.5" fill={`${color}20`} />
    </svg>
  );
}

// Icono genérico de archivo
export function FileIcon({ size = 24, color = '#C9D1D9', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M36 4H16C12.686 4 10 6.686 10 10V54C10 57.314 12.686 60 16 60H48C51.314 60 54 57.314 54 54V22L36 4Z" stroke={color} strokeWidth="2.5" fill="none" />
      <path d="M36 4V18C36 20.209 37.791 22 40 22H54" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 32H44" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M20 40H36" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M20 48H44" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
