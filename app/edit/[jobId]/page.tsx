'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { FormiLogo } from '@/components/brand/FormiLogo';
import { DocxEditor } from '@/components/editor/DocxEditor';
import { Download, FileOutput, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

export default function EditPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const router = useRouter();
  const [html, setHtml] = useState<string>('');
  const [metadata, setMetadata] = useState<{ title: string; wordCount: number; pageCount: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentHtmlRef = useRef<string>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch('/api/docx/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId }),
        });

        if (!response.ok) {
          throw new Error('Error al cargar el documento');
        }

        const data = await response.json();
        setHtml(data.html);
        currentHtmlRef.current = data.html;
        setMetadata(data.metadata);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [jobId]);

  const handleEditorUpdate = useCallback((newHtml: string) => {
    currentHtmlRef.current = newHtml;

    // Auto-save debounce (3 seconds)
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      toast.info('Guardado automáticamente', {
        duration: 2000,
      });
    }, 3000);
  }, []);

  const handleSaveDocx = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/docx/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: currentHtmlRef.current,
          originalJobId: jobId,
          filename: metadata?.title || 'document',
        }),
      });

      if (!response.ok) throw new Error('Error al guardar');

      const data = await response.json();

      // Download the saved docx
      const downloadResponse = await fetch(`/api/download/${data.savedJobId}`);
      const blob = await downloadResponse.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${metadata?.title || 'document'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Documento descargado');
    } catch (err) {
      toast.error('Error al guardar el documento');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvertToPdf = async () => {
    setIsConverting(true);
    try {
      // First save the current HTML as DOCX
      const saveResponse = await fetch('/api/docx/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: currentHtmlRef.current,
          originalJobId: jobId,
          filename: metadata?.title || 'document',
        }),
      });

      if (!saveResponse.ok) throw new Error('Error al guardar');
      const saveData = await saveResponse.json();

      // Then trigger conversion to PDF
      const convertResponse = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: saveData.savedJobId,
          targetFormat: 'pdf',
        }),
      });

      if (!convertResponse.ok) throw new Error('Error al convertir');

      router.push(`/convert/${saveData.savedJobId}`);
    } catch (err) {
      toast.error('Error al convertir a PDF');
      setIsConverting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10"
          >
            <Image
              src="/2.png"
              alt="Cargando"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </motion.div>
          <p className="text-sm text-[#C9D1D9]">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-formi pt-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-elevated rounded-3xl p-12 text-center max-w-md">
          <h2 className="heading-md mb-2">Error</h2>
          <p className="text-body mb-6">{error}</p>
          <Link href="/" className="btn-formi inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Column: Index & Details */}
      <div className="w-64 border-r border-[rgba(255,255,255,0.06)] bg-[#0F1115] p-6 flex-col hidden lg:flex">
        <Link href="/" className="no-underline mb-8 block">
          <FormiLogo size="sm" />
        </Link>
        
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[#C9D1D9] mb-3">Detalles</h3>
          <p className="text-sm text-white font-medium truncate mb-4" title={metadata?.title || 'Documento'}>
            {metadata?.title || 'Documento'}
          </p>
          
          {metadata && (
            <div className="space-y-3 glass-sm p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#C9D1D9]">Palabras</span>
                <span className="text-white font-medium bg-[#1A1F26] px-2 py-1 rounded-md">{metadata.wordCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#C9D1D9]">Páginas est.</span>
                <span className="text-white font-medium bg-[#1A1F26] px-2 py-1 rounded-md">{metadata.pageCount}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[#C9D1D9] mb-3">Navegación</h3>
          <Link href="/" className="text-sm text-[#C9D1D9] hover:text-white transition-colors flex items-center gap-2 no-underline py-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>

      {/* Center Column: TipTap Editor */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-y-auto bg-[#12161B] relative"
      >
        <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12">
          <DocxEditor initialContent={html} onSave={handleEditorUpdate} />
        </div>
      </motion.div>

      {/* Right Column: Export Panel */}
      <div className="w-72 border-l border-[rgba(255,255,255,0.06)] bg-[#0F1115] p-6 flex flex-col hidden md:flex">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-[#19D3E6] mb-4">Exportar</h3>
        
        <div className="space-y-3">
          <button
            onClick={handleSaveDocx}
            disabled={isSaving || isConverting}
            className="w-full btn-glass flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              {isSaving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4"
                >
                  <Image
                    src="/2.png"
                    alt="Guardando"
                    width={16}
                    height={16}
                    className="object-contain invert"
                    priority
                  />
                </motion.div>
              ) : <Download className="w-4 h-4 text-[#C9D1D9] group-hover:text-white transition-colors" />}
              <span>Guardar DOCX</span>
            </div>
          </button>

          <button
            onClick={handleConvertToPdf}
            disabled={isConverting || isSaving}
            className="w-full btn-formi flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {isConverting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4"
                >
                  <Image
                    src="/2.png"
                    alt="Convirtiendo"
                    width={16}
                    height={16}
                    className="object-contain invert"
                    priority
                  />
                </motion.div>
              ) : <FileOutput className="w-4 h-4" />}
              <span>Convertir a PDF</span>
            </div>
          </button>
        </div>
        
        <div className="mt-8 p-4 rounded-xl" style={{ background: 'rgba(25, 211, 230, 0.05)', border: '1px solid rgba(25, 211, 230, 0.1)' }}>
          <h4 className="text-xs font-semibold text-[#19D3E6] mb-2">Información</h4>
          <p className="text-xs text-[#C9D1D9] leading-relaxed">
            Los cambios se guardan automáticamente de forma temporal en el navegador. Descarga o convierte el archivo para preservar tus modificaciones.
          </p>
        </div>
      </div>
    </div>
  );
}
