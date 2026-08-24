import React, { useState, useCallback, useEffect } from 'react';
import { Check, UploadCloud } from 'lucide-react';
import { PhotographerProfile, ActiveLanguage } from '../types';
import { sanitizeObject } from '../lib/sanitize';
import { uploadImageBlob } from '../lib/db';
import StorageImage from './StorageImage';

interface AdminProfileTabProps {
  profile: PhotographerProfile;
  onUpdateProfile: (profile: PhotographerProfile) => void;
  triggerAlert: (msg: string) => void;
  lang: ActiveLanguage;
}

function AdminProfileTab({ profile, onUpdateProfile, triggerAlert, lang }: AdminProfileTabProps) {
  const [profileForm, setProfileForm] = useState<PhotographerProfile>(profile);

  useEffect(() => {
    setProfileForm(profile);
  }, [profile]);

  const handleSaveProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const safeProfile = sanitizeObject(profileForm as Record<string, unknown>) as unknown as PhotographerProfile;
    try {
      await onUpdateProfile(safeProfile);
      triggerAlert('✓ Biografía y datos de perfil guíardados correctamente.');
    } catch (err) {
      console.error('[profile] save failed:', err);
      triggerAlert('Error al guardar perfil. Intentá de nuevo.');
    }
  }, [profileForm, onUpdateProfile, triggerAlert]);

  const handleAvatarImageUpload = useCallback(async (file: File) => {
    triggerAlert('Optimizando foto de perfil para el portafolio...');
    try {
      const rawUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('FileReader failed'));
        reader.readAsDataURL(file);
      });
      const img = new Image();
      const { blob, width, height } = await new Promise<{ blob: Blob; width: number; height: number }>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 800;
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
            (b) => b ? resolve({ blob: b, width: w, height: h }) : reject(new Error('toBlob failed')),
            'image/jpeg',
            0.85
          );
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = rawUrl;
      });
      void width; void height;
      const id = `avatar-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const downloadUrl = await uploadImageBlob(`profile/${id}.jpg`, blob);
      setProfileForm(prev => ({ ...prev, avatarUrl: downloadUrl }));
      triggerAlert('✓ Foto de perfil optimizada con éxito! Presiona "Guardar Perfil" para persistir.');
    } catch (err) {
      console.error('Avatar upload failed', err);
      triggerAlert('Error al subir la foto. Intenta con otro archivo.');
    }
  }, [triggerAlert]);

  return (
    <form onSubmit={handleSaveProfile} className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-white">
            {lang === 'es' ? 'Biografía y Perfil Profesional' : 'Biography & Professional Profile'}
          </h2>
          <p className="text-xs text-white/50">
            {lang === 'es' ? 'Edita tu información de marca personal, foto de perfil y biografías multilingües.' : 'Edit your personal branding, profile photograph, and multilinguíal bios.'}
          </p>
        </div>
        <button type="submit" className="py-1.5 px-4 bg-white/10 text-white border border-white/10 hover:bg-white/15 text-white rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer">
          <Check size={11} />
          <span>{lang === 'es' ? 'Guardar Perfil' : 'Save Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-dark-gray border border-white/10 p-6 rounded-lg space-y-4">
            <h3 className="text-xs font-mono text-white/90 uppercase tracking-wider border-b border-white/10 pb-2">
              {lang === 'es' ? 'Datos Principales' : 'Core Information'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Nombre Artístico' : 'Artistic Name'}</label>
                <input type="text" required value={profileForm.name} onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-charcoal border border-stone rounded p-2.5 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Título Profesional' : 'Professional Title'}</label>
                <input type="text" required value={profileForm.title} onChange={(e) => setProfileForm(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-charcoal border border-stone rounded p-2.5 text-xs text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Cámara Predilecta' : 'Preferred Camera'}</label>
                <input type="text" value={profileForm.preferredCamera} onChange={(e) => setProfileForm(prev => ({ ...prev, preferredCamera: e.target.value }))} className="w-full bg-charcoal border border-stone rounded p-2.5 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Lente Predilecta' : 'Preferred Lens'}</label>
                <input type="text" value={profileForm.preferredLens} onChange={(e) => setProfileForm(prev => ({ ...prev, preferredLens: e.target.value }))} className="w-full bg-charcoal border border-stone rounded p-2.5 text-xs text-white" />
              </div>
            </div>
          </div>

          <div className="bg-dark-gray border border-white/10 p-6 rounded-lg space-y-6">
            <h3 className="text-xs font-mono text-white/90 uppercase tracking-wider border-b border-white/10 pb-2">{lang === 'es' ? 'Biografías Multilingües' : 'Multilinguíal Biographies'}</h3>

            {/* Spanish */}
            <div className="space-y-4 border-l-2 border-white/10 pl-4">
              <span className="text-[9px] font-mono bg-white/5 text-white/60 px-2 py-0.5 rounded uppercase font-semibold">Español</span>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Título' : 'Title'}</label>
                <input type="text" value={profileForm.aboutTitle_es} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutTitle_es: e.target.value }))} className="w-full bg-charcoal border border-stone rounded p-2.5 text-xs text-white font-serif" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Párrafo 1' : 'Paragraph 1'}</label>
                <textarea rows={3} value={profileForm.aboutText1_es} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutText1_es: e.target.value }))} className="w-full bg-charcoal border border-stone rounded p-3 text-xs text-white resize-none font-sans leading-relaxed" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Párrafo 2' : 'Paragraph 2'}</label>
                <textarea rows={3} value={profileForm.aboutText2_es} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutText2_es: e.target.value }))} className="w-full bg-charcoal border border-stone rounded p-3 text-xs text-white resize-none font-sans leading-relaxed" />
              </div>
            </div>

            {/* English */}
            <div className="space-y-4 border-l-2 border-blue-500/30 pl-4 pt-4 border-t border-white/10">
              <span className="text-[9px] font-mono bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded uppercase font-semibold">English</span>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Title</label>
                <input type="text" value={profileForm.aboutTitle_en} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutTitle_en: e.target.value }))} className="w-full bg-charcoal border border-stone rounded p-2.5 text-xs text-white font-serif" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Paragraph 1</label>
                <textarea rows={3} value={profileForm.aboutText1_en} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutText1_en: e.target.value }))} className="w-full bg-charcoal border border-stone rounded p-3 text-xs text-white resize-none font-sans leading-relaxed" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Paragraph 2</label>
                <textarea rows={3} value={profileForm.aboutText2_en} onChange={(e) => setProfileForm(prev => ({ ...prev, aboutText2_en: e.target.value }))} className="w-full bg-charcoal border border-stone rounded p-3 text-xs text-white resize-none font-sans leading-relaxed" />
              </div>
            </div>


          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-dark-gray border border-white/10 p-6 rounded-lg space-y-4">
            <h3 className="text-xs font-mono text-white/90 uppercase tracking-wider border-b border-white/10 pb-2">Foto de Perfil</h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 bg-charcoal shadow-lg">
                {profileForm.avatarUrl ? (
                  <StorageImage src={profileForm.avatarUrl} className="w-full h-full object-cover" alt="Profile preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px] font-mono">Sin foto</div>
                )}
              </div>
              <div className="w-full text-center">
                <input type="file" id="profile-avatar-upload-ext" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleAvatarImageUpload(e.target.files[0]); }} />
                <label htmlFor="profile-avatar-upload-ext" className="w-full py-2.5 px-4 border border-stone hover:border-white/30 hover:text-white bg-dark-gray text-white text-[10px] font-mono rounded-lg cursor-pointer transition-all uppercase tracking-widest inline-flex items-center justify-center space-x-2">
                  <UploadCloud size={12} />
                  <span>{lang === 'es' ? 'Subir Foto Nueva' : 'Upload New Photo'}</span>
                </label>
              </div>
              <div className="w-full space-y-1">
                <label className="text-[9px] font-mono text-white/50 uppercase">O URL directa:</label>
                <input type="text" value={profileForm.avatarUrl} onChange={(e) => setProfileForm(prev => ({ ...prev, avatarUrl: e.target.value }))} className="w-full bg-charcoal border border-stone rounded p-2 text-[10px] text-white font-mono" />
              </div>
            </div>
          </div>

          <div className="bg-dark-gray border border-white/10 p-6 rounded-lg space-y-4">
            <h3 className="text-xs font-mono text-white/90 uppercase tracking-wider border-b border-white/10 pb-2">Previsualización en Vivo</h3>
            <div className="border border-stone bg-charcoal rounded-lg p-4 text-left space-y-4">
              <div className="aspect-[4/5] rounded-lg overflow-hidden relative border border-white/10">
                {profileForm.avatarUrl ? (
                  <StorageImage src={profileForm.avatarUrl} className="w-full h-full object-cover" alt="preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px] font-mono">Sin foto</div>
                )}
                <div className="absolute bottom-2 left-2 bg-dark-gray/90 border border-stone px-2 py-1 rounded text-[11px] font-mono text-white/90 uppercase">
                  {profileForm.title || "HEAD PHOTOGRAPHER"}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-white/90 tracking-widest uppercase block">BIOGRAPHY</span>
                <h4 className="font-serif text-sm text-white font-semibold">
                  {lang === 'es' ? profileForm.aboutTitle_es : profileForm.aboutTitle_en}
                </h4>
                <p className="text-[10px] text-white/80 leading-relaxed font-sans line-clamp-3">
                  {lang === 'es' ? profileForm.aboutText1_es : profileForm.aboutText1_en}
                </p>
                <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-2 mt-2 font-mono">
                  <div>
                    <span className="text-[10px] text-white/50 uppercase block">CÁMARA</span>
                    <span className="text-[9px] font-semibold text-white/95 truncate block">{profileForm.preferredCamera}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 uppercase block">LENTE</span>
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
