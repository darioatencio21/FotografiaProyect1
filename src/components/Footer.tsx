/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, Send } from 'lucide-react';
import { Instagram, Facebook } from './BrandIcons';
import { ActiveLanguage } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { Logo } from './Logo';
import { BRAND_NAME, SOCIAL } from '../config/site';

interface FooterProps {
  onSetView: (view: string) => void;
  lang: ActiveLanguage;
}

function Footer({ onSetView, lang }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = TRANSLATIONS[lang];

  const handleNav = (viewId: string) => {
    onSetView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }, 1200);
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-dark border-t border-white/10 pt-16 pb-12 px-6 lg:px-12 text-left relative z-10">
      <div className="max-w-7xl mx-auto pb-12 border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Brand Column (Cols 4) */}
        <div className="md:col-span-4 space-y-4 text-left">
          <div className="flex items-center space-x-3">
            <Logo size="sm" />
            <span className="font-serif text-sm font-semibold tracking-[0.25em] text-white uppercase">
              Miriam Tellez
            </span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed max-w-sm">
            Fine-Art and high-end editorial photography commissions. Captured under golden proportions, rendering raw emotion with absolute Leica and Hasselblad precision.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${lang === 'es' ? 'Instagram de Miriam Tellez Photography' : 'Instagram of Miriam Tellez Photography'}`} className="text-white/65 hover:text-white transition-colors">
              <Instagram size={16} />
            </a>
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label={`${lang === 'es' ? 'Facebook de Miriam Tellez Photography' : 'Facebook of Miriam Tellez Photography'}`} className="text-white/65 hover:text-white transition-colors">
              <Facebook size={16} />
            </a>
          </div>
        </div>

        {/* Links Column 1 (Cols 3) */}
        <div className="md:col-span-3 space-y-3.5 text-left">
          <h5 className="text-xs font-mono tracking-widest text-white/60 uppercase">EXPLORE</h5>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => handleNav('home')} className="text-white/70 hover:text-white transition-colors cursor-pointer">
                {t.navHome}
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('about')} className="text-white/70 hover:text-white transition-colors cursor-pointer">
                {t.navAbout}
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('portfolio')} className="text-white/70 hover:text-white transition-colors cursor-pointer">
                {t.navPortfolio}
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('services')} className="text-white/70 hover:text-white transition-colors cursor-pointer">
                {t.navServices}
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('testimonials')} className="text-white/70 hover:text-white transition-colors cursor-pointer">
                {lang === 'es' ? 'Testimonios' : 'Testimonials'}
              </button>
            </li>
          </ul>
        </div>

        {/* Links Column 2 (Cols 2) */}
        <div className="md:col-span-2 space-y-3.5 text-left">
          <h5 className="text-xs font-mono tracking-widest text-white/60 uppercase">STUDIO</h5>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => handleNav('client-portal')} className="text-white/70 hover:text-white transition-colors cursor-pointer">
                {t.navClientPortal}
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('faq')} className="text-white/70 hover:text-white transition-colors cursor-pointer">
                {t.navFaq}
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('contact')} className="text-white/70 hover:text-white transition-colors cursor-pointer">
                {t.navContact}
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter Column (Cols 3) */}
        <div className="md:col-span-3 space-y-3.5 text-left">
          <h5 className="text-xs font-mono tracking-widest text-white/60 uppercase">{lang === 'es' ? 'BOLETIN' : 'NEWSLETTER'}</h5>
          <p className="text-[11px] text-white/70 leading-relaxed">
            {lang === 'es'
              ? 'Suscribite a nuestro journal para alertas de reservas en destinos y clases magistrales de luz.'
              : 'Subscribe to our journal for seasonal destination booking alerts & lighting masterclasses.'}
          </p>

          <form onSubmit={handleSubscribe} className="relative mt-2 flex gap-2" aria-label={lang === 'es' ? 'Suscripción al boletín' : 'Newsletter subscription'}>
            <input
              type="email"
              required
              aria-label={lang === 'es' ? 'Tu dirección de email' : 'Your email address'}
              disabled={isSubmitting || isSubscribed}
              placeholder={lang === 'es' ? 'tu@email.com' : 'your@email.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 min-w-0 bg-charcoal border border-white/10 rounded px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30"
            />
            <button
              type="submit"
              disabled={isSubmitting || isSubscribed}
              aria-label={lang === 'es' ? 'Suscribirse' : 'Subscribe'}
              className="px-3.5 bg-white text-dark hover:bg-white/80 font-mono text-[9px] tracking-widest uppercase font-bold rounded transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-3 h-3 border border-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={11} />
                  <span className="hidden sm:inline">{lang === 'es' ? 'Suscribirse' : 'Subscribe'}</span>
                </>
              )}
            </button>
          </form>

          <AnimatePresence>
            {isSubscribed && (
              <motion.p
                className="text-[10px] font-mono text-white/90 uppercase mt-2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {lang === 'es' ? 'BIENVENIDO AL CÍRCULO DEL JOURNAL' : 'WELCOMED TO THE JOURNAL CIRCLE'}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>

      {/* Footer copyright block */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-white/65 space-y-4 md:space-y-0">
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
          <span>&copy; {new Date().getFullYear()} {BRAND_NAME}. {t.footerRights}</span>
          <button onClick={() => handleNav('privacy')} className="hover:text-white transition-colors cursor-pointer">{t.privacy}</button>
          <button onClick={() => handleNav('terms')} className="hover:text-white transition-colors cursor-pointer">{t.terms}</button>
        </div>

        <button
          onClick={handleScrollTop}
          className="p-2.5 border border-white/10 rounded-full hover:border-white/30 text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer group"
          title="Back to Top"
        >
          <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </footer>
  );
}

export default memo(Footer);
