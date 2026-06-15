'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, HelpCircle, Bug, FileQuestion, CreditCard, Sparkles } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const topics = [
  { id: 'general', label: 'Consulta general', icon: HelpCircle, description: 'Preguntas sobre el servicio' },
  { id: 'technical', label: 'Problema técnico', icon: Bug, description: 'Errores o fallas en la conversión' },
  { id: 'file', label: 'Archivo no convierte', icon: FileQuestion, description: 'Problemas con un archivo específico' },
  { id: 'billing', label: 'Facturación', icon: CreditCard, description: 'Pagos, planes o facturas' },
  { id: 'feature', label: 'Sugerencia', icon: Sparkles, description: 'Ideas para mejorar FORMi' },
];

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [step, setStep] = useState<'topic' | 'details' | 'confirm'>('topic');

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setStep('details');
  };

  const handleSubmit = () => {
    const topic = topics.find(t => t.id === selectedTopic);
    const topicLabel = topic?.label || 'Consulta';
    
    const message = `Hola, soy usuario de FORMI.\n\n*Asunto:* ${topicLabel}\n\n*Detalles:* ${details || 'Necesito ayuda con este tema.'}\n\nGracias.`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5214423807751?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    onClose();
    // Reset state
    setSelectedTopic(null);
    setDetails('');
    setStep('topic');
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('topic');
      setSelectedTopic(null);
    } else if (step === 'confirm') {
      setStep('details');
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedTopic(null);
    setDetails('');
    setStep('topic');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.85)' }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(15, 17, 21, 0.95)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.80), 0 0 40px rgba(25, 211, 230, 0.05)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    boxShadow: '0 4px 16px rgba(34, 197, 94, 0.35)',
                  }}
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Soporte FORMi</h3>
                  <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Te ayudamos en minutos
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-[#C9D1D9]" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div 
                className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                style={{ background: step === 'topic' ? '#22C55E' : 'rgba(34, 197, 94, 0.3)' }}
              />
              <div 
                className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                style={{ background: step === 'details' ? '#22C55E' : step === 'confirm' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)' }}
              />
              <div 
                className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                style={{ background: step === 'confirm' ? '#22C55E' : 'rgba(255, 255, 255, 0.1)' }}
              />
            </div>

            {/* Step 1: Select Topic */}
            {step === 'topic' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <p className="text-sm font-medium text-white mb-4">
                  ¿Cuál es el motivo de tu consulta?
                </p>
                <div className="space-y-2">
                  {topics.map((topic) => {
                    const Icon = topic.icon;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => handleTopicSelect(topic.id)}
                        className="w-full p-4 rounded-2xl text-left transition-all duration-250 flex items-center gap-4 hover:scale-[1.02]"
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'rgba(34, 197, 94, 0.12)',
                            border: '1px solid rgba(34, 197, 94, 0.25)',
                          }}
                        >
                          <Icon className="w-5 h-5 text-[#22C55E]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{topic.label}</p>
                          <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            {topic.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {step === 'details' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={handleBack}
                    className="text-sm text-[#22C55E] hover:text-[#16A34A] transition-colors"
                  >
                    ← Volver
                  </button>
                </div>
                
                <p className="text-sm font-medium text-white mb-4">
                  Cuéntanos más detalles
                </p>
                
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe tu problema o consulta..."
                  className="w-full p-4 rounded-2xl text-sm text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    minHeight: '120px',
                  }}
                />
                
                <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Al continuar, se abrirá WhatsApp con tu mensaje predefinido.
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all duration-250 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(34, 197, 94, 0.35)',
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contactar por WhatsApp
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
