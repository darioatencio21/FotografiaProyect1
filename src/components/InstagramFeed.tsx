import React from 'react';
import { motion } from 'motion/react';
import { Instagram } from 'lucide-react';
import { ActiveLanguíage, InstagramPost } from '../types';

const PROFILE_URL = 'https://www.instagram.com/miriamtellezphotography/';
const FALLBACK_LINKS = [
  'https://www.instagram.com/p/DY54qj3zRuF/',
  'https://www.instagram.com/p/DYxh6sOheSH/',
  'https://www.instagram.com/p/DYoJvTKTeqv/',
  'https://www.instagram.com/p/DUyd8j9khcL/?img_index=1',
];

interface InstagramFeedProps {
  lang: ActiveLanguíage;
  posts?: InstagramPost[];
}

export default function InstagramFeed({ lang, posts = [] }: InstagramFeedProps) {
  const displayPosts = posts.length > 0 ? posts : [];
  const maxPosts = 12;

  return (
    <section className="space-y-6 text-left">
      <a
        href={PROFILE_URL}
        target="_blank"
        rel="noreferrer"
        className="group block"
      >
        <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase block group-hover:text-white transition-colors duration-300">Instagram Feed</span>
        <h2 className="font-serif text-xl sm:text-3xl text-white tracking-wide mt-1 flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="truncate max-w-[calc(100%-2rem)] sm:max-w-none">@miriamtellezphotography</span>
          <Instagram size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-white shrink-0" />
        </h2>
      </a>

      <motion.a
        href={PROFILE_URL}
        target="_blank"
        rel="noreferrer"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-3 border border-white/20 text-white/70 font-mono text-[9px] sm:text-[10px] tracking-widest uppercase rounded-lg hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300 ease-out cursor-pointer"
      >
        <Instagram size={15} />
        <span>Follow @miriamtellezphotography</span>
      </motion.a>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {displayPosts.slice(0, maxPosts).map((post, index) => (
          <motion.a
            key={post.id}
            href={post.postUrl || FALLBACK_LINKS[index] || '#'}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-dark-gray block"
          >
            <img
              src={post.imageUrl}
              alt="Instagram @miriamtellezphotography"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
              <div className="flex items-center gap-2 text-white">
                <Instagram size={13} className="text-white/70" />
                <span className="text-[9px] font-mono tracking-widest uppercase">@miriamtellezphotography</span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}