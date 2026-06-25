'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ConversionCard } from '@/components/conversion/ConversionCard';
import { DownloadButton } from '@/components/conversion/DownloadButton';
import { ConversionAnimation } from '@/components/conversion/ConversionAnimation';
import { ConversionStatus } from '@/types/conversion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface StatusResponse {
  status: ConversionStatus;
  progress: number;
  error?: string;
  originalName: string;
  originalType: string;
  targetFormat: string;
}

export default function ConvertPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const pollStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/convert/${jobId}/status`);
      if (!response.ok) {
        setError('Job no encontrado');
        return false;
      }

      const result: StatusResponse = await response.json();
      setData(result);
      if (result.status === 'done' && !isAnimating) {
        setIsAnimating(true);
        let start = 0;
        const duration = 1200;
        const step = 10;
        const timer = setInterval(() => {
          start += step;
          if (start >= 100) {
            setDisplayProgress(100);
            clearInterval(timer);
          } else {
            setDisplayProgress(start);
          }
        }, duration / (100 / step));
      } else {
        setDisplayProgress(result.progress);
      }

      if (result.status === 'done' || result.status === 'error') {
        return false; // Stop polling
      }
      return true; // Continue polling
    } catch {
      setError('Error de conexión');
      return false;
    }
  }, [jobId]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;
      const shouldContinue = await pollStatus();
      if (shouldContinue && isActive) {
        timeoutId = setTimeout(poll, 600);
      }
    };

    poll();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [pollStatus]);

  if (error) {
    return (
      <div className="container-formi pt-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-elevated rounded-3xl p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[rgba(239,68,68,0.12)] flex items-center justify-center mx-auto mb-4">
            <span className="text-[#EF4444] text-3xl font-bold">!</span>
          </div>
          <h2 className="heading-md mb-2">Error</h2>
          <p className="text-body mb-6">{error}</p>
          <Link href="/" className="btn-formi inline-flex">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-formi pt-20 flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/2.png"
            alt="Cargando"
            width={48}
            height={48}
            className="object-contain"
            priority
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-formi pt-16 sm:pt-20 pb-12 sm:pb-24 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#C9D1D9] hover:text-white transition-colors mb-6 sm:mb-8 no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Nueva conversión
        </Link>

        {/* Advanced Conversion Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-elevated rounded-2xl sm:rounded-3xl p-4 sm:p-8"
        >
          <div className="text-center mb-6">
            <motion.h2
              key={data.status === 'done' ? 'done' : 'converting'}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="heading-lg mb-2"
            >
              {data.status === 'done' && displayProgress >= 100 ? '¡Archivo convertido!' : 'Convirtiendo archivo...'}
            </motion.h2>
            <p className="text-body">
              {data.originalName} • {data.originalType.toUpperCase()} → {data.targetFormat.toUpperCase()}
            </p>
          </div>
          
          <ConversionAnimation
            progress={displayProgress}
            sourceFormat={data.originalType}
            targetFormat={data.targetFormat}
            isComplete={data.status === 'done' && displayProgress >= 100}
          />
          
          {data.status === 'done' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm mt-2"
              style={{ color: '#19D3E6' }}
            >
              ✓ Listo — presiona descargar para obtener tu archivo
            </motion.p>
          )}
        </motion.div>

        {/* Download button (shows when done) */}
        {data.status === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-4"
          >
            <DownloadButton
              jobId={jobId}
              fileName={data.originalName}
              targetFormat={data.targetFormat}
            />
            <Link
              href="/"
              className="text-sm text-[#19D3E6] hover:text-white transition-colors flex items-center gap-1 no-underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Nueva conversión
            </Link>
          </motion.div>
        )}

        {/* Error state */}
        {data.status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-4"
          >
            <div
              className="rounded-xl p-4 text-center max-w-md"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <p className="text-sm text-[#EF4444]">{data.error || 'Error desconocido en la conversión'}</p>
            </div>
            <Link href="/" className="btn-glass">
              <RotateCcw className="w-4 h-4" />
              Intentar de nuevo
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
