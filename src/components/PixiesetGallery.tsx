import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { ActiveLanguage } from '../types';

interface Props {
  lang: ActiveLanguage;
  t: Record<string, string>;
}

const PIXIESET_USERNAME = 'miriamtellezphotography';
const PIXIESET_BASE = `https://${PIXIESET_USERNAME}.pixieset.com`;

type GalleryType = 'family' | 'grad' | 'wedding' | 'maternity' | 'love' | 'mini' | 'portrait';

interface GalleryItem {
  title: string;
  /** ISO date used for chronological sorting (newest first). */
  iso: string;
  date: string;
  slug: string;
  cover: string;
  type: GalleryType;
}

const GALLERIES: GalleryItem[] = [
  { title: 'Family Photo Session', iso: '2026-07-12', date: 'July 12th, 2026', slug: 'familyphotosession-6', cover: '//images.pixieset.com/040806811/c40c792140f018c03cc84b37d302a401-large.jpg', type: 'family' },
  { title: 'Grad Session — June', iso: '2026-06-23', date: 'June 23rd, 2026', slug: 'gradsession-2', cover: '//images.pixieset.com/574484711/625fbe1004fcae32d63deb79efcf949a-large.jpg', type: 'grad' },
  { title: 'Grad Session — May', iso: '2026-05-16', date: 'May 16th, 2026', slug: 'gradsession-1', cover: '//images.pixieset.com/507243611/8209d409fb8fa4ad4fe09265cfb74c64-large.jpg', type: 'grad' },
  { title: 'Grad Session — Early May', iso: '2026-05-09', date: 'May 9th, 2026', slug: 'gradsession', cover: '//images.pixieset.com/800196511/e9b4a2b3816f4ba27bf5a09943302a02-large.jpg', type: 'grad' },
  { title: "Daniel's Grad Session", iso: '2026-05-03', date: 'May 3rd, 2026', slug: 'danielsgradsession', cover: '//images.pixieset.com/169746511/8c8d7580a291813bf5047db11974bf4d-large.jpg', type: 'grad' },
  { title: 'Engagement Session', iso: '2026-05-06', date: 'May 6th, 2026', slug: 'engagementsession', cover: '//images.pixieset.com/405293511/8bc2f34b0559d33e7bafe6924580262f-large.jpg', type: 'love' },
  { title: "Mother's Day Session", iso: '2026-04-24', date: 'April 24th, 2026', slug: 'mothersdaysession', cover: '//images.pixieset.com/740495411/00d372436608f27fda57659a413ae49f-large.jpg', type: 'maternity' },
  { title: "Mother's Day Mini Session", iso: '2026-03-15', date: 'March 15th, 2026', slug: 'mothersdayminisession', cover: '//images.pixieset.com/018642111/9218b7677589b1b319f1fdeba99035fb-large.jpg', type: 'mini' },
  { title: 'Joseph + Ingrid', iso: '2025-11-08', date: 'November 8th, 2025', slug: 'josephingrid', cover: '//images.pixieset.com/677056901/d349fe04ed90de75e3dec92b6f837213-large.jpg', type: 'wedding' },
  { title: "Valentine's Day Session", iso: '2026-02-14', date: 'February 14th, 2026', slug: 'valentinesdaysession-1', cover: '//images.pixieset.com/786984901/0ab5ea8083fb4f5fc143963ef2c9e122-large.jpg', type: 'love' },
  { title: 'California + Arizona Love', iso: '2026-01-04', date: 'January 4th, 2026', slug: 'californiaarizonalove', cover: '//images.pixieset.com/158249701/51b3e73b474066d26394731998da947c-large.jpg', type: 'love' },
  { title: 'Christmas Session', iso: '2025-12-13', date: 'December 13th, 2025', slug: 'christmassession-3', cover: '//images.pixieset.com/132023701/a9f15ebe7257a622cf4fe8218ce59fcc-large.jpg', type: 'mini' },
  { title: 'Fall Session', iso: '2025-11-29', date: 'November 29th, 2025', slug: 'fallsession', cover: '//images.pixieset.com/535389501/5045190f50a25b9c12d5a1322de31712-large.jpg', type: 'mini' },
  { title: 'Family Session', iso: '2025-11-02', date: 'November 2nd, 2025', slug: 'familysession-1', cover: '//images.pixieset.com/435467401/aeed6b215935b9f2b3ba4278fa9acd16-large.jpg', type: 'family' },
  { title: 'The Ledesma Family', iso: '2025-11-09', date: 'November 9th, 2025', slug: 'theledesmafamily', cover: '//images.pixieset.com/670557401/3146113d68e368bbfafca626d6bf0725-large.jpg', type: 'family' },
  { title: 'Family Pictures', iso: '2025-11-09', date: 'November 9th, 2025', slug: 'familypictures', cover: '//images.pixieset.com/323855401/ef4d757bd03a756ee48936aa1546a246-large.jpg', type: 'family' },
  { title: 'Chicago', iso: '2025-10-19', date: 'October 19th, 2025', slug: 'chicago', cover: '//images.pixieset.com/659068301/17f19b24f311d3523e90262855a823c7-large.jpg', type: 'portrait' },
  { title: 'LLJ Chicago', iso: '2025-10-18', date: 'October 18th, 2025', slug: 'lljchicago', cover: '//images.pixieset.com/338958301/3313306e6ff954ff13b086727abf07dd-large.jpg', type: 'portrait' },
  { title: 'The Hernandez Family', iso: '2025-11-02', date: 'November 2nd, 2025', slug: 'thehernandezfamily-1', cover: '//images.pixieset.com/346258301/dfca3881776e556c5cdf221238caa92e-large.jpg', type: 'family' },
  { title: "Maria's Birthday Session", iso: '2025-10-16', date: 'October 16th, 2025', slug: 'mariasbirthdaysession', cover: '//images.pixieset.com/389089101/a2209e34ed8d2151ba74219d82ba04b2-large.jpg', type: 'portrait' },
  { title: "Paty's Maternity Session", iso: '2025-08-19', date: 'August 19th, 2025', slug: 'patysmaternitysession', cover: '//images.pixieset.com/77567599/9217bc0f2324639d4c688ea1ce8bba5f-large.jpg', type: 'maternity' },
  { title: "Jr + Citlali's Wedding", iso: '2025-06-14', date: 'June 14th, 2025', slug: 'jrcitlaliswedding', cover: '//images.pixieset.com/26811779/b36122ca034277953f255f46af7e73ca-large.jpg', type: 'wedding' },
  { title: 'Quince Photo Session', iso: '2025-03-08', date: 'March 8th, 2025', slug: 'quincephotosession', cover: '//images.pixieset.com/35219009/00213b39c5a09bf86b0b501443393d15-large.jpg', type: 'portrait' },
];

const TYPE_LABELS: Record<GalleryType, { es: string; en: string }> = {
  family: { es: 'Familia', en: 'Family' },
  grad: { es: 'Graduación', en: 'Grad' },
  wedding: { es: 'Bodas', en: 'Weddings' },
  maternity: { es: 'Maternidad', en: 'Maternity' },
  love: { es: 'Parejas', en: 'Couples' },
  mini: { es: 'Mini Sesiones', en: 'Mini & Seasonal' },
  portrait: { es: 'Retrato', en: 'Portrait' },
};

const GalleryCard: React.FC<{ gallery: GalleryItem }> = ({ gallery }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={`${PIXIESET_BASE}/${gallery.slug}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden bg-dark-gray border border-white/10 hover:border-white/20 transition-all duration-500 block"
    >
      {!imgError ? (
        <img
          src={`https:${gallery.cover}`}
          alt={gallery.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full aspect-[3/2] object-cover transition-all duration-[800ms] ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="w-full aspect-[3/2] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-white/5 to-dark-gray">
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mb-3 group-hover:border-white/20 transition-all duration-500">
            <ExternalLink size={16} className="text-white/30 group-hover:text-white transition-all duration-500" />
          </div>
          <h4 className="font-serif text-sm md:text-base text-hero font-light leading-snug group-hover:text-white transition-all duration-500">
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
};

export default function PixiesetGallery({ lang, t }: Props) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string>('all');

  // Shareable filter via URL hash: #gallery=<type>. Read on load + on hashchange.
  useEffect(() => {
    const applyHash = () => {
      const match = window.location.hash.match(/^#gallery=([a-z]+)$/);
      const value = match ? match[1] : 'all';
      setType(value);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  const selectType = (value: string) => {
    setType(value);
    const base = window.location.pathname + window.location.search;
    if (value === 'all') {
      window.history.replaceState(null, '', base);
    } else {
      window.history.replaceState(null, '', `${base}#gallery=${encodeURIComponent(value)}`);
    }
  };

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...GALLERIES]
      .sort((a, b) => (a.iso < b.iso ? 1 : -1))
      .filter((g) => type === 'all' || g.type === type)
      .filter((g) => !normalized || g.title.toLowerCase().includes(normalized));
  }, [query, type]);

  const types = useMemo(() => Object.keys(TYPE_LABELS) as GalleryType[], []);

  const allLabel = lang === 'es' ? 'Todos' : 'All';
  const searchPlaceholder = lang === 'es' ? 'Buscar galería por nombre...' : 'Search galleries by name...';

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="font-serif text-xl text-white/90 tracking-wide">
          {t.pixiesetSubtitle}
        </h3>
        <p className="text-xs text-white/50 leading-relaxed max-w-2xl">
          {t.pixiesetDescription}
        </p>
      </div>

      {/* Filters: search + type chips (shareable via #gallery=<type>) */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full bg-dark-gray border border-white/10 rounded-md pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/30"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={lang === 'es' ? 'Filtrar por tipo de galería' : 'Filter by gallery type'}>
          <button
            type="button"
            onClick={() => selectType('all')}
            aria-pressed={type === 'all'}
            className={`px-3.5 py-1.5 rounded-md border font-mono text-[9px] tracking-widest uppercase transition-all duration-300 cursor-pointer ${
              type === 'all'
                ? 'bg-white text-dark border-white'
                : 'bg-dark-gray text-white/60 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            {allLabel}
          </button>
          {types.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => selectType(k)}
              aria-pressed={type === k}
              className={`px-3.5 py-1.5 rounded-md border font-mono text-[9px] tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                type === k
                  ? 'bg-white text-dark border-white'
                  : 'bg-dark-gray text-white/60 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {lang === 'es' ? TYPE_LABELS[k].es : TYPE_LABELS[k].en}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {visible.map((gallery) => (
          <GalleryCard key={gallery.slug} gallery={gallery} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="text-xs text-white/45 text-center py-8 font-mono tracking-wider">
          {lang === 'es' ? 'No se encontraron galerías con ese filtro.' : 'No galleries match this filter.'}
        </p>
      )}

      {/* Personal-gallery conversion banner (relocated below the grid) */}
      <a
        href={PIXIESET_BASE}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="border border-white/10 hover:border-white/20 rounded-lg p-6 transition-all duration-500 bg-gradient-to-r from-dark-gray via-dark-gray to-white/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg text-white/90 tracking-wide group-hover:text-white transition-colors duration-500">
                {t.pixiesetSearchTitle}
              </h3>
              <p className="text-xs text-white/50 leading-relaxed mt-1 max-w-lg">
                {t.pixiesetSearchDesc}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-dark group-hover:bg-white/85 rounded font-mono text-[10px] tracking-widest uppercase font-bold transition-all duration-500 whitespace-nowrap">
              {t.pixiesetSearchBtn}
            </span>
          </div>
        </div>
      </a>

      <div className="flex justify-center pt-2">
        <a
          href={PIXIESET_BASE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-dark hover:bg-white/80 rounded font-mono text-[10px] tracking-widest uppercase font-bold transition-all duration-300"
        >
          <ExternalLink size={14} />
          {t.pixiesetViewAll}
        </a>
      </div>
    </div>
  );
}