'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface StripeCheckoutButtonProps {
  priceId: string;
  email?: string;
  name?: string;
  userId?: string;
  planName: string;
  color?: string;
}

export function StripeCheckoutButton({
  priceId,
  email,
  name,
  userId,
  planName,
  color = '#19D3E6',
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

  // Extract RGB values for shadow
  const getRGBFromHex = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '25, 211, 230';
  };

  const rgb = getRGBFromHex(color);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSubscribe}
      disabled={isLoading}
      className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-250 flex items-center justify-center gap-2 disabled:opacity-50"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        color: '#0F1115',
        boxShadow: `0 4px 16px rgba(${rgb}, 0.35)`,
      }}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5"
        >
          <Image
            src="/2.png"
            alt="Cargando"
            width={20}
            height={20}
            className="object-contain invert"
            priority
          />
        </motion.div>
      ) : (
        <>
          Suscribirse — {planName}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </motion.button>
  );
}
