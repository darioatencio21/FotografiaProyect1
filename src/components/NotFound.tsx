/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ActiveLanguíage } from '../types';
import { Logo } from './Logo';

interface NotFoundProps {
  lang: ActiveLanguíage;
  onNavigateHome: () => void;
  onNavigatePortfolio: () => void;
}

const translations = {
  es: {
    title: 'Página no encontrada',
    subtitle: 'La ruta que buscas no existe o ha sido movida.',
    ctaHome: 'Volver al Inicio',
    ctaPortfolio: 'Ver Galería',
    code: '404',
  },
  en: {
    title: 'Page not found',
    subtitle: 'The page you\'re looking for doesn\'t exist or has been moved.',
    ctaHome: 'Back to Home',
    ctaPortfolio: 'View Gallery',
    code: '404',
  },
};

export default function NotFound({ lang, onNavigateHome, onNavigatePortfolio }: NotFoundProps) {
  const t = translations[lang];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Decorative background "404" */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span className="font-serif text-[clamp(8rem,25vw,20rem)] leading-none text-white/[0.03] tracking-tight">
          {t.code}
        </span>
      </motion.div>

      {/* Center content */}
      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <Logo size="md" />
        </motion.div>

        {/* Thin separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="w-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mb-8"
        />

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="font-serif text-[clamp(1.5rem,4vw,2.5rem)] text-white font-light tracking-wide leading-tight mb-4"
        >
          {t.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="text-sm text-white/40 leading-relaxed mb-10 max-w-sm mx-auto"
        >
          {t.subtitle}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={onNavigateHome}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-mono text-[10px] tracking-widest uppercase font-semibold transition-all duration-300 cursor-pointer"
          >
            {t.ctaHome}
          </button>
          <button
            onClick={onNavigatePortfolio}
            className="px-6 py-2.5 bg-transparent hover:bg-white/5 text-white/60 border border-white/10 font-mono text-[10px] tracking-widest uppercase font-semibold transition-all duration-300 cursor-pointer"
          >
            {t.ctaPortfolio}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
