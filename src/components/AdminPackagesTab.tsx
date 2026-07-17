import React, { useState, useCallback, useEffect } from 'react';
import { Save, Plus, Trash2, Edit3, X } from 'lucide-react';
import { PhotographyPackage, ActiveLanguage } from '../types';

interface AdminPackagesTabProps {
  packages: PhotographyPackage[];
  onUpdatePackages: (packages: PhotographyPackage[]) => void;
  triggerAlert: (msg: string) => void;
  lang: ActiveLanguage;
}

const ICON_OPTIONS = [
  'Heart', 'Camera', 'Users', 'Calendar', 'PartyPopper',
  'ShoppingBag', 'Star', 'Baby', 'GraduationCap', 'Gift', 'Briefcase',
  'Sparkles', 'Sun', 'Moon', 'Palette', 'Music', 'Coffee', 'Globe'
];

function emptyPackage(): PhotographyPackage {
  return {
    id: 'pkg-' + Date.now(),
    icon: 'Camera',
    name_es: '', name_en: '', name_pt: '',
    price: 0,
    priceFromText_es: 'Desde',
    priceFromText_en: 'Starting from',
    priceFromText_pt: 'A partir de',
    duration_es: '', duration_en: '', duration_pt: '',
    description_es: '', description_en: '', description_pt: '',
    benefits: [''],
    buttonText_es: 'Contratar paquete',
    buttonText_en: 'Book this package',
    buttonText_pt: 'Contratar pacote',
    sortOrder: 0,
    active: true,
    featured: false,
  };
}

export default function AdminPackagesTab({ packages, onUpdatePackages, triggerAlert, lang }: AdminPackagesTabProps) {
  const [localPackages, setLocalPackages] = useState<PhotographyPackage[]>(packages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PhotographyPackage>(emptyPackage());
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setLocalPackages(packages);
  }, [packages]);

  const t = (es: string, en: string, pt?: string) => {
    if (lang === 'en') return en;
    if (lang === 'pt') return pt || en;
    return es;
  };

  const handleSaveAll = useCallback(() => {
    const cleaned = localPackages.map(p => ({
      ...p,
      benefits: p.benefits.filter(b => b.trim() !== ''),
    }));
    onUpdatePackages(cleaned);
    triggerAlert(t('✓ Paquetes guardados.', '✓ Packages saved.', '✓ Pacotes salvos.'));
  }, [localPackages, onUpdatePackages, triggerAlert, t]);

  const toggleActive = useCallback((id: string) => {
    setLocalPackages(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  }, []);

  const toggleFeatured = useCallback((id: string) => {
    setLocalPackages(prev => prev.map(p => p.id === id ? { ...p, featured: !p.featured } : p));
  }, []);

  const removePackage = useCallback((id: string) => {
    setLocalPackages(prev => prev.filter(p => p.id !== id));
  }, []);

  const startCreate = useCallback(() => {
    const newPkg = emptyPackage();
    newPkg.sortOrder = localPackages.length + 1;
    setEditForm(newPkg);
    setIsCreating(true);
    setEditingId(newPkg.id);
  }, [localPackages]);

  const startEdit = useCallback((pkg: PhotographyPackage) => {
    setEditForm({ ...pkg, benefits: pkg.benefits.length > 0 ? [...pkg.benefits] : [''] });
    setIsCreating(false);
    setEditingId(pkg.id);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setIsCreating(false);
  }, []);

  const saveEdit = useCallback(() => {
    const cleaned = {
      ...editForm,
      benefits: editForm.benefits.filter(b => b.trim() !== ''),
    };
    if (isCreating) {
      setLocalPackages(prev => [...prev, cleaned]);
    } else {
      setLocalPackages(prev => prev.map(p => p.id === cleaned.id ? cleaned : p));
    }
    triggerAlert(isCreating
      ? t('✓ Paquete creado.', '✓ Package created.', '✓ Pacote criado.')
      : t('✓ Paquete actualizado.', '✓ Package updated.', '✓ Pacote atualizado.'));
    setEditingId(null);
    setIsCreating(false);
  }, [editForm, isCreating, triggerAlert, t]);

  const updateField = useCallback(<K extends keyof PhotographyPackage>(field: K, value: PhotographyPackage[K]) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const addBenefit = useCallback(() => {
    setEditForm(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
  }, []);

  const updateBenefit = useCallback((index: number, value: string) => {
    setEditForm(prev => {
      const benefits = [...prev.benefits];
      benefits[index] = value;
      return { ...prev, benefits };
    });
  }, []);

  const removeBenefit = useCallback((index: number) => {
    setEditForm(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  }, []);

  const sorted = [...localPackages].sort((a, b) => a.sortOrder - b.sortOrder);
  const inputClass = "w-full bg-charcoal border border-[#D8C0A8] rounded px-2.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold-400 font-sans";
  const labelClass = "text-[9px] font-mono text-white/50 uppercase";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-white">
            {t('Paquetes Fotográficos', 'Photography Packages', 'Pacotes Fotográficos')}
          </h2>
          <p className="text-xs text-white/50">
            {t('Gestiona los paquetes que se muestran en la sección pública.', 'Manage packages shown in the public section.', 'Gerencie os pacotes mostrados na seção pública.')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={startCreate} className="py-1.5 px-3 bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/30 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer transition-all">
            <Plus size={11} />
            <span>{t('Nuevo', 'New', 'Novo')}</span>
          </button>
          <button onClick={handleSaveAll} className="py-1.5 px-4 bg-gold-500 text-dark hover:bg-gold-400 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer transition-all">
            <Save size={11} />
            <span>{t('Guardar Todo', 'Save All', 'Salvar Tudo')}</span>
          </button>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-overlay/80 backdrop-blur-sm overflow-y-auto pt-12">
          <div className="bg-charcoal border border-[#D8C0A8] rounded-2xl p-6 max-w-3xl w-full space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-serif text-lg text-white">
                {isCreating ? t('Nuevo Paquete', 'New Package', 'Novo Pacote') : t('Editar Paquete', 'Edit Package', 'Editar Pacote')}
              </h3>
              <button onClick={cancelEdit} className="text-white/50 hover:text-white cursor-pointer p-1">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left column */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={labelClass}>{t('Icono', 'Icon')}</label>
                  <select value={editForm.icon} onChange={(e) => updateField('icon', e.target.value)}
                    className="w-full bg-charcoal border border-[#D8C0A8] rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-gold-400">
                    {ICON_OPTIONS.map(ico => (
                      <option key={ico} value={ico} className="bg-charcoal">{ico}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Nombre / Name / Nome</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input value={editForm.name_es} onChange={(e) => updateField('name_es', e.target.value)} placeholder="Español" className={inputClass} />
                    <input value={editForm.name_en} onChange={(e) => updateField('name_en', e.target.value)} placeholder="English" className={inputClass} />
                    <input value={editForm.name_pt} onChange={(e) => updateField('name_pt', e.target.value)} placeholder="Português" className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>{t('Duración', 'Duration')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input value={editForm.duration_es} onChange={(e) => updateField('duration_es', e.target.value)} placeholder="Español" className={inputClass} />
                    <input value={editForm.duration_en} onChange={(e) => updateField('duration_en', e.target.value)} placeholder="English" className={inputClass} />
                    <input value={editForm.duration_pt} onChange={(e) => updateField('duration_pt', e.target.value)} placeholder="Português" className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>{t('Descripción', 'Description')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <textarea rows={2} value={editForm.description_es} onChange={(e) => updateField('description_es', e.target.value)} placeholder="Español" className={inputClass + " resize-none"} />
                    <textarea rows={2} value={editForm.description_en} onChange={(e) => updateField('description_en', e.target.value)} placeholder="English" className={inputClass + " resize-none"} />
                    <textarea rows={2} value={editForm.description_pt} onChange={(e) => updateField('description_pt', e.target.value)} placeholder="Português" className={inputClass + " resize-none"} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={labelClass}>{t('Precio (USD)', 'Price (USD)')}</label>
                    <input type="number" min="0" value={editForm.price} onChange={(e) => updateField('price', Number(e.target.value))} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>{t('Orden', 'Order')}</label>
                    <input type="number" min="0" value={editForm.sortOrder} onChange={(e) => updateField('sortOrder', Number(e.target.value))} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={labelClass}>{t('Texto "Desde"', '"From" text')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input value={editForm.priceFromText_es} onChange={(e) => updateField('priceFromText_es', e.target.value)} placeholder="Desde" className={inputClass} />
                    <input value={editForm.priceFromText_en} onChange={(e) => updateField('priceFromText_en', e.target.value)} placeholder="Starting from" className={inputClass} />
                    <input value={editForm.priceFromText_pt} onChange={(e) => updateField('priceFromText_pt', e.target.value)} placeholder="A partir de" className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>{t('Texto del Botón', 'Button Text')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input value={editForm.buttonText_es} onChange={(e) => updateField('buttonText_es', e.target.value)} placeholder="Español" className={inputClass} />
                    <input value={editForm.buttonText_en} onChange={(e) => updateField('buttonText_en', e.target.value)} placeholder="English" className={inputClass} />
                    <input value={editForm.buttonText_pt} onChange={(e) => updateField('buttonText_pt', e.target.value)} placeholder="Português" className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>{t('Imagen URL (opcional)', 'Image URL (optional)')}</label>
                  <input value={editForm.image || ''} onChange={(e) => updateField('image', e.target.value || undefined)} placeholder="https://..." className={inputClass} />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>{t('Color de tarjeta (opcional)', 'Card color (optional)')}</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={editForm.cardColor || '#461F1A'} onChange={(e) => updateField('cardColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-[#D8C0A8]" />
                    <input value={editForm.cardColor || ''} onChange={(e) => updateField('cardColor', e.target.value || undefined)} placeholder="#461F1A" className={inputClass} />
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={editForm.active} onChange={(e) => updateField('active', e.target.checked)} className="accent-gold-500 w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono text-white/70 uppercase">{t('Activo', 'Active')}</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={editForm.featured} onChange={(e) => updateField('featured', e.target.checked)} className="accent-gold-500 w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono text-white/70 uppercase">{t('Destacado', 'Featured')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between">
                <label className={labelClass}>{t('Beneficios', 'Benefits')}</label>
                <button type="button" onClick={addBenefit} className="text-[9px] font-mono text-gold-400 hover:text-gold-300 flex items-center space-x-1 cursor-pointer transition-colors">
                  <Plus size={10} />
                  <span>{t('Añadir beneficio', 'Add benefit')}</span>
                </button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {editForm.benefits.map((b, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input value={b} onChange={(e) => updateBenefit(i, e.target.value)}
                      placeholder={t('Escribe un beneficio...', 'Write a benefit...')}
                      className={"flex-1 " + inputClass} />
                    <button type="button" onClick={() => removeBenefit(i)} className="text-red-400/60 hover:text-red-400 cursor-pointer p-1">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2 border-t border-white/5">
              <button onClick={cancelEdit} className="px-4 py-2 border border-[#D8C0A8] rounded-lg text-[10px] font-mono text-white/70 hover:text-white cursor-pointer transition-all">
                {t('Cancelar', 'Cancel')}
              </button>
              <button onClick={saveEdit} className="px-4 py-2 bg-gold-500 text-dark font-mono text-[10px] tracking-widest uppercase font-bold rounded-lg hover:bg-gold-400 cursor-pointer transition-all">
                {isCreating ? t('Crear Paquete', 'Create Package') : t('Guardar Cambios', 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packages List */}
      <div className="space-y-2">
        {sorted.length === 0 && (
          <div className="text-center py-12 text-white/40 text-xs">
            {t('No hay paquetes todavía. Crea uno nuevo.', 'No packages yet. Create a new one.', 'Nenhum pacote ainda. Crie um novo.')}
          </div>
        )}
        {sorted.map((pkg) => {
          const pName = lang === 'es' ? pkg.name_es : lang === 'pt' ? pkg.name_pt : pkg.name_en;
          return (
            <div key={pkg.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${pkg.active ? 'border-[#D8C0A8] bg-dark-gray' : 'border-[#D8C0A8]/30 bg-dark-gray opacity-60'}`}>
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-[10px] font-mono text-white/30 w-6 text-right">{pkg.sortOrder}</span>
                <span className="text-xs text-white/50 font-mono w-20 truncate">{pkg.icon}</span>
                <span className="text-sm font-serif text-white truncate">{pName || '(sin nombre)'}</span>
                <span className="text-[10px] font-mono text-gold-400 font-bold">${pkg.price.toLocaleString()}</span>
                {pkg.featured && (
                  <span className="text-[8px] font-mono text-gold-400 border border-gold-500/30 bg-gold-500/10 px-1.5 py-0.5 rounded uppercase">Featured</span>
                )}
              </div>
              <div className="flex items-center space-x-1.5 shrink-0">
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input type="checkbox" checked={pkg.active} onChange={() => toggleActive(pkg.id)} className="accent-gold-500 w-3 h-3" />
                  <span className="text-[8px] font-mono text-white/40">{t('ON', 'ON')}</span>
                </label>
                <button onClick={() => startEdit(pkg)} className="p-1.5 text-white/40 hover:text-gold-400 cursor-pointer transition-colors" title={t('Editar', 'Edit')}>
                  <Edit3 size={12} />
                </button>
                <button onClick={() => removePackage(pkg.id)} className="p-1.5 text-white/40 hover:text-red-400 cursor-pointer transition-colors" title={t('Eliminar', 'Delete')}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
