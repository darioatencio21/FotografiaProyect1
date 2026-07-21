import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { ActiveLanguage } from '../types';

interface Props {
  lang: ActiveLanguage;
  t: Record<string, string>;
}

const PIXIESET_USERNAME = 'miriamtellezphotography';
const PIXIESET_BASE = `https://${PIXIESET_USERNAME}.pixieset.com`;

const GALLERIES = [
  { title: 'Family Photo Session', date: 'July 12th, 2026', slug: 'familyphotosession-6', cover: '//images.pixieset.com/040806811/c40c792140f018c03cc84b37d302a401-large.jpg' },
  { title: 'Grad Session', date: 'June 23rd, 2026', slug: 'gradsession-2', cover: '//images.pixieset.com/574484711/625fbe1004fcae32d63deb79efcf949a-large.jpg' },
  { title: 'Grad Session', date: 'May 16th, 2026', slug: 'gradsession-1', cover: '//images.pixieset.com/507243611/8209d409fb8fa4ad4fe09265cfb74c64-large.jpg' },
  { title: 'Grad Session', date: 'May 9th, 2026', slug: 'gradsession', cover: '//images.pixieset.com/800196511/e9b4a2b3816f4ba27bf5a09943302a02-large.jpg' },
  { title: "Daniel's Grad Session", date: 'May 3rd, 2026', slug: 'danielsgradsession', cover: '//images.pixieset.com/169746511/8c8d7580a291813bf5047db11974bf4d-large.jpg' },
  { title: 'Engagement Session', date: 'May 6th, 2026', slug: 'engagementsession', cover: '//images.pixieset.com/405293511/8bc2f34b0559d33e7bafe6924580262f-large.jpg' },
  { title: "Mother's Day Session", date: 'April 24th, 2026', slug: 'mothersdaysession', cover: '//images.pixieset.com/740495411/00d372436608f27fda57659a413ae49f-large.jpg' },
  { title: "Mother's Day Mini Session", date: 'March 15th, 2026', slug: 'mothersdayminisession', cover: '//images.pixieset.com/018642111/9218b7677589b1b319f1fdeba99035fb-large.jpg' },
  { title: 'Joseph + Ingrid', date: 'November 8th, 2025', slug: 'josephingrid', cover: '//images.pixieset.com/677056901/d349fe04ed90de75e3dec92b6f837213-large.jpg' },
  { title: "Valentine's Day Session", date: 'February 14th, 2026', slug: 'valentinesdaysession-1', cover: '//images.pixieset.com/786984901/0ab5ea8083fb4f5fc143963ef2c9e122-large.jpg' },
  { title: 'California + Arizona Love', date: 'January 4th, 2026', slug: 'californiaarizonalove', cover: '//images.pixieset.com/158249701/51b3e73b474066d26394731998da947c-large.jpg' },
  { title: 'Christmas Session', date: 'December 13th, 2025', slug: 'christmassession-3', cover: '//images.pixieset.com/132023701/a9f15ebe7257a622cf4fe8218ce59fcc-large.jpg' },
  { title: 'Fall Session', date: 'November 29th, 2025', slug: 'fallsession', cover: '//images.pixieset.com/535389501/5045190f50a25b9c12d5a1322de31712-large.jpg' },
  { title: 'Family Session', date: 'November 2nd, 2025', slug: 'familysession-1', cover: '//images.pixieset.com/435467401/aeed6b215935b9f2b3ba4278fa9acd16-large.jpg' },
  { title: 'The Ledesma Family', date: 'November 9th, 2025', slug: 'theledesmafamily', cover: '//images.pixieset.com/670557401/3146113d68e368bbfafca626d6bf0725-large.jpg' },
  { title: 'Family Pictures', date: 'November 9th, 2025', slug: 'familypictures', cover: '//images.pixieset.com/323855401/ef4d757bd03a756ee48936aa1546a246-large.jpg' },
  { title: 'Chicago', date: 'October 19th, 2025', slug: 'chicago', cover: '//images.pixieset.com/659068301/17f19b24f311d3523e90262855a823c7-large.jpg' },
  { title: 'LLJ Chicago', date: 'October 18th, 2025', slug: 'lljchicago', cover: '//images.pixieset.com/338958301/3313306e6ff954ff13b086727abf07dd-large.jpg' },
  { title: 'The Hernandez Family', date: 'November 2nd, 2025', slug: 'thehernandezfamily-1', cover: '//images.pixieset.com/346258301/dfca3881776e556c5cdf221238caa92e-large.jpg' },
  { title: "Maria's Birthday Session", date: 'October 16th, 2025', slug: 'mariasbirthdaysession', cover: '//images.pixieset.com/389089101/a2209e34ed8d2151ba74219d82ba04b2-large.jpg' },
  { title: "Paty's Maternity Session", date: 'August 19th, 2025', slug: 'patysmaternitysession', cover: '//images.pixieset.com/77567599/9217bc0f2324639d4c688ea1ce8bba5f-large.jpg' },
  { title: "Jr + Citlali's Wedding", date: 'June 14th, 2025', slug: 'jrcitlaliswedding', cover: '//images.pixieset.com/26811779/b36122ca034277953f255f46af7e73ca-large.jpg' },
  { title: 'Quince Photo Session', date: 'March 8th, 2025', slug: 'quincephotosession', cover: '//images.pixieset.com/35219009/00213b39c5a09bf86b0b501443393d15-large.jpg' },
];

function GalleryCard({ gallery }: { gallery: typeof GALLERIES[number] }) {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={`${PIXIESET_BASE}/${gallery.slug}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden bg-dark-gray border border-white/5 hover:border-gold-400 transition-all duration-500 block"
    >
      {!imgError ? (
        <img
          src={`https:${gallery.cover}`}
          alt={gallery.title}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full aspect-[3/2] object-cover transition-all duration-[800ms] ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="w-full aspect-[3/2] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-gold-800/10 to-dark-gray">
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mb-3 group-hover:border-gold-400 transition-all duration-500">
            <ExternalLink size={16} className="text-white/30 group-hover:text-gold-400 transition-all duration-500" />
          </div>
          <h4 className="font-serif text-sm md:text-base text-hero font-light leading-snug group-hover:text-gold-400 transition-all duration-500">
            {gallery.title}
          </h4>
          <p className="text-[10px] font-mono tracking-wider text-white/40 mt-2">{gallery.date}</p>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-overlay/8 via-overlay/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-overlay/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-2 group-hover:translate-y-0">
        <h4 className="font-serif text-sm md:text-base text-hero font-light leading-snug">{gallery.title}</h4>
        <p className="text-[10px] font-mono tracking-wider text-hero/50 mt-1">{gallery.date}</p>
      </div>
    </a>
  );
}

export default function PixiesetGallery({ lang, t }: Props) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="font-serif text-xl text-gold-50 tracking-wide">
          {t.pixiesetSubtitle}
        </h3>
        <p className="text-xs text-white/50 leading-relaxed max-w-2xl">
          {t.pixiesetDescription}
        </p>
      </div>

      {/* CTA banner para buscar galería personal */}
      <a
        href={PIXIESET_BASE}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="border border-gold-500/20 hover:border-gold-500/50 rounded-lg p-6 transition-all duration-500 bg-gradient-to-r from-dark-gray via-dark-gray to-gold-950/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg text-gold-50 tracking-wide group-hover:text-gold-400 transition-colors duration-500">
                {t.pixiesetSearchTitle}
              </h3>
              <p className="text-xs text-white/50 leading-relaxed mt-1 max-w-lg">
                {t.pixiesetSearchDesc}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 border border-gold-500/30 rounded font-mono text-[10px] tracking-widest uppercase text-gold-400 group-hover:bg-gold-500/10 transition-all duration-500 whitespace-nowrap">
              {t.pixiesetSearchBtn}
            </span>
          </div>
        </div>
      </a>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {GALLERIES.map((gallery) => (
          <GalleryCard key={gallery.slug} gallery={gallery} />
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <a
          href={PIXIESET_BASE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 rounded font-mono text-[10px] tracking-widest uppercase text-white hover:border-gold-400 hover:text-gold-400 transition-all duration-300"
        >
          <ExternalLink size={14} />
          {t.pixiesetViewAll}
        </a>
      </div>
    </div>
  );
}
