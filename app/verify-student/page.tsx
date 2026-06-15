'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, GraduationCap } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token no proporcionado.');
      return;
    }

    fetch(`/api/student-verification/verify?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (data.success) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Error al verificar');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Error de conexión. Intenta de nuevo más tarde.');
      });
  }, [token]);

  return (
    <div className="container-formi pt-32 sm:pt-40 pb-20 min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-elevated rounded-3xl p-10 sm:p-14 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#22C55E] animate-spin" />
            <p className="text-white font-medium">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                boxShadow: '0 8px 32px rgba(34, 197, 94, 0.35)',
              }}
            >
              <GraduationCap className="w-10 h-10 text-white" />
            </div>

            <div>
              <h2 className="heading-md text-white mb-2">¡Verificado!</h2>
              <p className="text-body">{message}</p>
            </div>

            <Link href="/" className="btn-formi w-full inline-flex items-center justify-center gap-2">
              Ir al inicio
            </Link>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.35)',
              }}
            >
              <XCircle className="w-10 h-10 text-white" />
            </div>

            <div>
              <h2 className="heading-md text-white mb-2">Error</h2>
              <p className="text-body">{message}</p>
            </div>

            <Link href="/" className="btn-glass w-full inline-flex items-center justify-center gap-2">
              Volver al inicio
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyStudentPage() {
  return (
    <Suspense fallback={
      <div className="container-formi pt-32 sm:pt-40 pb-20 min-h-[60vh] flex items-center justify-center">
        <div className="glass-elevated rounded-3xl p-10 text-center">
          <Loader2 className="w-10 h-10 text-[#22C55E] animate-spin mx-auto" />
          <p className="text-white mt-4">Cargando...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
