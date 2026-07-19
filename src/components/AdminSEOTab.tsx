import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw, UploadCloud } from 'lucide-react';
import { SEOMetadata, ActiveLanguage } from '../types';
import { sanitizeObject } from '../lib/sanitize';
import { uploadImageBlob } from '../lib/firebase';

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

  const handleImageUpload = useCallback((field: 'heroImageLeft' | 'heroImageRight' | 'ogImage') => async (file: File) => {
    triggerAlert('Optimizing image...');
    try {
      const rawUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('FileReader failed'));
        reader.readAsDataURL(file);
      });
      const img = new Image();
      const { blob } = await new Promise<{ blob: Blob }>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 1600;
          let w = img.width;
          let h = img.height;
          if (w > h) {
            if (w > max_size) { h *= max_size / w; w = max_size; }
          } else {
            if (h > max_size) { w *= max_size / h; h = max_size; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Canvas context failed')); return; }
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (b) => b ? resolve({ blob: b }) : reject(new Error('toBlob failed')),
            'image/jpeg',
            0.9
          );
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = rawUrl;
      });
      const id = `seo-${field}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const downloadUrl = await uploadImageBlob(`seo/${id}.jpg`, blob);
      setSeoForm(prev => ({ ...prev, [field]: downloadUrl }));
      triggerAlert('Image loaded! Click "Deploy Metadata" to save.');
    } catch (err) {
      console.error('SEO image upload failed', err);
      triggerAlert('Error uploading image. Please try again.');
    }
  }, [triggerAlert]);

  return (
    <form onSubmit={handleSaveSEO} className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-white">
            {lang === 'es' ? 'Configuración SEO y Meta-tags' : 'SEO & Meta-Tag Deployment'}
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
            <input type="text" required value={seoForm.title} onChange={(e) => setSeoForm(prev => ({ ...prev, title: e.target.value, ogTitle: e.target.value }))} className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/50 uppercase">Meta Description</label>
            <textarea rows={3} required value={seoForm.description} onChange={(e) => setSeoForm(prev => ({ ...prev, description: e.target.value, ogDescription: e.target.value }))} className="w-full bg-charcoal border border-[#D8C0A8] rounded p-3 text-xs text-white resize-none" />
          </div>

          <div className="bg-dark-gray border border-white/5 p-4 rounded-xl space-y-4">
            <h3 className="text-[10px] font-mono text-gold-400 uppercase tracking-wider border-b border-white/5 pb-2">
              {lang === 'es' ? 'Hero Split — Imágenes' : 'Split Hero — Images'}
            </h3>
            <p className="text-[9px] text-white/40 font-mono">
              {lang === 'es' ? 'Cada imagen se muestra en un lado del hero dividido (50/50).' : 'Each image is shown on one side of the 50/50 split hero.'}
            </p>

            {/* Left Image */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/50 uppercase block">{lang === 'es' ? 'Imagen Izquierda' : 'Left Image'}</label>
              <div className="flex items-center space-x-3">
                <input type="file" id="hero-left-upload" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload('heroImageLeft')(e.target.files[0]); }} />
                <label htmlFor="hero-left-upload" className="px-4 py-2 border border-[#D8C0A8] hover:border-gold-400 hover:text-gold-300 bg-charcoal text-white text-[10px] font-mono rounded-lg cursor-pointer transition-all uppercase tracking-widest flex items-center space-x-1.5 whitespace-nowrap">
                  <UploadCloud size={12} />
                  <span>{lang === 'es' ? 'Subir' : 'Upload'}</span>
                </label>
                <input type="text" value={seoForm.heroImageLeft || ''} onChange={(e) => setSeoForm(prev => ({ ...prev, heroImageLeft: e.target.value || undefined }))} placeholder="https://..." className="flex-1 bg-charcoal border border-[#D8C0A8] rounded px-2.5 py-2 text-[10px] text-white placeholder-white/30 focus:outline-none focus:border-gold-400 font-mono" />
              </div>
              {seoForm.heroImageLeft && (
                <div className="mt-1 aspect-[3/2] rounded-lg overflow-hidden border border-white/5 bg-charcoal">
                  <img src={seoForm.heroImageLeft} alt="Left hero preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Right Image */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/50 uppercase block">{lang === 'es' ? 'Imagen Derecha' : 'Right Image'}</label>
              <div className="flex items-center space-x-3">
                <input type="file" id="hero-right-upload" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload('heroImageRight')(e.target.files[0]); }} />
                <label htmlFor="hero-right-upload" className="px-4 py-2 border border-[#D8C0A8] hover:border-gold-400 hover:text-gold-300 bg-charcoal text-white text-[10px] font-mono rounded-lg cursor-pointer transition-all uppercase tracking-widest flex items-center space-x-1.5 whitespace-nowrap">
                  <UploadCloud size={12} />
                  <span>{lang === 'es' ? 'Subir' : 'Upload'}</span>
                </label>
                <input type="text" value={seoForm.heroImageRight || ''} onChange={(e) => setSeoForm(prev => ({ ...prev, heroImageRight: e.target.value || undefined }))} placeholder="https://..." className="flex-1 bg-charcoal border border-[#D8C0A8] rounded px-2.5 py-2 text-[10px] text-white placeholder-white/30 focus:outline-none focus:border-gold-400 font-mono" />
              </div>
              {seoForm.heroImageRight && (
                <div className="mt-1 aspect-[3/2] rounded-lg overflow-hidden border border-white/5 bg-charcoal">
                  <img src={seoForm.heroImageRight} alt="Right hero preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/50 uppercase">Robots.txt</label>
            <textarea rows={3} value={seoForm.robotsText} onChange={(e) => setSeoForm(prev => ({ ...prev, robotsText: e.target.value }))} className="w-full bg-charcoal border border-[#D8C0A8] rounded p-3 text-xs text-white font-mono resize-none" />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/50 uppercase block">Open Graph Image (Social Share)</label>
            <div className="flex items-center space-x-3">
              <input type="file" id="og-image-upload" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload('ogImage')(e.target.files[0]); }} />
              <label htmlFor="og-image-upload" className="px-4 py-2 border border-[#D8C0A8] hover:border-gold-400 hover:text-gold-300 bg-charcoal text-white text-[10px] font-mono rounded-lg cursor-pointer transition-all uppercase tracking-widest flex items-center space-x-1.5 whitespace-nowrap">
                <UploadCloud size={12} />
                <span>{lang === 'es' ? 'Subir' : 'Upload'}</span>
              </label>
              <input type="text" value={seoForm.ogImage} onChange={(e) => setSeoForm(prev => ({ ...prev, ogImage: e.target.value }))} placeholder="https://..." className="flex-1 bg-charcoal border border-[#D8C0A8] rounded px-2.5 py-2 text-[10px] text-white placeholder-white/30 focus:outline-none focus:border-gold-400 font-mono" />
            </div>
          </div>

          <div className="border border-[#D8C0A8] bg-charcoal rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="relative aspect-[1.91/1] overflow-hidden bg-charcoal">
              {seoForm.ogImage ? (
                <img src={seoForm.ogImage} className="w-full h-full object-cover" alt="og preview" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px] font-mono">{lang === 'es' ? 'Sin imagen' : 'No image'}</div>
              )}
              <div className="absolute top-3 left-3 bg-blue-500/95 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold tracking-wider">og:image preview</div>
            </div>
            <div className="p-4 space-y-1 text-left bg-[#1C1C1E]">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">MIRIAMCAMPOS-PHOTOGRAPHY.COM</span>
              <h5 className="text-xs font-semibold text-white/95 truncate">{seoForm.ogTitle}</h5>
              <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2">{seoForm.ogDescription}</p>
            </div>
          </div>

          <div className="border border-white/5 bg-charcoal rounded-xl p-4 space-y-1 text-left">
            <span className="text-[9px] font-mono text-white/35 block">google.com/search</span>
            <span className="text-xs font-semibold text-[#8AB4F8] hover:underline cursor-pointer block">{seoForm.title}</span>
            <span className="text-[10px] text-[#A6C8FF] font-mono block">miriamcampos-photography.com</span>
            <p className="text-[10px] text-white/60 leading-normal">{seoForm.description}</p>
          </div>
        </div>
      </div>
    </form>
  );
}

export default React.memo(AdminSEOTab);
