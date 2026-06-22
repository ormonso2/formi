'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FormiLogo } from '@/components/brand/FormiLogo';
import { DropZone } from '@/components/upload/DropZone';
import { FilePreview } from '@/components/upload/FilePreview';
import { FormatSelector } from '@/components/upload/FormatSelector';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { UploadResponse } from '@/types/conversion';
import { ArrowRight, X, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { PrecisionIcon, SpeedIcon, QualityIcon, SecurityIcon } from '@/components/icons/FeatureIcons';

const supportedFormats = ['PDF', 'DOCX', 'XLSX', 'PPTX', 'PNG', 'JPG', 'WebP', 'CSV', 'JSON', 'XML', 'SVG', 'GIF', 'TXT', 'MD'];

const features = [
  {
    Icon: PrecisionIcon,
    title: 'Precisión',
    description: 'Conversión exacta, sin alteraciones. Cada pixel, cada dato preservado.',
  },
  {
    Icon: SpeedIcon,
    title: 'Velocidad',
    description: 'Procesos rápidos, resultados inmediatos. Conversiones en segundos.',
  },
  {
    Icon: QualityIcon,
    title: 'Calidad',
    description: 'Mantiene la integridad de cada archivo. Sin pérdida de información.',
  },
  {
    Icon: SecurityIcon,
    title: 'Confianza',
    description: 'Seguridad de nivel empresarial. Tus archivos están protegidos.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleFileUploaded = (data: UploadResponse) => {
    setUploadData(data);
    setSelectedFormat(null);
    toast.success('Archivo subido correctamente', {
      description: `${data.fileName} (${data.fileSizeMB} MB)`,
    });
  };

  const handleStartConversion = async () => {
    if (!uploadData || !selectedFormat) return;

    setIsConverting(true);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: uploadData.jobId,
          targetFormat: selectedFormat,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al iniciar la conversión');
      }

      router.push(`/convert/${uploadData.jobId}`);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
      setIsConverting(false);
    }
  };

  const handleEditDocx = () => {
    if (!uploadData) return;
    router.push(`/edit/${uploadData.jobId}`);
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="container-formi pt-16 sm:pt-20 pb-16 sm:pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex justify-center mb-8 sm:mb-10">
            <Image
              src="/1.png"
              alt="FORMI"
              width={280}
              height={280}
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 px-4">
            Convierte archivos{' '}
            <br className="hidden sm:block" />
            <span style={{ color: '#19D3E6' }}>sin perder calidad.</span>
          </h1>

          <p className="text-body text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-12 px-4">
            Plataforma de conversión inteligente para equipos que exigen precisión y velocidad.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-20 px-4">
            <a href="#dropzone" className="btn-formi w-full sm:w-auto text-center px-6 py-3">
              Comenzar gratis
            </a>
            <a href="#features" className="btn-glass w-full sm:w-auto text-center px-6 py-3">
              Ver características
            </a>
          </div>
        </motion.div>
      </section>

      {/* DropZone Section */}
      <section id="dropzone" className="container-formi pb-8 sm:pb-12 max-w-3xl mx-auto">
        <DropZone onFileUploaded={handleFileUploaded} />

        {/* Supported formats badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-10 mb-8"
        >
          {supportedFormats.map((fmt) => (
            <span key={fmt} className="format-badge text-[#C9D1D9]">
              {fmt}
            </span>
          ))}
        </motion.div>
      </section>

      {/* Format Selection Panel (appears after upload) */}
      <AnimatePresence>
        {uploadData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-start sm:justify-end"
            style={{ background: 'rgba(0, 0, 0, 0.75)' }}
            onClick={() => setUploadData(null)}
          >
            <motion.div
              initial={{ y: '100%', x: 0 }}
              animate={{ y: 0, x: 0 }}
              exit={{ y: '100%', x: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="h-[90vh] sm:h-screen w-full sm:max-w-md rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none flex flex-col"
              style={{ 
                background: 'rgba(15, 17, 21, 0.95)',
                backdropFilter: 'blur(40px) saturate(200%)',
                WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 0 60px rgba(0, 0, 0, 0.80), inset 1px 0 0 rgba(255, 255, 255, 0.1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                  <h2 className="heading-md">Convertir archivo</h2>
                  <button
                    onClick={() => setUploadData(null)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                  >
                    <X className="w-5 h-5 text-[#C9D1D9]" />
                  </button>
                </div>

                {/* File preview */}
                <div className="mb-10">
                  <FilePreview
                    fileName={uploadData.fileName}
                    fileType={uploadData.fileType}
                    fileSizeMB={uploadData.fileSizeMB}
                  />
                </div>

                {/* Edit DOCX option */}
                {uploadData.isDocx && (
                  <button
                    onClick={handleEditDocx}
                    className="w-full mb-10 p-4 rounded-2xl flex items-center gap-3 text-left transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(25, 211, 230, 0.3)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.35), 0 0 20px rgba(25, 211, 230, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(25,211,230,0.12)]">
                      <Pencil className="w-5 h-5 text-[#19D3E6]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>Editar documento primero</p>
                      <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Abre el editor para modificar antes de convertir</p>
                    </div>
                    <ArrowRight className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.8)' }} ml-auto />
                  </button>
                )}

                {/* Format selector section */}
                <div className="mb-10">
                  <p className="text-label mb-5">Formato de destino</p>
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-5 border border-white/5">
                    <FormatSelector
                      formats={uploadData.availableFormats}
                      selected={selectedFormat}
                      onSelect={setSelectedFormat}
                    />
                  </div>
                </div>

                {/* Convert button section - always at bottom */}
                <div className="mt-auto pt-6 border-t border-white/10">
                  {selectedFormat && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <button
                        onClick={handleStartConversion}
                        disabled={isConverting}
                        className="btn-formi btn-formi-lg w-full"
                      >
                        {isConverting ? (
                          'Iniciando conversión...'
                        ) : (
                          <>
                            Comenzar conversión
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Bar */}
      <section className="container-formi pt-12 pb-12 sm:pt-16 sm:pb-16 max-w-3xl mx-auto">
        <StatsBar />
      </section>

      {/* Visual separator */}
      <div className="container-formi max-w-3xl mx-auto px-4 sm:px-6">
        <div className="border-t border-[rgba(255,255,255,0.08)]"></div>
      </div>

      {/* Features Section */}
      <section id="features" className="container-formi pt-20 sm:pt-28 pb-20 sm:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <p className="text-label mb-4" style={{ color: '#19D3E6' }}>
            ¿Por qué FORMi?
          </p>
          <h2 className="heading-lg">
            Conversión de archivos,{' '}
            <span style={{ color: '#19D3E6' }}>reinventada.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass glass-hover rounded-2xl p-6 sm:p-8"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{
                  background: 'rgba(25, 211, 230, 0.12)',
                  border: '1px solid rgba(25, 211, 230, 0.25)',
                }}
              >
                <feature.Icon className="w-6 h-6 text-[#19D3E6]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-sm text-body leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] py-12 sm:py-16">
        <div className="container-formi flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="flex items-center">
            <Image
              src="/1.png"
              alt="FORMI"
              width={140}
              height={140}
              className="object-contain"
            />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Convierte archivos sin perder calidad.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            formi.fun
          </p>
        </div>
      </footer>
    </div>
  );
}
