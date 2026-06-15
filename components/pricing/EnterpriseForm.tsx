'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Send, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface EnterpriseFormProps {
  onBack: () => void;
}

export function EnterpriseForm({ onBack }: EnterpriseFormProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    employees: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/enterprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la solicitud');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-[rgba(34,197,94,0.15)] flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-[#22C55E]" />
        </div>
        <h3 className="heading-md mb-4">¡Solicitud enviada!</h3>
        <p className="text-body max-w-md mb-6">
          Nuestro equipo de ventas se pondrá en contacto contigo en las próximas 24 horas.
        </p>
        <button
          onClick={onBack}
          className="btn-formi"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a planes
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#C9D1D9] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a planes
      </button>

      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}
        >
          <Building2 className="w-8 h-8 text-[#8B5CF6]" />
        </div>
        <h3 className="heading-md mb-2">Plan Empresa</h3>
        <p className="text-body">
          Cuéntanos sobre tu empresa y te prepararemos una propuesta personalizada
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Nombre de la empresa *
            </label>
            <input
              type="text"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none focus:border-[#19D3E6] transition-colors"
              placeholder="Ej: Acme Corporation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tu nombre *
            </label>
            <input
              type="text"
              name="contactName"
              required
              value={formData.contactName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none focus:border-[#19D3E6] transition-colors"
              placeholder="Ej: Juan Pérez"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Correo electrónico *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none focus:border-[#19D3E6] transition-colors"
              placeholder="tu@empresa.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none focus:border-[#19D3E6] transition-colors"
              placeholder="+52 55 1234 5678"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Número de empleados
          </label>
          <select
            name="employees"
            value={formData.employees}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[#19D3E6] transition-colors"
          >
            <option value="" className="bg-[#0F1115]">Selecciona una opción</option>
            <option value="1-10" className="bg-[#0F1115]">1-10 empleados</option>
            <option value="11-50" className="bg-[#0F1115]">11-50 empleados</option>
            <option value="51-200" className="bg-[#0F1115]">51-200 empleados</option>
            <option value="201-500" className="bg-[#0F1115]">201-500 empleados</option>
            <option value="500+" className="bg-[#0F1115]">500+ empleados</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            ¿Qué necesitas?
          </label>
          <textarea
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none focus:border-[#19D3E6] transition-colors resize-none"
            placeholder="Cuéntanos sobre tus necesidades específicas, volumen de conversiones esperado, integraciones requeridas, etc."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
            color: '#0F1115',
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.35)',
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
                  alt="Enviando"
                  width={20}
                  height={20}
                  className="object-contain invert"
                  priority
                />
              </motion.div>
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enviar solicitud
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
