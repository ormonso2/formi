'use client';

import { motion } from 'framer-motion';

interface FormiIconProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

export function FormiIcon({ size = 48, animate = true, className = '' }: FormiIconProps) {
  const iconContent = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Document base */}
      <rect
        x="16"
        y="8"
        width="32"
        height="40"
        rx="4"
        stroke="#19D3E6"
        strokeWidth="2.5"
        fill="rgba(25, 211, 230, 0.08)"
      />
      {/* Document fold */}
      <path
        d="M36 8V16H48"
        stroke="#19D3E6"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Document lines */}
      <line x1="22" y1="22" x2="38" y2="22" stroke="#19D3E6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="22" y1="28" x2="42" y2="28" stroke="#19D3E6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="22" y1="34" x2="36" y2="34" stroke="#19D3E6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

      {/* Circular arrows (transformation) */}
      <path
        d="M32 52C38.6274 52 44 49 44 49"
        stroke="#19D3E6"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M44 49L42 45M44 49L48 48"
        stroke="#19D3E6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M32 56C25.3726 56 20 53 20 53"
        stroke="#19D3E6"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 53L22 57M20 53L16 54"
        stroke="#19D3E6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  if (animate) {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ display: 'inline-flex' }}
      >
        {iconContent}
      </motion.div>
    );
  }

  return iconContent;
}
