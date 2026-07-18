import React from 'react';
import { motion } from 'motion/react';
import { PhotographerProfile, ActiveLanguage } from '../types';
import { MILESTONES } from '../data/mockData';

interface Props {
  profile: PhotographerProfile;
  lang: ActiveLanguage;
  t: Record<string, string>;
}

function getMilestone(m: (typeof MILESTONES)[number], lang: ActiveLanguage) {
  const key = lang === 'es' ? 'es' : lang === 'pt' ? 'pt' : 'en';
  return {
    title: m[`title_${key}` as keyof typeof m] as string,
    description: m[`description_${key}` as keyof typeof m] as string,
  };
}

function getText(
  profile: PhotographerProfile,
  lang: ActiveLanguage,
  t: Record<string, string>,
  field: 'aboutTitle' | 'aboutText1' | 'aboutText2'
) {
  const key = lang === 'es' ? 'es' : lang === 'pt' ? 'pt' : 'en';
  const profileField = `${field}_${key}` as keyof PhotographerProfile;
  return (profile[profileField] as string) || t[field] || '';
}

interface SectionLabelProps {
  children: React.ReactNode;
  delay?: number;
}

function SectionLabel({ children, delay = 0 }: SectionLabelProps) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="block font-mono text-[10px] tracking-[0.25em] text-gold-400 uppercase"
    >
      {children}
    </motion.span>
  );
}

interface AnimatedDividerProps {
  delay?: number;
}

function AnimatedDivider({ delay = 0 }: AnimatedDividerProps) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="h-px bg-border origin-left"
      style={{ width: 'clamp(80px, 40%, 200px)' }}
    />
  );
}

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  key?: string;
}

function FadeIn({ children, delay = 0, y = 30, className = '' }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutSection({ profile, lang, t }: Props) {
  const aboutTitle = getText(profile, lang, t, 'aboutTitle');
  const aboutText1 = getText(profile, lang, t, 'aboutText1');
  const aboutText2 = getText(profile, lang, t, 'aboutText2');

  const avatarUrl =
    profile.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=800';

  return (
    <div className="space-y-20 md:space-y-28 text-left">
      {/* ═══════════════════════════════════════════════ */}
      {/* BIOGRAPHY — Editorial opening with portrait     */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
        {/* Photo column */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-5"
        >
          <div className="aspect-[3/4] md:aspect-[4/5] relative overflow-hidden">
            <img
              src={avatarUrl}
              alt={profile.name || 'Miriam Campos'}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Text column */}
        <div className="md:col-span-7">
          <SectionLabel>BIOGRAPHY</SectionLabel>

          <FadeIn delay={0.15} className="mt-4 md:mt-6">
            <h2 className="font-serif text-[clamp(1.75rem,4vw,3rem)] text-white leading-tight tracking-tight">
              {aboutTitle}
            </h2>
          </FadeIn>

          <div className="mt-6 md:mt-8">
            <AnimatedDivider delay={0.3} />
          </div>

          <div className="mt-8 md:mt-10 max-w-3xl space-y-5 md:space-y-6">
            <FadeIn delay={0.2} y={20}>
              <p className="font-sans text-[clamp(0.8125rem,1.5vw,1rem)] text-white/85 leading-[1.8] md:leading-[1.9] tracking-wide">
                {aboutText1}
              </p>
            </FadeIn>
            <FadeIn delay={0.3} y={20}>
              <p className="font-sans text-[clamp(0.8125rem,1.5vw,1rem)] text-white/75 leading-[1.8] md:leading-[1.9] tracking-wide">
                {aboutText2}
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* PROFESSIONAL MILESTONES — Vertical Timeline      */}
      {/* ═══════════════════════════════════════════════ */}
      <section>
        <SectionLabel>{t.experience || 'EXPERIENCE'}</SectionLabel>

        <FadeIn delay={0.15} className="mt-4 md:mt-6">
          <h2 className="font-serif text-[clamp(1.5rem,3.5vw,2.5rem)] text-white leading-tight tracking-tight">
            {t.milestonesTitle || 'Una Década de Luz'}
          </h2>
        </FadeIn>

        <div className="mt-8 md:mt-10">
          <AnimatedDivider delay={0.3} />
        </div>

        <div className="relative mt-10 md:mt-14">
          {/* Vertical timeline line — hidden on mobile, visible md+ */}
          <div className="hidden md:block absolute left-[60px] top-0 bottom-0 w-px bg-border/60" />

          {/* Mobile timeline line */}
          <div className="md:hidden absolute left-5 top-0 bottom-0 w-px bg-border/40" />

          {MILESTONES.map((milestone, idx) => {
            const { title, description } = getMilestone(milestone, lang);
            const isLast = idx === MILESTONES.length - 1;

            return (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                  duration: 0.7,
                  delay: idx * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`relative pl-12 md:pl-[100px] ${isLast ? '' : 'pb-14 md:pb-20'}`}
              >
                {/* Timeline dot */}
                <div className="absolute left-[17px] md:left-[52px] top-1 w-2.5 h-2.5 md:w-4 md:h-4 rounded-full bg-gold-400 border-2 border-dark shadow-[0_0_0_3px_#EFD2B4]" />

                {/* Year — on mobile: above title. On desktop: to the left of line */}
                <div className="md:absolute md:left-0 md:w-[52px] md:text-right md:pr-6 md:top-0">
                  <span className="font-serif text-[clamp(2rem,6vw,4rem)] text-gold-200/50 leading-none block md:text-right">
                    {milestone.year}
                  </span>
                </div>

                {/* Content */}
                <div>
                  {/* Year on mobile (above title) */}
                  <span className="md:hidden font-serif text-2xl text-gold-300/60 leading-none block mb-2">
                    {milestone.year}
                  </span>
                  <h3 className="font-serif text-lg md:text-xl lg:text-2xl text-white leading-snug">
                    {title}
                  </h3>
                  <p className="mt-2 md:mt-3 font-sans text-[clamp(0.75rem,1.3vw,0.9rem)] text-white/65 leading-relaxed max-w-2xl">
                    {description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* PHILOSOPHY — Three pillars of approach          */}
      {/* ═══════════════════════════════════════════════ */}
      <section>
        <SectionLabel>{t.philosophyTitle || 'MI ENFOQUE'}</SectionLabel>

        <FadeIn delay={0.15} className="mt-4 md:mt-6">
          <h2 className="font-serif text-[clamp(1.5rem,3.5vw,2.5rem)] text-white leading-tight tracking-tight">
            {t.philosophyTitle || 'My Approach'}
          </h2>
        </FadeIn>

        <div className="mt-6 md:mt-8">
          <AnimatedDivider delay={0.3} />
        </div>

        <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-14">
          {[
            {
              title: t.philosophyPillar1 || 'Natural Light',
              desc: t.philosophyPillar1Desc || '',
              delay: 0.1,
            },
            {
              title: t.philosophyPillar2 || 'Composition',
              desc: t.philosophyPillar2Desc || '',
              delay: 0.2,
            },
            {
              title: t.philosophyPillar3 || 'Emotion',
              desc: t.philosophyPillar3Desc || '',
              delay: 0.3,
            },
          ].map((pillar) => (
            <FadeIn key={pillar.title} delay={pillar.delay} y={25}>
              <div className="space-y-3 md:space-y-4">
                <div className="w-8 h-px bg-gold-400/60" />
                <h3 className="font-serif text-lg md:text-xl text-white">{pillar.title}</h3>
                <p className="font-sans text-[clamp(0.75rem,1.2vw,0.875rem)] text-white/60 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
