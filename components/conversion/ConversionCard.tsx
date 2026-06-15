'use client';

import { motion } from 'framer-motion';
import { ProgressTracker } from './ProgressTracker';
import { getIconForType, typeColorMap } from '@/components/upload/FilePreview';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ConversionStatus } from '@/types/conversion';
import Image from 'next/image';

interface ConversionCardProps {
  originalName: string;
  sourceFormat: string;
  targetFormat: string;
  progress: number;
  status: ConversionStatus;
}

const statusLabels: Record<ConversionStatus, string> = {
  idle: 'Preparando',
  uploading: 'Subiendo',
  processing: 'Procesando',
  done: 'Listo',
  error: 'Error',
};

const steps = ['Subiendo', 'Procesando', 'Optimizando', 'Listo'];

function getActiveStep(progress: number, status: ConversionStatus): number {
  if (status === 'done') return 3;
  if (status === 'error') return -1;
  if (progress < 25) return 0;
  if (progress < 60) return 1;
  if (progress < 90) return 2;
  return 3;
}

export function ConversionCard({
  originalName,
  sourceFormat,
  targetFormat,
  progress,
  status,
}: ConversionCardProps) {
  const SourceIcon = getIconForType(sourceFormat);
  const TargetIcon = getIconForType(targetFormat);
  const sourceColor = typeColorMap[sourceFormat] || '#C9D1D9';
  const targetColor = typeColorMap[targetFormat] || '#C9D1D9';
  const activeStep = getActiveStep(progress, status);
  const isDone = status === 'done';
  const isError = status === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-elevated rounded-3xl p-8 md:p-12 max-w-xl mx-auto"
    >
      {/* File name */}
      <p className="text-center text-sm font-medium text-[#C9D1D9] mb-8 truncate">
        {originalName}
      </p>

      {/* Format animation section */}
      <div className="flex items-center justify-center gap-6 mb-8">
        {/* Source format */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center gap-2"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: `${sourceColor}15`,
              border: `1px solid ${sourceColor}30`,
            }}
          >
            <SourceIcon className="w-8 h-8" style={{ color: sourceColor }} />
          </div>
          <span className="format-badge" style={{ color: sourceColor, borderColor: `${sourceColor}30` }}>
            {sourceFormat.toUpperCase()}
          </span>
        </motion.div>

        {/* Arrow / Spinner */}
        <div className="flex flex-col items-center">
          {isDone ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
            </motion.div>
          ) : isError ? (
            <div className="w-8 h-8 rounded-full bg-[rgba(239,68,68,0.15)] flex items-center justify-center">
              <span className="text-[#EF4444] text-lg font-bold">!</span>
            </div>
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8"
            >
              <Image
                src="/2.png"
                alt="Procesando"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </motion.div>
          )}
          <ArrowRight className="w-5 h-5 text-[rgba(255,255,255,0.3)] mt-1" />
        </div>

        {/* Target format */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isDone ? 1 : 0.5, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-2"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: `${targetColor}15`,
              border: `1px solid ${targetColor}30`,
            }}
          >
            <TargetIcon className="w-8 h-8" style={{ color: targetColor }} />
          </div>
          <span className="format-badge" style={{ color: targetColor, borderColor: `${targetColor}30` }}>
            {targetFormat.toUpperCase()}
          </span>
        </motion.div>
      </div>

      {/* Progress ring */}
      {!isDone && !isError && (
        <div className="flex justify-center mb-8">
          <ProgressTracker progress={progress} />
        </div>
      )}

      {/* Steps */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{
                  background:
                    i <= activeStep
                      ? isDone
                        ? '#22C55E'
                        : '#19D3E6'
                      : 'rgba(255, 255, 255, 0.12)',
                  boxShadow:
                    i === activeStep && !isDone
                      ? '0 0 8px rgba(25, 211, 230, 0.5)'
                      : 'none',
                }}
              />
              <span
                className="text-[10px] font-medium"
                style={{
                  color:
                    i <= activeStep
                      ? isDone
                        ? '#22C55E'
                        : '#FFFFFF'
                      : 'var(--text-muted)',
                }}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-8 h-px mb-4"
                style={{
                  background:
                    i < activeStep
                      ? isDone
                        ? '#22C55E'
                        : '#19D3E6'
                      : 'rgba(255, 255, 255, 0.08)',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Status label */}
      <p
        className="text-center text-sm font-medium"
        style={{
          color: isDone ? '#22C55E' : isError ? '#EF4444' : '#19D3E6',
        }}
      >
        {isError ? 'Error en la conversión' : statusLabels[status]}
      </p>
    </motion.div>
  );
}
