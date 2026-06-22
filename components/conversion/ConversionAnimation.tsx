'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PdfIcon, DocIcon, ImageIcon, SpreadsheetIcon, CodeIcon, JsonIcon, PresentationIcon, FileIcon } from '@/components/icons/FileIcons';
import Image from 'next/image';

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

  return (
    <div className="relative w-full h-40 sm:h-48 flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at center, rgba(25,211,230,0.3) 0%, transparent 70%)',
        }}
      />

      {/* Animated particles */}
      <AnimatePresence>
        {!isComplete && particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              opacity: 0, 
              scale: 0,
              x: `${particle.x}%`,
              y: `${particle.y}%`
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [`${particle.x}%`, '50%', `${100 - particle.x}%`],
              y: [`${particle.y}%`, '50%', `${100 - particle.y}%`],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 3 + particle.delay,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `linear-gradient(135deg, #19D3E6 0%, #0EA5B8 100%)`,
              boxShadow: '0 0 10px rgba(25, 211, 230, 0.8)',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Central conversion area */}
      <div className="relative z-10 flex items-center justify-center gap-8">
        {/* Source file */}
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{ 
            scale: isComplete ? 0.8 : 1,
            opacity: isComplete ? 0.5 : 1,
          }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <SourceIcon size={32} color="#FFFFFF" />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-white">
            {sourceFormat.toUpperCase()}
          </div>
        </motion.div>

        {/* Conversion vortex */}
        <div className="relative w-20 h-20">
          <motion.div
            className="w-full h-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Image
              src="/2.png"
              alt="Convirtiendo"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-lg font-bold text-white drop-shadow-lg"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {Math.round(progress)}%
            </motion.div>
          </div>
        </div>

        {/* Target file */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ 
            scale: isComplete ? 1 : 0.8,
            opacity: isComplete ? 1 : 0.5,
          }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: isComplete 
                ? 'linear-gradient(135deg, rgba(25,211,230,0.2) 0%, rgba(14,165,184,0.2) 100%)'
                : 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: isComplete 
                ? '2px solid rgba(25, 211, 230, 0.5)'
                : '2px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <TargetIcon size={32} color={isComplete ? '#19D3E6' : '#FFFFFF'} />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-white">
            {targetFormat.toUpperCase()}
          </div>
        </motion.div>
      </div>

      {/* Progress ring */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#19D3E6" />
            <stop offset="100%" stopColor="#0EA5B8" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="50%"
          cy="50%"
          r="80"
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 80}`}
          strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - progress / 100) }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            filter: 'drop-shadow(0 0 10px rgba(25, 211, 230, 0.5))',
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
          }}
        />
      </svg>

      {/* Completion effect */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              className="w-32 h-32 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(25,211,230,0.4) 0%, transparent 70%)',
              }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: 2 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
