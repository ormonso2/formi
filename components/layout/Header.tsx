'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FormiLogo } from '@/components/brand/FormiLogo';
import { PricingModal } from '@/components/pricing/PricingModal';
import { SupportModal } from '@/components/support/SupportModal';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="max-w-5xl mx-auto rounded-2xl"
          style={{
            background: 'rgba(15, 17, 21, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          }}
        >
          <div className="flex items-center justify-between h-[72px] sm:h-[84px] px-4 sm:px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 no-underline">
              <FormiLogo size="md" showTagline={false} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 sm:gap-8">
              <Link
                href="/"
                className="text-sm font-medium text-[#C9D1D9] hover:text-white transition-colors duration-200 no-underline"
              >
                Producto
              </Link>
              <button
                onClick={() => setIsPricingOpen(true)}
                className="text-sm font-medium text-[#C9D1D9] hover:text-white transition-colors duration-200 bg-transparent border-none cursor-pointer"
              >
                Precios
              </button>
              <button
                onClick={() => setIsSupportOpen(true)}
                className="text-sm font-medium text-[#C9D1D9] hover:text-white transition-colors duration-200 bg-transparent border-none cursor-pointer"
              >
                Soporte
              </button>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={() => setIsPricingOpen(true)}
                className="btn-formi text-sm px-4 py-2"
              >
                Prueba gratis
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-white/10"
                style={{ background: 'rgba(15, 17, 21, 0.95)' }}
              >
                <div className="py-4 px-4 space-y-4">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-base font-medium text-[#C9D1D9] hover:text-white transition-colors py-2"
                  >
                    Producto
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsPricingOpen(true);
                    }}
                    className="block w-full text-left text-base font-medium text-[#C9D1D9] hover:text-white transition-colors py-2"
                  >
                    Precios
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSupportOpen(true);
                    }}
                    className="block w-full text-left text-base font-medium text-[#C9D1D9] hover:text-white transition-colors py-2 bg-transparent border-none cursor-pointer"
                  >
                    Soporte
                  </button>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsPricingOpen(true);
                    }}
                    className="w-full btn-formi text-sm py-2.5"
                  >
                    Prueba gratis
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </header>

      {/* Pricing Modal */}
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />

      {/* Support Modal */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </>
  );
}
