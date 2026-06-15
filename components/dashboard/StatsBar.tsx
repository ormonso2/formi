'use client';

import { motion } from 'framer-motion';
import { FileCheck, Clock, HardDrive } from 'lucide-react';

export function StatsBar() {
  const stats = [
    { label: 'Convertidos hoy', value: '24', icon: FileCheck, color: '#22C55E' },
    { label: 'En cola', value: '3', icon: Clock, color: '#F59E0B' },
    { label: 'Almacenamiento', value: '68 GB / 250 GB', icon: HardDrive, color: '#19D3E6' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-sm rounded-2xl p-5 sm:p-6 my-8"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="flex flex-col md:flex-row items-stretch md:items-center divide-y md:divide-y-0 md:divide-x divide-[rgba(255,255,255,0.08)]">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-0 flex-1"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: `${stat.color}15`,
                border: `1px solid ${stat.color}25`,
              }}
            >
              <stat.icon className="w-4.5 h-4.5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </p>
              <p className="text-sm font-semibold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
