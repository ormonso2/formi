'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, Check, Lock } from 'lucide-react';
import { FormiLogo } from '@/components/brand/FormiLogo';
import { EnterpriseForm } from './EnterpriseForm';
import { StudentOffer } from './StudentOffer';
import { StripeCheckoutButton } from './StripeCheckoutButton';
import { GiftIcon, StudentIcon, StarterIcon, ProIcon, EnterpriseIcon } from '@/components/icons/PricingIcons';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const plans = [
  {
    name: 'Gratuito',
    price: '$0',
    currency: 'MXN',
    period: '/mes',
    description: 'Perfecto para empezar',
    Icon: GiftIcon,
    color: '#22C55E',
    features: [
      '10 conversiones/mes',
      'Máximo 5MB',
      'Formatos básicos',
      'Conversión estándar',
      'Soporte por email',
    ],
    cta: 'Comenzar gratis',
    popular: false,
  },
  {
    name: 'Inicial',
    price: '$89',
    currency: 'MXN',
    period: '/mes',
    description: 'Para usuarios activos',
    Icon: StarterIcon,
    color: '#19D3E6',
    features: [
      '100 conversiones/mes',
      'Máximo 25MB',
      'Todos los formatos',
      'Conversión prioritaria',
      'Soporte prioritario',
      'Historial 30 días',
      'Sin marca de agua',
    ],
    cta: 'Elegir Inicial',
    popular: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
  },
  {
    name: 'Pro',
    price: '$199',
    currency: 'MXN',
    period: '/mes',
    description: 'Para profesionales',
    Icon: ProIcon,
    color: '#F59E0B',
    features: [
      'Conversiones ilimitadas',
      'Máximo 100MB',
      'Todos los formatos + API',
      'Ultra-rápido',
      'Soporte 24/7',
      'Historial ilimitado',
      'Sin marca de agua',
      'Hasta 5 usuarios',
    ],
    cta: 'Elegir Pro',
    popular: false,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  },
  {
    name: 'Empresa',
    price: 'Consultar',
    currency: '',
    period: '',
    description: 'Grandes equipos',
    Icon: EnterpriseIcon,
    color: '#8B5CF6',
    features: [
      'Todo del plan Pro',
      'Usuarios ilimitados',
      'API dedicada',
      'Soporte dedicado',
      'Personalización',
      'SLA garantizado',
      'On-premise',
      'Auditoría',
    ],
    cta: 'Contactar',
    popular: false,
    isEnterprise: true,
  },
];

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userName, setUserName] = useState('');
  const [showEnterpriseForm, setShowEnterpriseForm] = useState(false);
  const [showStudentOffer, setShowStudentOffer] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || '');
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setUserName(session.user.user_metadata?.name || session.user.email?.split('@')[0] || '');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handlePlanClick = (plan: any) => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    if (plan.isEnterprise) {
      setShowEnterpriseForm(true);
    } else if (plan.name === 'Gratuito') {
      onClose();
    }
  };

  const handleStudentClick = () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    setShowStudentOffer(true);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="pricing-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0, 0, 0, 0.80)' }}
            onClick={onClose}
          >
          <motion.div
            key="modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl mx-4 rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(15, 17, 21, 0.95)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 0 80px rgba(0, 0, 0, 0.80), 0 0 40px rgba(25, 211, 230, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="heading-lg mb-2">Planes y precios</h2>
                  <p className="text-body">Elige el plan que mejor se adapte a tus necesidades</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Student Offer Button */}
                  <button
                    onClick={() => setShowStudentOffer(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300"
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#22C55E',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(34, 197, 94, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(34, 197, 94, 0.15)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <StudentIcon size={16} />
                    ¿Eres estudiante? 6 meses gratis
                  </button>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-[#C9D1D9]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="p-4 sm:p-6 md:p-8 max-h-[80vh] overflow-y-auto">
              {!showEnterpriseForm ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {plans.map((plan, index) => {
                  const IconComponent = plan.Icon;
                  return (
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="relative rounded-2xl p-6 flex flex-col"
                      style={{
                        background: plan.popular
                          ? 'rgba(25, 211, 230, 0.08)'
                          : 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${plan.popular ? 'rgba(25, 211, 230, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                        boxShadow: plan.popular
                          ? '0 8px 32px rgba(25, 211, 230, 0.15)'
                          : '0 4px 16px rgba(0, 0, 0, 0.25)',
                      }}
                    >
                      {/* Popular badge */}
                      {plan.popular && (
                        <div
                          className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: 'linear-gradient(135deg, #19D3E6 0%, #0EA5B8 100%)',
                            color: '#0F1115',
                          }}
                        >
                          Más popular
                        </div>
                      )}

                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{
                          background: `rgba(${plan.color === '#19D3E6' ? '25, 211, 230' : plan.color === '#F59E0B' ? '245, 158, 11' : plan.color === '#8B5CF6' ? '139, 92, 246' : '34, 197, 94'}, 0.15)`,
                          border: `1px solid ${plan.color}60`,
                        }}
                      >
                        <IconComponent size={24} color={plan.color} />
                      </div>

                      {/* Plan name */}
                      <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                      <p className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {plan.description}
                      </p>

                      {/* Price */}
                      <div className="mb-6">
                        <span className={`font-bold text-white ${plan.price === 'Personalizado' ? 'text-2xl' : 'text-4xl'}`}>
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-sm ml-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            {plan.period}
                          </span>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="flex-1 space-y-3 mb-6">
                        {plan.features.map((feature, i) => (
                          <li key={`${plan.name}-feature-${i}`} className="flex items-start gap-2">
                            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                            <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      {plan.stripePriceId ? (
                        <StripeCheckoutButton
                          priceId={plan.stripePriceId}
                          planName={plan.name}
                          email={user?.email}
                          name={userName}
                          userId={user?.id}
                          color={plan.color}
                        />
                      ) : (
                        <button
                          onClick={() => handlePlanClick(plan)}
                          className="w-full py-3 rounded-xl font-semibold transition-all duration-300"
                          style={{
                            background: plan.popular
                              ? 'linear-gradient(135deg, #19D3E6 0%, #0EA5B8 100%)'
                              : plan.isEnterprise
                              ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                              : 'rgba(255, 255, 255, 0.1)',
                            color: plan.popular || plan.isEnterprise ? '#0F1115' : '#FFFFFF',
                            border: plan.popular || plan.isEnterprise ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: plan.popular 
                              ? '0 4px 16px rgba(25, 211, 230, 0.35)' 
                              : plan.isEnterprise
                              ? '0 4px 16px rgba(139, 92, 246, 0.35)'
                              : 'none',
                          }}
                          onMouseEnter={(e) => {
                            if (plan.popular || plan.isEnterprise) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = plan.isEnterprise 
                                ? '0 8px 28px rgba(139, 92, 246, 0.5)'
                                : '0 8px 28px rgba(25, 211, 230, 0.5)';
                            } else {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                              e.currentTarget.style.borderColor = 'rgba(25, 211, 230, 0.4)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (plan.popular || plan.isEnterprise) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = plan.isEnterprise
                                ? '0 4px 16px rgba(139, 92, 246, 0.35)'
                                : '0 4px 16px rgba(25, 211, 230, 0.35)';
                            } else {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            }
                          }}
                        >
                          {plan.cta}
                        </button>
                      )}
                    </motion.div>
                  );
                })}

                {/* Student Promo Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  onClick={handleStudentClick}
                  className="relative rounded-2xl p-6 cursor-pointer group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px dashed rgba(34, 197, 94, 0.4)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                      }}
                    >
                      <StudentIcon size={28} color="#22C55E" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">¿Eres estudiante?</h3>
                      <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Obtén el Plan Pro <span className="text-[#22C55E] font-semibold">6 meses gratis</span>
                      </p>
                    </div>
                    <div
                      className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 group-hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                        color: '#0F1115',
                      }}
                    >
                      Verificar →
                    </div>
                  </div>
                </motion.div>
              </div>

                  {/* Footer note */}
                  <p className="text-center mt-8 text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Todos los planes incluyen encriptación de archivos y eliminación automática después de 24 horas.
                    <br />
                    Puedes cambiar de plan o cancelar en cualquier momento.
                  </p>
                </>
              ) : (
                <EnterpriseForm onBack={() => setShowEnterpriseForm(false)} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Student Offer Modal */}
      <StudentOffer
        isOpen={showStudentOffer}
        onClose={() => setShowStudentOffer(false)}
      />

      {/* Auth Prompt Modal */}
      <AnimatePresence mode="wait">
        {showAuthPrompt && (
          <motion.div
            key="auth-prompt-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ background: 'rgba(0, 0, 0, 0.90)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowAuthPrompt(false)}
          >
            <motion.div
              key="auth-prompt-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl p-8 max-w-md text-center mx-4"
              style={{
                background: 'rgba(15, 17, 21, 0.98)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 0 60px rgba(0, 0, 0, 0.8)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'linear-gradient(135deg, rgba(25, 211, 230, 0.2) 0%, rgba(25, 211, 230, 0.05) 100%)', border: '1px solid rgba(25, 211, 230, 0.3)' }}
              >
                <Lock className="w-8 h-8 text-[#19D3E6]" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Inicia sesión para continuar</h3>
              <p className="text-base mb-8" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Para seleccionar un plan y acceder a todas las funciones, necesitas una cuenta. Es gratis y solo toma un minuto.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #19D3E6 0%, #0EA5B8 100%)',
                    color: '#0F1115',
                  }}
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  Crear cuenta gratis
                </button>
                <button
                  onClick={() => setShowAuthPrompt(false)}
                  className="text-sm py-2 mt-2"
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
