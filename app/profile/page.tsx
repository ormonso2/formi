'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Zap, Calendar, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ConversionStats {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ConversionStats | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario');
      }
    });
  }, [router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(25, 211, 230, 0.15)' }}>
            <Zap className="w-6 h-6 text-[#19D3E6]" />
          </div>
          <p className="text-white">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const planColors: Record<string, string> = {
    free: '#22C55E',
    starter: '#19D3E6',
    pro: '#F59E0B',
    enterprise: '#8B5CF6',
  };

  const planNames: Record<string, string> = {
    free: 'Gratuito',
    starter: 'Inicial',
    pro: 'Pro',
    enterprise: 'Empresa',
  };

  const planColor = planColors[stats?.plan || 'free'] || '#22C55E';
  const planName = planNames[stats?.plan || 'free'] || 'Gratuito';

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Mi Perfil</h1>
          <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Gestiona tu cuenta y conversiones
          </p>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 mb-8"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ background: `${planColor}20`, border: `1px solid ${planColor}40` }}
            >
              <Mail className="w-8 h-8" style={{ color: planColor }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{userName}</h2>
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {user?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="rounded-xl p-4"
              style={{
                background: `${planColor}15`,
                border: `1px solid ${planColor}30`,
              }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: planColor }}>
                PLAN ACTUAL
              </p>
              <p className="text-2xl font-bold text-white">{planName}</p>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(25, 211, 230, 0.15)',
                border: '1px solid rgba(25, 211, 230, 0.3)',
              }}
            >
              <p className="text-xs font-medium mb-1 text-[#19D3E6]">
                CONVERSIONES USADAS
              </p>
              <p className="text-2xl font-bold text-white">
                {stats?.used || 0} / {stats?.limit || 10}
              </p>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <p className="text-xs font-medium mb-1 text-[#22C55E]">
                DISPONIBLES ESTE MES
              </p>
              <p className="text-2xl font-bold text-white">{stats?.remaining || 10}</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Uso de conversiones este mes</h3>
              <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {Math.round((stats.used / stats.limit) * 100)}%
              </span>
            </div>
            <div
              className="w-full h-3 rounded-full overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${planColor} 0%, ${planColor}dd 100%)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.used / stats.limit) * 100, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* Plan Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <h3 className="text-xl font-bold text-white mb-6">Características de tu plan</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats?.plan === 'free' && (
              <>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 mt-1" style={{ color: planColor }} />
                  <div>
                    <p className="font-medium text-white">10 conversiones/mes</p>
                    <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Límite mensual de conversiones
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 mt-1" style={{ color: planColor }} />
                  <div>
                    <p className="font-medium text-white">Máximo 5MB</p>
                    <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Tamaño máximo de archivo
                    </p>
                  </div>
                </div>
              </>
            )}

            {stats?.plan === 'starter' && (
              <>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 mt-1" style={{ color: planColor }} />
                  <div>
                    <p className="font-medium text-white">100 conversiones/mes</p>
                    <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Límite mensual de conversiones
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 mt-1" style={{ color: planColor }} />
                  <div>
                    <p className="font-medium text-white">Máximo 25MB</p>
                    <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Tamaño máximo de archivo
                    </p>
                  </div>
                </div>
              </>
            )}

            {stats?.plan === 'pro' && (
              <>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 mt-1" style={{ color: planColor }} />
                  <div>
                    <p className="font-medium text-white">Conversiones ilimitadas</p>
                    <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Sin límite de conversiones mensuales
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 mt-1" style={{ color: planColor }} />
                  <div>
                    <p className="font-medium text-white">Máximo 100MB</p>
                    <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Tamaño máximo de archivo
                    </p>
                  </div>
                </div>
              </>
            )}

            {stats?.plan === 'enterprise' && (
              <>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 mt-1" style={{ color: planColor }} />
                  <div>
                    <p className="font-medium text-white">Conversiones ilimitadas</p>
                    <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Sin límites de conversiones
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 mt-1" style={{ color: planColor }} />
                  <div>
                    <p className="font-medium text-white">Soporte dedicado</p>
                    <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Asistencia 24/7 personalizada
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
