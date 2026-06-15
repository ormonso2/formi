'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Check } from 'lucide-react';
import Image from 'next/image';

interface DownloadButtonProps {
  jobId: string;
  fileName: string;
  targetFormat: string;
}

export function DownloadButton({ jobId, fileName, targetFormat }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const response = await fetch(`/api/download/${jobId}`);
      if (!response.ok) throw new Error('Error al descargar');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const baseName = fileName.replace(/\.[^.]+$/, '');
      a.download = `${baseName}.${targetFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 3000);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleDownload}
      disabled={isDownloading}
      className="btn-formi btn-formi-lg w-full max-w-xs"
      id="download-button"
    >
      {isDownloading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5"
          >
            <Image
              src="/2.png"
              alt="Descargando"
              width={20}
              height={20}
              className="object-contain invert"
              priority
            />
          </motion.div>
          Descargando...
        </>
      ) : isDownloaded ? (
        <>
          <Check className="w-5 h-5" />
          ¡Descargado!
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          Descargar {fileName.replace(/\.[^.]+$/, '')}.{targetFormat}
        </>
      )}
    </motion.button>
  );
}
