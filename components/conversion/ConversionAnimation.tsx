'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PdfIcon, DocIcon, ImageIcon, SpreadsheetIcon, CodeIcon, JsonIcon, PresentationIcon, FileIcon } from '@/components/icons/FileIcons';
import { CheckCircle, Zap } from 'lucide-react';

interface ConversionAnimationProps {
  progress: number;
  sourceFormat: string;
  targetFormat: string;
  isComplete: boolean;
}

export function ConversionAnimation({ progress, sourceFormat, targetFormat, isComplete }: ConversionAnimationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  
  useEffect(() => {
    // Generate particles for animation
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  const getIconForFormat = (format: string) => {
    const lowerFormat = format.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg', 'bmp', 'tiff', 'heic'].includes(lowerFormat)) return ImageIcon;
    if (['pdf'].includes(lowerFormat)) return PdfIcon;
    if (['docx', 'doc', 'odt', 'rtf', 'txt', 'md'].includes(lowerFormat)) return DocIcon;
    if (['xlsx', 'xls', 'csv', 'ods'].includes(lowerFormat)) return SpreadsheetIcon;
    if (['html', 'htm', 'xml'].includes(lowerFormat)) return CodeIcon;
    if (['json', 'yaml', 'yml'].includes(lowerFormat)) return JsonIcon;
    if (['pptx', 'ppt', 'odp'].includes(lowerFormat)) return PresentationIcon;
    return FileIcon;
  };

  const SourceIcon = getIconForFormat(sourceFormat);
  const TargetIcon = getIconForFormat(targetFormat);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress / 100);

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-6 gap-6">

      {/* Source → Target labels */}
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ opacity: isComplete ? 0.4 : 1 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <SourceIcon size={24} color="#ffffff" />
          </div>
          <span className="text-xs font-bold text-white/70">{sourceFormat.toUpperCase()}</span>
        </motion.div>

        {/* Arrow */}
        <motion.div
          animate={{ x: isComplete ? 0 : [0, 4, 0] }}
          transition={{ duration: 1, repeat: isComplete ? 0 : Infinity, ease: 'easeInOut' }}
        >
          <Zap className="w-5 h-5" style={{ color: '#19D3E6' }} />
        </motion.div>

        <motion.div
          animate={{ opacity: isComplete ? 1 : 0.4, scale: isComplete ? 1.05 : 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: isComplete ? 'rgba(25,211,230,0.15)' : 'rgba(255,255,255,0.05)',
              border: isComplete ? '1px solid rgba(25,211,230,0.5)' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <TargetIcon size={24} color={isComplete ? '#19D3E6' : '#ffffff'} />
          </div>
          <span className="text-xs font-bold" style={{ color: isComplete ? '#19D3E6' : 'rgba(255,255,255,0.7)' }}>
            {targetFormat.toUpperCase()}
          </span>
        </motion.div>
      </div>

      {/* Circular progress */}
      <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
        {/* Track */}
        <svg width={140} height={140} className="absolute">
          <circle
            cx={70} cy={70} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={8}
          />
        </svg>
        {/* Progress arc */}
        <svg width={140} height={140} className="absolute" style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#19D3E6" />
              <stop offset="100%" stopColor="#0EA5B8" />
            </linearGradient>
          </defs>
          <motion.circle
            cx={70} cy={70} r={radius}
            fill="none"
            stroke={isComplete ? 'url(#pg)' : 'url(#pg)'}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ filter: 'drop-shadow(0 0 8px rgba(25,211,230,0.6))' }}
          />
        </svg>

        {/* Center content */}
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="done"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-1"
            >
              <CheckCircle className="w-10 h-10" style={{ color: '#19D3E6' }} />
            </motion.div>
          ) : (
            <motion.div
              key="progress"
              className="flex flex-col items-center gap-0.5"
            >
              <motion.span
                className="text-3xl font-bold text-white"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {Math.round(progress)}
              </motion.span>
              <span className="text-xs text-white/50 font-medium">%</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Completion burst particles */}
      <AnimatePresence>
        {isComplete && particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{ background: '#19D3E6', boxShadow: '0 0 6px #19D3E6', top: '50%', left: '50%' }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: (p.x - 50) * 2,
              y: (p.y - 50) * 2,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.8 + p.delay * 0.3, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
