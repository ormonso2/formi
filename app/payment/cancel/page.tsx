'use client';

import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="container-formi pt-32 sm:pt-40 pb-20 min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-elevated rounded-3xl p-10 sm:p-14 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="flex flex-col items-center gap-6"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.35)',
            }}
          >
            <XCircle className="w-10 h-10 text-white" />
          </div>

          <div>
            <h2 className="heading-md text-white mb-2">Pago cancelado</h2>
            <p className="text-body">
              No te preocupes, no se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.
            </p>
          </div>

          <div className="w-full space-y-3">
            <Link
              href="/"
              className="btn-formi w-full inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Intentar de nuevo
            </Link>
            <Link
              href="/"
              className="btn-glass w-full inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
