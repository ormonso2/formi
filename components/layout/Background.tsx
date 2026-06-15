'use client';

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base background */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: '#0F1115' }}
      />

      {/* Hero gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(25,211,230,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Orb 1: top-left */}
      <div
        className="absolute animate-orb-drift"
        style={{
          top: '-10%',
          left: '-5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'rgba(25, 211, 230, 0.06)',
          filter: 'blur(120px)',
        }}
      />

      {/* Orb 2: top-right */}
      <div
        className="absolute animate-orb-drift"
        style={{
          top: '-5%',
          right: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(14, 165, 184, 0.04)',
          filter: 'blur(120px)',
          animationDelay: '-10s',
        }}
      />

      {/* Orb 3: bottom-center */}
      <div
        className="absolute animate-orb-drift"
        style={{
          bottom: '-15%',
          left: '30%',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'rgba(25, 211, 230, 0.03)',
          filter: 'blur(150px)',
          animationDelay: '-20s',
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />
    </div>
  );
}
