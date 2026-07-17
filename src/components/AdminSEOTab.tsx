import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw, UploadCloud } from 'lucide-react';
import { SEOMetadata, ActiveLanguage } from '../types';
import { sanitizeObject } from '../lib/sanitize';

const getHeroPositionClass = (pos?: string) => {
  if (pos === 'top') return 'object-top';
  if (pos === 'bottom') return 'object-bottom';
  if (pos === 'left') return 'object-left';
  if (pos === 'right') return 'object-right';
  return 'object-center';
};

const getHeroScaleClass = (scale?: number) => {
  if (scale === 100) return 'scale-100';
  if (scale === 110) return 'scale-110';
  if (scale === 120) return 'scale-120';
  if (scale === 130) return 'scale-130';
  if (scale === 150) return 'scale-150';
  return 'scale-105';
};

interface AdminSEOTabProps {
  seo: SEOMetadata;
  onUpdateSeo: (seo: SEOMetadata) => void;
  triggerAlert: (msg: string) => void;
  lang: ActiveLanguage;
}

function AdminSEOTab({ seo, onUpdateSeo, triggerAlert, lang }: AdminSEOTabProps) {
  const [seoForm, setSeoForm] = useState<SEOMetadata>(seo);

  useEffect(() => {
    setSeoForm(seo);
  }, [seo]);

  const handleSaveSEO = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const safeSeo = sanitizeObject(seoForm as Record<string, unknown>) as unknown as SEOMetadata;
    onUpdateSeo(safeSeo);
    triggerAlert('SEO Schema, Meta tags and Robots.txt deployed to production');
  }, [seoForm, onUpdateSeo, triggerAlert]);

  const handleSeoImageUpload = useCallback((file: File) => {
    triggerAlert('Optimizing homepage hero image for premium web deployment...');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const max_size = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > max_size) { height *= max_size / width; width = max_size; }
        } else {
          if (height > max_size) { width *= max_size / height; height = max_size; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSeoForm(prev => ({ ...prev, ogImage: dataUrl }));
          triggerAlert('Homepage hero image loaded successfully! Click "Deploy Metadata" to save.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [triggerAlert]);

  return (
    <form onSubmit={handleSaveSEO} className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-white">
            {lang === 'es' ? 'Configuración SEO y Meta-tags' : lang === 'pt' ? 'Configuração SEO e Meta-Tags' : 'SEO & Meta-Tag Deployment'}
          </h2>
          <p className="text-xs text-white/50">
            {lang === 'es' ? 'Configura los títulos, meta descripciones, Open Graph y datos estructurados.' : 'Edit Schema.org, Open Graph preview data, and custom metadata settings.'}
          </p>
        </div>
        <button type="submit" className="py-1.5 px-4 bg-gold-500 text-dark hover:bg-gold-400 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer">
          <RefreshCw size={11} />
          <span>{lang === 'es' ? 'Aplicar Cambios SEO' : 'Deploy Metadata'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/50 uppercase">Homepage SEO Title</label>
            <input type="text" required value={seoForm.title} onChange={(e) => setSeoForm(prev => ({ ...prev, title: e.target.value, ogTitle: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/50 uppercase">Meta Description</label>
            <textarea rows={3} required value={seoForm.description} onChange={(e) => setSeoForm(prev => ({ ...prev, description: e.target.value, ogDescription: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white resize-none" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/50 uppercase block">Foto de Portada (Hero Photo / OpenGraph)</label>
            <div className="flex items-center space-x-4">
              <input type="file" id="seo-hero-upload-ext" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleSeoImageUpload(e.target.files[0]); }} />
              <label htmlFor="seo-hero-upload-ext" className="px-6 py-3 border border-white/10 hover:border-gold-400 hover:text-gold-300 bg-dark-gray text-white text-xs font-mono rounded-lg cursor-pointer transition-all uppercase tracking-widest whitespace-nowrap flex items-center space-x-2">
                <UploadCloud size={14} />
                <span>{lang === 'es' ? 'Subir Nueva Imagen' : 'Upload New Image'}</span>
              </label>
              <span className="text-[10px] text-white/40 font-mono italic">{lang === 'es' ? 'Haz clic en "Aplicar Cambios SEO" después.' : 'Click "Deploy Metadata" after uploading.'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/50 uppercase block">Enfoque / Posición</label>
              <select value={seoForm.heroPosition || 'center'} onChange={(e) => setSeoForm(prev => ({ ...prev, heroPosition: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white">
                <option value="center">Centro</option>
                <option value="top">Arriba</option>
                <option value="bottom">Abajo</option>
                <option value="left">Izquierda</option>
                <option value="right">Derecha</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/50 uppercase block">Zoom / Escala</label>
              <select value={seoForm.heroScale || 105} onChange={(e) => setSeoForm(prev => ({ ...prev, heroScale: Number(e.target.value) }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white">
                <option value={100}>100% (Original)</option>
                <option value={105}>105% (Normal)</option>
                <option value={110}>110% (Zoom Medio)</option>
                <option value={120}>120% (Zoom Alto)</option>
                <option value={130}>130% (Zoom Muy Alto)</option>
                <option value={150}>150% (Zoom Máximo)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/50 uppercase">Robots.txt</label>
            <textarea rows={3} value={seoForm.robotsText} onChange={(e) => setSeoForm(prev => ({ ...prev, robotsText: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white font-mono resize-none" />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">Open Graph Card (Live Preview)</span>

          <div className="border border-white/10 bg-dark rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="relative aspect-[1.91/1] overflow-hidden bg-charcoal">
              {seoForm.ogImage ? (
                <img src={seoForm.ogImage} className="w-full h-full object-cover" alt="og preview" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px] font-mono">Sin imagen</div>
              )}
              <div className="absolute top-3 left-3 bg-blue-500/95 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold tracking-wider">og:image preview</div>
            </div>
            <div className="p-4 space-y-1 text-left bg-[#1C1C1E]">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">AUREA-PHOTOGRAPHY.COM</span>
              <h5 className="text-xs font-semibold text-white/95 truncate">{seoForm.ogTitle}</h5>
              <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2">{seoForm.ogDescription}</p>
            </div>
          </div>

          <div className="border border-white/5 bg-dark/20 rounded-xl p-4 space-y-1 text-left">
            <span className="text-[9px] font-mono text-white/35 block">google.com/search</span>
            <span className="text-xs font-semibold text-[#8AB4F8] hover:underline cursor-pointer block">{seoForm.title}</span>
            <span className="text-[10px] text-[#A6C8FF] font-mono block">https://aurea-photography.com</span>
            <p className="text-[10px] text-white/60 leading-normal">{seoForm.description}</p>
          </div>

          <div className="border border-white/10 bg-dark rounded-xl overflow-hidden shadow-2xl p-4 space-y-3 text-left">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">Vista Previa de la Portada</span>
            <div className="relative aspect-[21/9] rounded-lg overflow-hidden bg-charcoal border border-white/5">
              {seoForm.ogImage ? (
                <img src={seoForm.ogImage} className={`w-full h-full object-cover transition-all duration-500 filter brightness-[0.7] ${getHeroPositionClass(seoForm.heroPosition)} ${getHeroScaleClass(seoForm.heroScale)}`} alt="hero preview" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px] font-mono">Sin imagen</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent flex items-end p-3">
                <div className="space-y-0.5">
                  <span className="text-[7px] font-mono text-gold-400 uppercase tracking-wider">MUSEUM-GRADE FINE ART</span>
                  <h4 className="text-[10px] font-serif text-white italic leading-tight line-clamp-1">Miriam Campos Photography</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default React.memo(AdminSEOTab);
