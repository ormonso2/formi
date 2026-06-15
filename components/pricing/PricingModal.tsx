'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Rocket, Target, Gift, Building2, GraduationCap } from 'lucide-react';
import { FormiLogo } from '@/components/brand/FormiLogo';
import { EnterpriseForm } from './EnterpriseForm';
import { StudentOffer } from './StudentOffer';
import { StripeCheckoutButton } from './StripeCheckoutButton';

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
    icon: Gift,
    color: '#22C55E',
    features: [
      '10 conversiones/mes',
      'Máximo 5MB por archivo',
      'Formatos básicos (PDF, JPG, PNG)',
      'Conversión estándar',
      'Soporte por email',
    ],
    cta: 'Comenzar gratis',
    popular: false,
  },
  {
    name: 'Estudiante',
    price: '$0',
    currency: 'MXN',
    period: ' / 6 meses',
    description: 'Verificación requerida',
    icon: GraduationCap,
    color: '#22C55E',
    features: [
      'Plan Pro por 6 meses gratis',
      'Conversiones ilimitadas',
      'Máximo 100MB por archivo',
      'Todos los formatos + API',
      'Soporte prioritario',
      'Requiere email institucional',
    ],
    cta: 'Verificar como estudiante',
    popular: false,
    isStudent: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDENT,
  },
  {
    name: 'Inicial',
    price: '$89',
    currency: 'MXN',
    period: '/mes',
    description: 'Para usuarios activos',
    icon: Rocket,
    color: '#19D3E6',
    features: [
      '100 conversiones/mes',
      'Máximo 25MB por archivo',
      'Todos los formatos',
      'Conversión prioritaria',
      'Soporte prioritario',
      'Historial de 30 días',
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
    icon: Target,
    color: '#F59E0B',
    features: [
      'Conversiones ilimitadas',
      'Máximo 100MB por archivo',
      'Todos los formatos + API',
      'Conversión ultra-rápida',
      'Soporte 24/7',
      'Historial ilimitado',
      'Sin marca de agua',
      'Integraciones avanzadas',
      'Equipo hasta 5 usuarios',
    ],
    cta: 'Elegir Pro',
    popular: false,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  },
  {
    name: 'Empresa',
    price: 'Personalizado',
    currency: '',
    period: '',
    description: 'Para grandes equipos',
    icon: Building2,
    color: '#8B5CF6',
    features: [
      'Todo lo del plan Pro',
      'Usuarios ilimitados',
      'API dedicada',
      'Soporte dedicado',
      'Personalización',
      'SLA garantizado',
      'On-premise opcional',
      'Auditoría y reportes',
    ],
    cta: 'Contactar ventas',
    popular: false,
    isEnterprise: true,
  },
];

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [showEnterpriseForm, setShowEnterpriseForm] = useState(false);
  const [showStudentOffer, setShowStudentOffer] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.80)' }}
          onClick={onClose}
        >
          <motion.div
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
                    <GraduationCap className="w-4 h-4" />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                {plans.map((plan, index) => {
                  const Icon = plan.icon;
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
                        <Icon className="w-6 h-6" style={{ color: plan.color }} />
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
                          <li key={i} className="flex items-start gap-2">
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
                        />
                      ) : (
                        <button
                          onClick={() => {
                            if (plan.isEnterprise) setShowEnterpriseForm(true);
                            else if (plan.isStudent) setShowStudentOffer(true);
                          }}
                          className="w-full py-3 rounded-xl font-semibold transition-all duration-300"
                          style={{
                            background: plan.popular
                              ? 'linear-gradient(135deg, #19D3E6 0%, #0EA5B8 100%)'
                              : plan.isEnterprise
                              ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                              : plan.isStudent
                              ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                              : 'rgba(255, 255, 255, 0.1)',
                            color: plan.popular || plan.isEnterprise || plan.isStudent ? '#0F1115' : '#FFFFFF',
                            border: plan.popular || plan.isEnterprise || plan.isStudent ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: plan.popular 
                              ? '0 4px 16px rgba(25, 211, 230, 0.35)' 
                              : plan.isEnterprise
                              ? '0 4px 16px rgba(139, 92, 246, 0.35)'
                              : plan.isStudent
                              ? '0 4px 16px rgba(34, 197, 94, 0.35)'
                              : 'none',
                          }}
                          onMouseEnter={(e) => {
                            if (plan.popular || plan.isEnterprise || plan.isStudent) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = plan.isEnterprise 
                                ? '0 8px 28px rgba(139, 92, 246, 0.5)'
                                : plan.isStudent
                                ? '0 8px 28px rgba(34, 197, 94, 0.5)'
                                : '0 8px 28px rgba(25, 211, 230, 0.5)';
                            } else {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                              e.currentTarget.style.borderColor = 'rgba(25, 211, 230, 0.4)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (plan.popular || plan.isEnterprise || plan.isStudent) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = plan.isEnterprise
                                ? '0 4px 16px rgba(139, 92, 246, 0.35)'
                                : plan.isStudent
                                ? '0 4px 16px rgba(34, 197, 94, 0.35)'
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

      {/* Student Offer Modal */}
      <StudentOffer 
        isOpen={showStudentOffer} 
        onClose={() => setShowStudentOffer(false)} 
      />
    </AnimatePresence>
  );
}
