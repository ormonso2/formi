'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { FormatOption } from '@/types/conversion';
import { getIconForType, typeColorMap } from './FilePreview';

interface FormatSelectorProps {
  formats: FormatOption[];
  selected: string | null;
  onSelect: (format: string) => void;
}

export function FormatSelector({ formats, selected, onSelect }: FormatSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {formats.map((format, index) => {
        const isSelected = selected === format.value;
        const Icon = getIconForType(format.value);
        const color = typeColorMap[format.value] || '#C9D1D9';

        return (
          <motion.button
            key={format.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
            onClick={() => onSelect(format.value)}
            className={`
              relative p-4 rounded-2xl text-left transition-all duration-250 flex items-center gap-4
            `}
            style={{
              background: isSelected 
                ? 'rgba(25, 211, 230, 0.15)' 
                : 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: `1px solid ${isSelected ? `${color}80` : 'rgba(255, 255, 255, 0.15)'}`,
              boxShadow: isSelected
                ? '0 8px 32px rgba(25, 211, 230, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                : '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
            id={`format-${format.value}`}
          >
            {/* Selected checkmark */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #19D3E6 0%, #0EA5B8 100%)',
                }}
              >
                <Check className="w-3.5 h-3.5 text-[#0F1115]" />
              </motion.div>
            )}

            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(25, 211, 230, 0.12)',
                border: '1px solid rgba(25, 211, 230, 0.25)',
              }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            
            <div className="flex-1">
              <span
                className="text-sm font-semibold block"
                style={{ 
                  color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.95)',
                  textShadow: isSelected ? '0 2px 4px rgba(0, 0, 0, 0.5)' : '0 1px 2px rgba(0, 0, 0, 0.4)'
                }}
              >
                {format.label}
              </span>
              <span
                className="text-xs block mt-1 leading-tight"
                style={{ 
                  color: isSelected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.8)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}
              >
                {format.description}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
