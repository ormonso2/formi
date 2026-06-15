'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StripeCheckoutButtonProps {
  priceId: string;
  email?: string;
  name?: string;
  userId?: string;
  planName: string;
}

export function StripeCheckoutButton({
  priceId,
  email,
  name,
  userId,
  planName,
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email) {
      toast.error('Inicia sesión para suscribirte', {
        description: 'Necesitas una cuenta para continuar con el pago.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          email,
          name,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar el pago');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error('Error', {
        description: error.message || 'No se pudo iniciar el pago',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSubscribe}
      disabled={isLoading}
      className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-250 flex items-center justify-center gap-2 disabled:opacity-50"
      style={{
        background: 'linear-gradient(135deg, #19D3E6 0%, #0EA5B8 100%)',
        color: '#0F1115',
        boxShadow: '0 4px 16px rgba(25, 211, 230, 0.35)',
      }}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          Suscribirse — {planName}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </motion.button>
  );
}
