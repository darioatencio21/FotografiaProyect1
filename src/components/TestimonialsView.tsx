import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ActiveLanguage, Testimonial } from '../types';

interface TestimonialsViewProps {
  testimonials: Testimonial[];
  lang: ActiveLanguage;
  onSubmitTestimonial: (testimonial: Testimonial) => void;
}

export default function TestimonialsView({ testimonials, lang, onSubmitTestimonial }: TestimonialsViewProps) {
  const [review, setReview] = useState({ name: '', role: '', comment: '', rating: 5 });
  const [reviewSent, setReviewSent] = useState(false);

  const approvedTestimonials = testimonials.filter(item => item.approved !== false);

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
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto space-y-4"
      >
        <span className="text-[10px] font-mono text-white/70 tracking-widest uppercase block">
          {lang === 'es' ? 'Testimonios' : 'Testimonials'}
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-white tracking-wide">
          {lang === 'es' ? 'Lo que dicen nuestros clientes' : 'What our clients say'}
        </h1>
        <p className="text-xs text-white/55 leading-relaxed">
          {lang === 'es'
            ? 'Historias reales de sesiones que se convirtieron en recuerdos inolvidables.'
            : 'Real stories from sessions that became unforgettable memories.'}
        </p>
      </motion.div>

      {approvedTestimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {approvedTestimonials.map((testimonial, idx) => (
            <motion.article
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="bg-dark-gray/70 border border-white/10 rounded-lg p-6 space-y-4"
            >
              <div className="flex gap-1 text-white/90">
                {Array.from({ length: testimonial.rating }).map((_, index) => (
                  <span key={index}>★</span>
                ))}
              </div>
              <p className="font-serif text-base text-white/80 leading-relaxed">"{testimonial.comment}"</p>
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs text-white/90 font-medium">{testimonial.name}</p>
                <p className="text-[9px] font-mono text-white/35 uppercase tracking-wider">{testimonial.role}</p>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-white/40">
          <p className="font-serif text-lg">{lang === 'es' ? 'Aún no hay testimonios' : 'No testimonials yet'}</p>
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-dark-gray/70 border border-white/10 rounded-lg p-6 md:p-8">
        {reviewSent ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6 space-y-3"
          >
            <p className="font-serif text-xl text-white/90">
              {lang === 'es' ? 'Gracias por compartir tu experiencia' : 'Thank you for sharing your experience'}
            </p>
            <p className="text-xs text-white/50">
              {lang === 'es'
                ? 'Tu comentario ha sido recibido y quedará visible una vez aprobado.'
                : 'Your comment has been received and will be visible once approved.'}
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="text-center">
              <span className="text-[10px] font-mono text-white/70 tracking-widest uppercase">
                {lang === 'es' ? 'Comparte tu experiencia' : 'Share your experience'}
              </span>
              <h3 className="font-serif text-xl text-white mt-1">
                {lang === 'es' ? '¿Trabajaste conmigo?' : 'Have you worked with me?'}
              </h3>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/45">
                {lang === 'es' ? 'Valoración' : 'Rating'}
              </span>
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setReview(prev => ({ ...prev, rating }))}
                  aria-label={`${rating} ${lang === 'es' ? 'estrellas' : 'stars'}`}
                  className="text-white/80 hover:scale-110 transition-transform text-xl"
                >
                  {rating <= review.rating ? '★' : '☆'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                required
                value={review.name}
                onChange={event => setReview(prev => ({ ...prev, name: event.target.value }))}
                placeholder={lang === 'es' ? 'Tu nombre' : 'Your name'}
                className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
              />
              <input
                value={review.role}
                onChange={event => setReview(prev => ({ ...prev, role: event.target.value }))}
                placeholder={lang === 'es' ? 'Tipo de sesión (opcional)' : 'Session type (optional)'}
                className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
              />
            </div>

            <textarea
              required
              rows={4}
              value={review.comment}
              onChange={event => setReview(prev => ({ ...prev, comment: event.target.value }))}
              placeholder={lang === 'es' ? 'Escribe tu comentario sobre el servicio...' : 'Write your comment about the service...'}
              className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-white/30 resize-y"
            />

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!review.name.trim() || !review.comment.trim()}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white border border-white/10 rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold transition-colors"
              >
                {lang === 'es' ? 'Enviar comentario' : 'Send comment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
