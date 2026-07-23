import React from 'react';
import { motion } from 'motion/react';
import { Instagram } from 'lucide-react';
import { ActiveLanguíage } from '../types';

const PROFILE_URL = 'https://www.instagram.com/miriamtellezphotography/';

interface InstagramPost {
  image: string;
}

const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    image: 'https://scontent.cdninstagram.com/v/t51.82787-15/707964269_18327073213253400_8994383767332361367_n.jpg?stp=c273.0.819.819a_dst-jpg_e35_s640x640_tt6&_nc_cat=100&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0FST1VTRUxfSVRFTS5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=JAsZ-KikDjUQ7kNvwEsWDfZ&_nc_oc=AdoORdX4R6ib0tBQYHNB0D95_Hx_3Ot-Ak5DSMiGfo9mxlsvVVba1A0bb8eW1vd3kuU&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=29Y_nin7xujls-6X2j8Xeg&_nc_ss=7ca02&oh=00_AQDlf4ZiqPNhuLvw5G5Dl0QRUTxTv222xjW9ZR6pvkuOmg&oe=6A661BE3',
  },
  {
    image: 'https://scontent.cdninstagram.com/v/t51.82787-15/708414410_18326633749253400_8240328631609863067_n.jpg?stp=c364.0.1092.1092a_dst-jpg_e35_s640x640_tt6&_nc_cat=108&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=oJskNBIKmlUQ7kNvwFzszig&_nc_oc=Adql3TyYbwDTVzbBjhpr4SZ1JdErZzjUAvwsiECyVJJExgTQ3V4DxNQehYEkNxy7UPo&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=gPBgP15WE765pRFbYf3GGQ&_nc_ss=7ca02&oh=00_AQDjk5Q39q4TVf_GrUXkuZt7CcW1TTBxwcWUmkJU_PVaYg&oe=6A662781',
  },
  {
    image: 'https://scontent.cdninstagram.com/v/t51.82787-15/638297530_18314062804253400_9182733576136354253_n.jpg?stp=c288.0.864.864a_dst-jpg_e35_s640x640_tt6&_nc_cat=101&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0FST1VTRUxfSVRFTS5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=VYoShP6f-EIQ7kNvwEWUKx4&_nc_oc=Ado_trHMtCfgi_uzqa4-MQdn4QpJ39RLDbyNcL-oik-r6OVVThU3bXZAyuus5SCXueY&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=EPnbybIILnVHaJx0d06pHQ&_nc_ss=7ca02&oh=00_AQD3erzVFeSFxnvr_O2NqwHmP8JIUEsx5LNIv-UrdBO6MA&oe=6A6636C5',
  },
  {
    image: 'https://scontent.cdninstagram.com/v/t51.82787-15/632611294_18313530577253400_1296497098266015465_n.jpg?stp=c273.0.819.819a_dst-jpg_e35_s640x640_tt6&_nc_cat=107&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0FST1VTRUxfSVRFTS5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=DHOwwpo9DSsQ7kNvwEzYTPt&_nc_oc=AdrZ0zLSwYlC86X4MB8u-GD6Qu_16a-1zLQPxK98pmmoCUxX-d0aEvQwpmSnKJXgmnc&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=tEFEKJ460j_aXws7S5CC5A&_nc_ss=7ca02&oh=00_AQBCzp9sZqFt9oSUll64MaMLB1Yz27qKvyXKnouPwARNSA&oe=6A662D7C',
  },
];

const INSTAGRAM_POST_LINKS = [
  'https://www.instagram.com/p/DY54qj3zRuF/',
  'https://www.instagram.com/p/DYxh6sOheSH/',
  'https://www.instagram.com/p/DYoJvTKTeqv/',
  'https://www.instagram.com/p/DUyd8j9khcL/?img_index=1',
];

interface InstagramFeedProps {
  lang: ActiveLanguíage;
}

export default function InstagramFeed({ lang }: InstagramFeedProps) {
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
        {INSTAGRAM_POSTS.map((post, index) => (
          <motion.a
            key={index}
            href={INSTAGRAM_POST_LINKS[index]}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-dark-gray block"
          >
            <img
              src={post.image}
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
