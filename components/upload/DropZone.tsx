'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FolderOpen, Lock } from 'lucide-react';
import { UploadResponse } from '@/types/conversion';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface DropZoneProps {
  onFileUploaded: (data: UploadResponse) => void;
}

export function DropZone({ onFileUploaded }: DropZoneProps) {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Re-check authentication fresh to avoid stale closure
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    if (!currentUser) {
      setShowAuthPrompt(true);
      return;
    }

    const files = acceptedFiles;

    // Client-side size validation
    const oversized = files.find(f => f.size > 50 * 1024 * 1024);
    if (oversized) {
      setError(`${oversized.name} excede el límite de 50MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 12, 85));
      }, 200);

      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al subir los archivos');
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
  }, [onFileUploaded, user]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    onDrop,
    multiple: true,
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
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 sm:w-28 sm:h-28"
              >
                <Image
                  src="/2.png"
                  alt="Subiendo"
                  width={112}
                  height={112}
                  className="object-contain"
                  priority
                />
              </motion.div>
              <div className="text-center">
                <p className="text-white font-semibold text-lg mb-2" style={{
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}>Subiendo archivos...</p>
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
              {isDragActive ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-28 h-28 sm:w-32 sm:h-32"
                >
                  <Image
                    src="/2.png"
                    alt="FORMI"
                    width={128}
                    height={128}
                    className="object-contain"
                    priority
                  />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-28 h-28 sm:w-32 sm:h-32"
                >
                  <Image
                    src="/2.png"
                    alt="FORMI"
                    width={128}
                    height={128}
                    className="object-contain"
                    priority
                  />
                </motion.div>
              )}

              <div className="text-center">
                <p className="text-white font-semibold text-xl mb-2" style={{
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}>
                  {isDragActive
                    ? '¡Suelta tus archivos aquí!'
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
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error-message"
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

        {/* Auth Prompt Modal */}
        <AnimatePresence mode="wait">
          {showAuthPrompt && (
            <motion.div
              key="dropzone-auth-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl"
              style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}
              onClick={() => setShowAuthPrompt(false)}
            >
              <motion.div
                key="dropzone-auth-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="rounded-2xl p-6 max-w-sm text-center mx-4"
                style={{
                  background: 'rgba(15, 17, 21, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
                >
                  <Lock className="w-7 h-7 text-[#22C55E]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Inicia sesión para continuar</h3>
                <p className="text-sm mb-6" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Para convertir archivos, necesitas una cuenta. Es gratis y solo toma un minuto.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full py-3 rounded-xl font-semibold transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                      color: '#0F1115',
                    }}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="w-full py-3 rounded-xl font-semibold transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    Crear cuenta
                  </button>
                  <button
                    onClick={() => setShowAuthPrompt(false)}
                    className="text-sm py-2"
                    style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
