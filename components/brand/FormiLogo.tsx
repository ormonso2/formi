'use client';

import Image from 'next/image';

interface FormiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

const sizeMap = {
  sm: { width: 56, height: 56 },
  md: { width: 72, height: 72 },
  lg: { width: 100, height: 100 },
  xl: { width: 140, height: 140 },
};

export function FormiLogo({ size = 'md' }: FormiLogoProps) {
  const s = sizeMap[size];

  return (
    <Image
      src="/3.png"
      alt="FORMI"
      width={s.width}
      height={s.height}
      className="object-contain"
      priority
    />
  );
}
