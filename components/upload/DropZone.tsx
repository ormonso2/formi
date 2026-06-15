'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FormiIcon } from '@/components/brand/FormiIcon';
import { Upload, FolderOpen } from 'lucide-react';
import { UploadResponse } from '@/types/conversion';

interface DropZoneProps {
  onFileUploaded: (data: UploadResponse) => void;
}

export function DropZone({ onFileUploaded }: DropZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Client-side size validation
    if (file.size > 50 * 1024 * 1024) {
      setError('El archivo excede el límite de 50MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 85));
      }, 200);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al subir el archivo');
      }

      setUploadProgress(100);

      const data: UploadResponse = await response.json();
      onFileUploaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
    disabled: isUploading,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative z-0"
    >
      <div
        {...getRootProps()}
        className={`
          relative rounded-3xl p-10 md:p-16 min-h-[450px] flex flex-col items-center justify-center
          cursor-pointer transition-all duration-300
          ${isDragActive
            ? 'glass-elevated dropzone-active scale-[1.02]'
            : 'glass-elevated dropzone-idle hover:border-[rgba(25,211,230,0.4)] hover:shadow-[0_0_40px_rgba(25,211,230,0.15)]'
          }
        `}
        style={{
          borderStyle: isDragActive ? 'solid' : 'dashed',
          background: isDragActive 
            ? 'rgba(25, 211, 230, 0.12)' 
            : 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          boxShadow: isDragActive
            ? '0 20px 60px rgba(25, 211, 230, 0.25), 0 0 40px rgba(25, 211, 230, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            : '0 20px 60px rgba(0, 0, 0, 0.60), 0 0 40px rgba(25, 211, 230, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.16)',
        }}
      >
        <input {...getInputProps()} id="file-upload-input" />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-6"
            >
              <Upload className="w-12 h-12 text-[#19D3E6] animate-pulse" />
              <div className="text-center">
                <p className="text-white font-semibold text-lg mb-2" style={{
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}>Subiendo archivo...</p>
                <p className="text-sm" style={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                  fontWeight: 500
                }}>
                  {uploadProgress}% completado
                </p>
              </div>

              {/* Progress bar */}
              <div
                className="w-64 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.06)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(135deg, #19D3E6 0%, #0EA5B8 100%)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-6"
            >
              <FormiIcon size={64} animate={!isDragActive} />

              <div className="text-center">
                <p className="text-white font-semibold text-xl mb-2" style={{
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}>
                  {isDragActive
                    ? '¡Suelta tu archivo aquí!'
                    : 'Arrastra y suelta tus archivos aquí'}
                </p>
                <p className="text-sm" style={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                  fontWeight: 500
                }}>
                  o selecciona desde tu dispositivo
                </p>
              </div>

              <button
                type="button"
                className="btn-formi"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('file-upload-input')?.click();
                }}
              >
                <FolderOpen className="w-4 h-4" />
                Seleccionar archivos
              </button>

              <p className="text-xs" style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                fontWeight: 500
              }}>
                Máx. 50MB por archivo
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <div
                className="rounded-xl p-3 text-center text-sm font-medium"
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444',
                }}
              >
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
