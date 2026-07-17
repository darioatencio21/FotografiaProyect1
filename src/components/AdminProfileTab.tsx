import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Check, UploadCloud } from 'lucide-react';
import { PhotographerProfile, ActiveLanguage } from '../types';
import { sanitizeObject } from '../lib/sanitize';

interface AdminProfileTabProps {
  profile: PhotographerProfile;
  onUpdateProfile: (profile: PhotographerProfile) => void;
  triggerAlert: (msg: string) => void;
  lang: ActiveLanguage;
}

function AdminProfileTab({ profile, onUpdateProfile, triggerAlert, lang }: AdminProfileTabProps) {
  const [profileForm, setProfileForm] = useState<PhotographerProfile>(profile);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setProfileForm(profile);
      initialized.current = true;
    }
  }, [profile]);

  const handleSaveProfile = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const safeProfile = sanitizeObject(profileForm as Record<string, unknown>) as unknown as PhotographerProfile;
    onUpdateProfile(safeProfile);
    triggerAlert('✓ Biografía y datos de perfil guardados correctamente.');
  }, [profileForm, onUpdateProfile, triggerAlert]);

  const handleAvatarImageUpload = useCallback((file: File) => {
    triggerAlert('Optimizando foto de perfil para el portafolio...');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const max_size = 800;
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
          setProfileForm(prev => ({ ...prev, avatarUrl: dataUrl }));
          triggerAlert('✓ Foto de perfil optimizada con éxito! Presiona "Guardar Perfil" para persistir.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [triggerAlert]);

  return (
    <form onSubmit={handleSaveProfile} className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-white">
            {lang === 'es' ? 'Biografía y Perfil Profesional' : lang === 'pt' ? 'Biografia e Perfil Profissional' : 'Biography & Professional Profile'}
          </h2>
          <p className="text-xs text-white/50">
            {lang === 'es' ? 'Edita tu información de marca personal, foto de perfil y biografías multilingües.' : 'Edit your personal branding, profile photograph, and multilingual bios.'}
          </p>
        </div>
        <button type="submit" className="py-1.5 px-4 bg-gold-500 text-dark hover:bg-gold-400 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer">
          <Check size={11} />
          <span>{lang === 'es' ? 'Guardar Perfil' : lang === 'pt' ? 'Salvar Perfil' : 'Save Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-dark-gray/40 border border-white/5 p-6 rounded-xl space-y-4">
            <h3 className="text-xs font-mono text-gold-400 uppercase tracking-wider border-b border-white/5 pb-2">
              {lang === 'es' ? 'Datos Principales' : 'Core Information'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Nombre Artístico' : 'Artistic Name'}</label>
                <input type="text" required value={profileForm.name} onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Título Profesional' : 'Professional Title'}</label>
                <input type="text" required value={profileForm.title} onChange={(e) => setProfileForm(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Cámara Predilecta' : 'Preferred Camera'}</label>
                <input type="text" value={profileForm.preferredCamera} onChange={(e) => setProfileForm(prev => ({ ...prev, preferredCamera: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Lente Predilecta' : 'Preferred Lens'}</label>
                <input type="text" value={profileForm.preferredLens} onChange={(e) => setProfileForm(prev => ({ ...prev, preferredLens: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
            </div>
          </div>

          <div className="bg-dark-gray/40 border border-white/5 p-6 rounded-xl space-y-6">
            <h3 className="text-xs font-mono text-gold-400 uppercase tracking-wider border-b border-white/5 pb-2">{lang === 'es' ? 'Biografías Multilingües' : 'Multilingual Biographies'}</h3>

            {/* Spanish */}
            <div className="space-y-4 border-l-2 border-gold-500/30 pl-4">
              <span className="text-[9px] font-mono bg-gold-500/10 text-gold-300 px-2 py-0.5 rounded uppercase font-semibold">Español</span>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Título' : 'Title'}</label>
                <input type="text" value={profileForm.aboutTitle_es} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutTitle_es: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-serif" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Párrafo 1' : 'Paragraph 1'}</label>
                <textarea rows={3} value={profileForm.aboutText1_es} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutText1_es: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white resize-none font-sans leading-relaxed" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Párrafo 2' : 'Paragraph 2'}</label>
                <textarea rows={3} value={profileForm.aboutText2_es} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutText2_es: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white resize-none font-sans leading-relaxed" />
              </div>
            </div>

            {/* English */}
            <div className="space-y-4 border-l-2 border-blue-500/30 pl-4 pt-4 border-t border-white/5">
              <span className="text-[9px] font-mono bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded uppercase font-semibold">English</span>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Title</label>
                <input type="text" value={profileForm.aboutTitle_en} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutTitle_en: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-serif" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Paragraph 1</label>
                <textarea rows={3} value={profileForm.aboutText1_en} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutText1_en: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white resize-none font-sans leading-relaxed" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Paragraph 2</label>
                <textarea rows={3} value={profileForm.aboutText2_en} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutText2_en: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white resize-none font-sans leading-relaxed" />
              </div>
            </div>

            {/* Portuguese */}
            <div className="space-y-4 border-l-2 border-green-500/30 pl-4 pt-4 border-t border-white/5">
              <span className="text-[9px] font-mono bg-green-500/10 text-green-300 px-2 py-0.5 rounded uppercase font-semibold">Português</span>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Título</label>
                <input type="text" value={profileForm.aboutTitle_pt} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutTitle_pt: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-serif" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Parágrafo 1</label>
                <textarea rows={3} value={profileForm.aboutText1_pt} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutText1_pt: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white resize-none font-sans leading-relaxed" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Parágrafo 2</label>
                <textarea rows={3} value={profileForm.aboutText2_pt} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutText2_pt: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white resize-none font-sans leading-relaxed" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-dark-gray/40 border border-white/5 p-6 rounded-xl space-y-4">
            <h3 className="text-xs font-mono text-gold-400 uppercase tracking-wider border-b border-white/5 pb-2">Foto de Perfil</h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gold-400 bg-charcoal shadow-lg">
                {profileForm.avatarUrl ? (
                  <img src={profileForm.avatarUrl} className="w-full h-full object-cover" alt="Profile preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px] font-mono">Sin foto</div>
                )}
              </div>
              <div className="w-full text-center">
                <input type="file" id="profile-avatar-upload-ext" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleAvatarImageUpload(e.target.files[0]); }} />
                <label htmlFor="profile-avatar-upload-ext" className="w-full py-2.5 px-4 border border-white/10 hover:border-gold-400 hover:text-gold-300 bg-dark-gray text-white text-[10px] font-mono rounded-lg cursor-pointer transition-all uppercase tracking-widest inline-flex items-center justify-center space-x-2">
                  <UploadCloud size={12} />
                  <span>{lang === 'es' ? 'Subir Foto Nueva' : 'Upload New Photo'}</span>
                </label>
              </div>
              <div className="w-full space-y-1">
                <label className="text-[9px] font-mono text-white/50 uppercase">O URL directa:</label>
                <input type="text" value={profileForm.avatarUrl} onChange={(e) => setProfileForm(prev => ({ ...prev, avatarUrl: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2 text-[10px] text-white font-mono" />
              </div>
            </div>
          </div>

          <div className="bg-dark-gray/40 border border-white/5 p-6 rounded-xl space-y-4">
            <h3 className="text-xs font-mono text-gold-400 uppercase tracking-wider border-b border-white/5 pb-2">Previsualización en Vivo</h3>
            <div className="border border-white/10 bg-dark rounded-xl p-4 text-left space-y-4">
              <div className="aspect-[4/5] rounded-lg overflow-hidden relative border border-white/5">
                {profileForm.avatarUrl ? (
                  <img src={profileForm.avatarUrl} className="w-full h-full object-cover grayscale" alt="preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px] font-mono">Sin foto</div>
                )}
                <div className="absolute bottom-2 left-2 bg-dark-gray/90 border border-white/10 px-2 py-1 rounded text-[8px] font-mono text-gold-400 uppercase">
                  {profileForm.title || "HEAD PHOTOGRAPHER"}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[8px] font-mono text-gold-400 tracking-widest uppercase block">BIOGRAPHY</span>
                <h4 className="font-serif text-sm text-white font-semibold">
                  {lang === 'es' ? profileForm.aboutTitle_es : lang === 'pt' ? profileForm.aboutTitle_pt : profileForm.aboutTitle_en}
                </h4>
                <p className="text-[10px] text-white/80 leading-relaxed font-sans line-clamp-3">
                  {lang === 'es' ? profileForm.aboutText1_es : lang === 'pt' ? profileForm.aboutText1_pt : profileForm.aboutText1_en}
                </p>
                <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-2 mt-2 font-mono">
                  <div>
                    <span className="text-[7px] text-white/50 uppercase block">CÁMARA</span>
                    <span className="text-[9px] font-semibold text-white/95 truncate block">{profileForm.preferredCamera}</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-white/50 uppercase block">LENTE</span>
                    <span className="text-[9px] font-semibold text-white/95 truncate block">{profileForm.preferredLens}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default React.memo(AdminProfileTab);
