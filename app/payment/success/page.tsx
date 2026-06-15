'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success'>('verifying');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // In a real app, you might verify the session server-side
      setTimeout(() => setStatus('success'), 1500);
    }
  }, [searchParams]);

  return (
    <div className="container-formi pt-32 sm:pt-40 pb-20 min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-elevated rounded-3xl p-10 sm:p-14 max-w-md w-full text-center"
      >
        {status === 'verifying' ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-[#19D3E6] border-t-transparent animate-spin" />
            <p className="text-white font-medium">Verificando tu pago...</p>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex flex-col items-center gap-6"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                boxShadow: '0 8px 32px rgba(34, 197, 94, 0.35)',
              }}
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <div>
              <h2 className="heading-md text-white mb-2">¡Pago exitoso!</h2>
              <p className="text-body">
                Tu suscripción al plan Pro ha sido activada. Ahora tienes acceso a conversiones ilimitadas.
              </p>
            </div>

            <div className="w-full space-y-3">
              <Link
                href="/"
                className="btn-formi w-full inline-flex items-center justify-center gap-2"
              >
                Ir al conversor
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
