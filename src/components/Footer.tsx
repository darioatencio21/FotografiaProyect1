/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, Facebook, Mail, ArrowUp, Send, Check } from 'lucide-react';
import { ActiveLanguíage, Testimonial } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { Logo } from './Logo';

interface FooterProps {
  onSetView: (view: string) => void;
  lang: ActiveLanguíage;
  testimonials: Testimonial[];
  onSubmitTestimonial: (testimonial: Testimonial) => void;
}

export default function Footer({ onSetView, lang, testimonials, onSubmitTestimonial }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [review, setReview] = useState({ name: '', role: '', comment: '', rating: 5 });
  const [reviewSent, setReviewSent] = useState(false);

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

  const handleTestimonials = () => {
    document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const approvedTestimonials = testimonials.filter(item => item.approved !== false).slice(0, 3);

  const handleReviewSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!review.name.trim() || !review.comment.trim()) return;
    onSubmitTestimonial({
      id: `testimonial-${Date.now()}`,
      name: review.name.trim(),
      role: review.role.trim() || (lang === 'es' ? 'Cliente' : 'Client'),
      comment: review.comment.trim(),
      rating: review.rating,
      image: '',
      approved: false,
    });
    setReview({ name: '', role: '', comment: '', rating: 5 });
    setReviewSent(true);
  };

  return (
    <footer className="bg-dark border-t border-white/10 pt-16 pb-12 px-6 lg:px-12 text-left relative z-10">
      <div className="max-w-7xl mx-auto space-y-12 pb-12 border-b border-white/10">
        <section id="testimonials" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-white/90 tracking-widest uppercase">{lang === 'es' ? 'Testimonios' : 'Testimonials'}</span>
              <h2 className="font-serif text-3xl text-white mt-1">{lang === 'es' ? 'Lo que dicen nuestros clientes' : 'What our clients say'}</h2>
            </div>
          </div>
          {approvedTestimonials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {approvedTestimonials.map(testimonial => (
                <article key={testimonial.id} className="bg-dark-gray/70 border border-white/10 rounded-lg p-5 space-y-4">
                  <div className="flex gap-1 text-white/90">{Array.from({ length: testimonial.rating }).map((_, index) => <span key={index}>★</span>)}</div>
                  <p className="font-serif text-base text-white/80 leading-relaxed">“{testimonial.comment}”</p>
                  <div className="border-t border-white/10 pt-3">
                    <p className="text-xs text-white/90">{testimonial.name}</p>
                    <p className="text-[9px] font-mono text-white/35 uppercase tracking-wider">{testimonial.role}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="max-w-2xl bg-dark-gray/70 border border-white/10 rounded-lg p-5 md:p-6">
            {reviewSent ? (
              <p className="text-sm text-white/90">{lang === 'es' ? 'Gracias. Tu comentario queda pendiente de revisión.' : 'Thank you. Your comment is pending review.'}</p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-white/90 tracking-widest uppercase">{lang === 'es' ? 'Comparte tu experiencia' : 'Share your experience'}</span>
                  <h3 className="font-serif text-xl text-white mt-1">{lang === 'es' ? '¿Trabajaste conmigo?' : 'Have you worked with me?'}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/45 mr-2">{lang === 'es' ? 'Valoración' : 'Rating'}</span>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button key={rating} type="button" onClick={() => setReview(prev => ({ ...prev, rating }))} aria-label={`${rating} ${lang === 'es' ? 'estrellas' : 'stars'}`} className="text-white/90 hover:scale-110 transition-transform">{rating <= review.rating ? '★' : '☆'}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input required value={review.name} onChange={event => setReview(prev => ({ ...prev, name: event.target.value }))} placeholder={lang === 'es' ? 'Tu nombre' : 'Your name'} className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-white/30" />
                  <input value={review.role} onChange={event => setReview(prev => ({ ...prev, role: event.target.value }))} placeholder={lang === 'es' ? 'Tipo de sesión (opcional)' : 'Session type (optional)'} className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-white/30" />
                </div>
                <textarea required rows={4} value={review.comment} onChange={event => setReview(prev => ({ ...prev, comment: event.target.value }))} placeholder={lang === 'es' ? 'Escribe tu comentario sobre el servicio...' : 'Write your comment about the service...'} className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-white/30 resize-y" />
                <div className="flex justify-end"><button type="submit" disabled={!review.name.trim() || !review.comment.trim()} className="px-5 py-2.5 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white border border-white/10 rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold transition-colors">{lang === 'es' ? 'Enviar comentario' : 'Send comment'}</button></div>
              </form>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Brand Column (Cols 4) */}
        <div className="md:col-span-4 space-y-4 text-left">
          <div className="flex items-center space-x-3">
            <Logo size="sm" />
            <span className="font-serif text-sm font-semibold tracking-[0.25em] text-white uppercase">
              Miriam Campos
            </span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed max-w-sm">
            Fine-Art and high-end editorial photography commissions. Captured under golden proportions, rendering raw emotion with absolute Leica and Hasselblad precision.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="https://www.instagram.com/miriamtellezphotography/" target="_blank" rel="noreferrer" className="text-white/65 hover:text-white transition-colors">
              <Instagram size={16} />
            </a>
            <a href="https://www.facebook.com/mifephotography/?_rdr" target="_blank" rel="noreferrer" className="text-white/65 hover:text-white transition-colors">
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
              <button onClick={handleTestimonials} className="text-white/70 hover:text-white transition-colors cursor-pointer">
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
          <h5 className="text-xs font-mono tracking-widest text-white/60 uppercase">NEWSLETTER</h5>
          <p className="text-[11px] text-white/70 leading-relaxed">
            Subscribe to our journal for seasonal destination booking alerts & lighting masterclasses.
          </p>

          <form onSubmit={handleSubscribe} className="relative mt-2">
            <input
              type="email"
              required
              disabled={isSubmitting || isSubscribed}
              placeholder="studio@client.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-charcoal border border-white/10 rounded px-3.5 py-2.5 pr-10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30"
            />
            <button
              type="submit"
              disabled={isSubmitting || isSubscribed}
              className="absolute right-1 top-1 bottom-1 px-2.5 bg-white/10 hover:bg-white/15 text-white rounded transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : isSubscribed ? (
                <Check size={12} />
              ) : (
                <Send size={11} />
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
                WELCOMED TO THE JOURNAL CIRCLE
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>

      {/* Footer copyright block */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-white/65 space-y-4 md:space-y-0">
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
          <span>&copy; {new Date().getFullYear()} Estudio Camaleón. {t.footerRights}</span>
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
