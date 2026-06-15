'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Upload, CheckCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface StudentOfferProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StudentOffer({ isOpen, onClose }: StudentOfferProps) {
  const [step, setStep] = useState<'form' | 'upload' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    studentId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/student-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar solicitud');
      }

      setStep('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.85)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(25, 211, 230, 0.1) 100%)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            boxShadow: '0 0 80px rgba(34, 197, 94, 0.2), 0 0 40px rgba(25, 211, 230, 0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                  }}
                >
                  <GraduationCap className="w-6 h-6 text-[#22C55E]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Plan Estudiante</h2>
                  <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>6 meses completamente gratis</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-[#C9D1D9]" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {step === 'form' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="mb-6 p-4 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
                  <p className="text-sm text-white">
                    <span className="font-semibold text-[#22C55E]">Beneficios:</span>
                  </p>
                  <ul className="mt-2 space-y-1 text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    <li>• Acceso al plan Pro por 6 meses</li>
                    <li>• Conversiones ilimitadas</li>
                    <li>• Todos los formatos disponibles</li>
                    <li>• Soporte prioritario</li>
                  </ul>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Nombre completo *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#22C55E] transition-colors"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Email institucional *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#22C55E] transition-colors"
                      placeholder="tu.email@universidad.edu"
                    />
                    <p className="mt-1 text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Debe ser un email .edu o institucional
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Universidad/Escuela *</label>
                    <input
                      type="text"
                      name="school"
                      required
                      value={formData.school}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#22C55E] transition-colors"
                      placeholder="Nombre de tu institución"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Matrícula/ID Estudiantil *</label>
                    <input
                      type="text"
                      name="studentId"
                      required
                      value={formData.studentId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#22C55E] transition-colors"
                      placeholder="Tu número de matrícula"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                      color: '#0F1115',
                      boxShadow: '0 4px 16px rgba(34, 197, 94, 0.35)',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5"
                        >
                          <Image
                            src="/2.png"
                            alt="Verificando"
                            width={20}
                            height={20}
                            className="object-contain invert"
                            priority
                          />
                        </motion.div>
                        Verificando...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-5 h-5" />
                        Solicitar beneficio estudiante
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-4 text-xs text-center" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  Al enviar, te llegará un email de verificación a tu correo institucional. Haz clic en el enlace para confirmar tu identidad.
                </p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 rounded-full bg-[rgba(34,197,94,0.2)] flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-[#22C55E]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">¡Revisa tu email!</h3>
                <p className="text-body mb-6">
                  Te enviamos un enlace de verificación a tu correo institucional. Haz clic en el enlace para confirmar tu identidad y completar tu solicitud.
                </p>
                <button
                  onClick={onClose}
                  className="btn-formi"
                >
                  Entendido
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
