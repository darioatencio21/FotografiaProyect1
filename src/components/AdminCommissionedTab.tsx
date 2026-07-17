import React, { useState, useCallback, useEffect } from 'react';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { CommissionedServicesConfig, ServiceAddon, ActiveLanguage } from '../types';

interface AdminCommissionedTabProps {
  config: CommissionedServicesConfig;
  onUpdateConfig: (config: CommissionedServicesConfig) => void;
  triggerAlert: (msg: string) => void;
  lang: ActiveLanguage;
}

function AdminCommissionedTab({ config, onUpdateConfig, triggerAlert, lang }: AdminCommissionedTabProps) {
  const [form, setForm] = useState<CommissionedServicesConfig>(config);

  useEffect(() => {
    setForm(config);
  }, [config]);

  const handleSave = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(form);
    triggerAlert('✓ Configuración de Servicios Comisionados guardada.');
  }, [form, onUpdateConfig, triggerAlert]);

  const updateAddon = useCallback((id: string, field: keyof ServiceAddon, value: string | number | boolean) => {
    setForm(prev => ({
      ...prev,
      addons: prev.addons.map(a => a.id === id ? { ...a, [field]: value } : a)
    }));
  }, []);

  const removeAddon = useCallback((id: string) => {
    setForm(prev => ({
      ...prev,
      addons: prev.addons.filter(a => a.id !== id)
    }));
  }, []);

  const addAddon = useCallback(() => {
    const id = `addon-${Date.now()}`;
    const newAddon: ServiceAddon = {
      id,
      name_es: 'Nuevo extra',
      name_en: 'New extra',
      name_pt: 'Novo extra',
      price: 0,
      enabled: true,
    };
    setForm(prev => ({ ...prev, addons: [...prev.addons, newAddon] }));
  }, []);

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-white">
            {lang === 'es' ? 'Servicios Comisionados' : lang === 'pt' ? 'Serviços Comissionados' : 'Commissioned Services'}
          </h2>
          <p className="text-xs text-white/50">
            {lang === 'es' ? 'Configura el título, subtítulo y servicios adicionales de la sección pública.' : 'Configure the title, subtitle, and extra services for the public section.'}
          </p>
        </div>
        <button type="submit" className="py-1.5 px-4 bg-gold-500 text-dark hover:bg-gold-400 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer">
          <Save size={11} />
          <span>{lang === 'es' ? 'Guardar' : lang === 'pt' ? 'Salvar' : 'Save'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-dark-gray/40 border border-white/5 p-6 rounded-xl space-y-4">
            <h3 className="text-xs font-mono text-gold-400 uppercase tracking-wider border-b border-white/5 pb-2">
              {lang === 'es' ? 'Títulos de Sección' : 'Section Headings'}
            </h3>

            {/* Spanish */}
            <div className="space-y-4 border-l-2 border-gold-500/30 pl-4">
              <span className="text-[9px] font-mono bg-gold-500/10 text-gold-300 px-2 py-0.5 rounded uppercase font-semibold">Español</span>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Título</label>
                <input type="text" value={form.sectionTitle_es} onChange={(e) => setForm(prev => ({ ...prev, sectionTitle_es: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Subtítulo</label>
                <input type="text" value={form.sectionSubtitle_es} onChange={(e) => setForm(prev => ({ ...prev, sectionSubtitle_es: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
            </div>

            {/* English */}
            <div className="space-y-4 border-l-2 border-blue-500/30 pl-4 pt-4 border-t border-white/5">
              <span className="text-[9px] font-mono bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded uppercase font-semibold">English</span>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Title</label>
                <input type="text" value={form.sectionTitle_en} onChange={(e) => setForm(prev => ({ ...prev, sectionTitle_en: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Subtitle</label>
                <input type="text" value={form.sectionSubtitle_en} onChange={(e) => setForm(prev => ({ ...prev, sectionSubtitle_en: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
            </div>

            {/* Portuguese */}
            <div className="space-y-4 border-l-2 border-green-500/30 pl-4 pt-4 border-t border-white/5">
              <span className="text-[9px] font-mono bg-green-500/10 text-green-300 px-2 py-0.5 rounded uppercase font-semibold">Português</span>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Título</label>
                <input type="text" value={form.sectionTitle_pt} onChange={(e) => setForm(prev => ({ ...prev, sectionTitle_pt: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Subtítulo</label>
                <input type="text" value={form.sectionSubtitle_pt} onChange={(e) => setForm(prev => ({ ...prev, sectionSubtitle_pt: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
            </div>
          </div>

          {/* Custom service label */}
          <div className="bg-dark-gray/40 border border-white/5 p-6 rounded-xl space-y-4">
            <h3 className="text-xs font-mono text-gold-400 uppercase tracking-wider border-b border-white/5 pb-2">
              {lang === 'es' ? 'Etiqueta de Servicio Personalizado' : 'Custom Service Label'}
            </h3>
            <div className="space-y-4 border-l-2 border-white/20 pl-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Español</label>
                <input type="text" value={form.customServiceLabel_es} onChange={(e) => setForm(prev => ({ ...prev, customServiceLabel_es: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">English</label>
                <input type="text" value={form.customServiceLabel_en} onChange={(e) => setForm(prev => ({ ...prev, customServiceLabel_en: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Português</label>
                <input type="text" value={form.customServiceLabel_pt} onChange={(e) => setForm(prev => ({ ...prev, customServiceLabel_pt: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {/* Add-ons */}
          <div className="bg-dark-gray/40 border border-white/5 p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-xs font-mono text-gold-400 uppercase tracking-wider">
                {lang === 'es' ? 'Servicios Adicionales (Add-ons)' : 'Add-ons'}
              </h3>
              <button type="button" onClick={addAddon} className="p-1 bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 rounded cursor-pointer transition-colors">
                <Plus size={12} />
              </button>
            </div>
            <p className="text-[9px] text-white/40 font-mono">
              {lang === 'es' ? 'Estos extras aparecen en el formulario de reserva.' : 'These extras appear in the booking form.'}
            </p>

            <div className="space-y-2">
              {form.addons.map((addon) => (
                <div key={addon.id} className="bg-dark/60 border border-white/5 rounded p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GripVertical size={12} className="text-white/20" />
                      <span className={`text-[9px] font-mono uppercase ${addon.enabled ? 'text-green-400' : 'text-white/30'}`}>
                        {addon.enabled ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input type="checkbox" checked={addon.enabled} onChange={(e) => updateAddon(addon.id, 'enabled', e.target.checked)} className="accent-gold-500" />
                        <span className="text-[9px] font-mono text-white/50">ON</span>
                      </label>
                      <button type="button" onClick={() => removeAddon(addon.id)} className="text-red-400/60 hover:text-red-400 cursor-pointer">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-3 grid grid-cols-3 gap-1">
                      <input type="text" value={addon.name_es} onChange={(e) => updateAddon(addon.id, 'name_es', e.target.value)} placeholder="Español" className="bg-dark/80 border border-white/5 rounded p-1.5 text-[9px] text-white font-mono" />
                      <input type="text" value={addon.name_en} onChange={(e) => updateAddon(addon.id, 'name_en', e.target.value)} placeholder="English" className="bg-dark/80 border border-white/5 rounded p-1.5 text-[9px] text-white font-mono" />
                      <input type="text" value={addon.name_pt} onChange={(e) => updateAddon(addon.id, 'name_pt', e.target.value)} placeholder="Português" className="bg-dark/80 border border-white/5 rounded p-1.5 text-[9px] text-white font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-white/40 block text-center">$ USD</label>
                      <input type="number" min="0" value={addon.price} onChange={(e) => updateAddon(addon.id, 'price', Number(e.target.value))} className="w-full bg-dark/80 border border-white/5 rounded p-1.5 text-[9px] text-white font-mono text-center" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default React.memo(AdminCommissionedTab);
