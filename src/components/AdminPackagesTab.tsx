import { useState, useCallback, useEffect } from 'react';
import { Save, Plus, Trash2, Edit3, X, Upload, Star } from 'lucide-react';
import { PhotographyPackage, ActiveLanguíage, SessionCategory } from '../types';
import { uploadImageBlob } from '../lib/db';
import StorageImage from './StorageImage';

async function compressToBlob(file: File, maxSize = 1200, quality = 0.8): Promise<Blob> {
  const rawUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
  const img = new Image();
  return await new Promise<Blob>((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      if (w > h) {
        if (w > maxSize) { h *= maxSize / w; w = maxSize; }
      } else {
        if (h > maxSize) { w *= maxSize / h; h = maxSize; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context failed')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error('toBlob failed')),
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = rawUrl;
  });
}

interface AdminPackagesTabProps {
  sessionCategories: SessionCategory[];
  packages: PhotographyPackage[];
  onUpdatePackages: (packages: PhotographyPackage[]) => void;
  triggerAlert: (msg: string) => void;
  lang: ActiveLanguíage;
}

function emptyPackage(categories: SessionCategory[]): PhotographyPackage {
  const firstCat = categories.find(c => c.active);
  return {
    id: 'pkg-' + Date.now(),
    category: firstCat?.id || '',
    name_es: '', name_en: '',
    price: 0,
    priceFromText_es: 'Desde',
    priceFromText_en: 'Starting from',
    duration_es: '', duration_en: '',
    description_es: '', description_en: '',
    benefits: [''],
    benefits_es: [''],
    benefits_en: [''],
    buttonText_es: 'Contratar paquete',
    buttonText_en: 'Book this package',
    travelNote_es: 'Gastos de viaje y movilidad no incluidos',
    travelNote_en: 'Travel and mobility expenses not included',
    sortOrder: 0,
    active: true,
    featured: false,
  };
}

export default function AdminPackagesTab({ sessionCategories, packages, onUpdatePackages, triggerAlert, lang }: AdminPackagesTabProps) {
  const [localPackages, setLocalPackages] = useState<PhotographyPackage[]>(packages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PhotographyPackage>(emptyPackage(sessionCategories));
  const [isCreating, setIsCreating] = useState(false);

  const activeCategories = sessionCategories.filter(c => c.active).sort((a, b) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    setLocalPackages(packages);
  }, [packages]);

  const t = (es: string, en: string) => {
    if (lang === 'en') return en;
    return es;
  };

  const handleSaveAll = useCallback(async () => {
    const cleaned = localPackages.map(p => ({
      ...p,
      benefits: p.benefits.filter(b => b.trim() !== ''),
      benefits_es: p.benefits_es?.filter(b => b.trim() !== ''),
      benefits_en: p.benefits_en?.filter(b => b.trim() !== ''),
    }));
    try {
      await onUpdatePackages(cleaned);
      triggerAlert(t('✓ Paquetes guíardados.', '✓ Packages saved.'));
    } catch (err) {
      console.error('[packages] save failed:', err);
      triggerAlert(t('Error al guardar paquetes', 'Failed to save packages'));
    }
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
    const newPkg = emptyPackage(sessionCategories);
    newPkg.sortOrder = localPackages.length + 1;
    setEditForm(newPkg);
    setIsCreating(true);
    setEditingId(newPkg.id);
  }, [localPackages, sessionCategories]);

  const startEdit = useCallback((pkg: PhotographyPackage) => {
    setEditForm({
      ...pkg,
      benefits: pkg.benefits.length > 0 ? [...pkg.benefits] : [''],
      benefits_es: pkg.benefits_es?.length ? [...pkg.benefits_es] : [''],
      benefits_en: pkg.benefits_en?.length ? [...pkg.benefits_en] : [''],
    });
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
      benefits_es: editForm.benefits_es?.filter(b => b.trim() !== ''),
      benefits_en: editForm.benefits_en?.filter(b => b.trim() !== ''),
    };
    if (isCreating) {
      setLocalPackages(prev => [...prev, cleaned]);
    } else {
      setLocalPackages(prev => prev.map(p => p.id === cleaned.id ? cleaned : p));
    }
    triggerAlert(isCreating
      ? t('✓ Paquete creado.', '✓ Package created.')
      : t('✓ Paquete actualizado.', '✓ Package updated.'));
    setEditingId(null);
    setIsCreating(false);
  }, [editForm, isCreating, triggerAlert, t]);

  const updateField = useCallback(<K extends keyof PhotographyPackage>(field: K, value: PhotographyPackage[K]) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const benefitRowCount = Math.max(
    editForm.benefits?.length || 0,
    editForm.benefits_es?.length || 0,
    editForm.benefits_en?.length || 0,
    1
  );

  const addBenefit = useCallback(() => {
    setEditForm(prev => ({
      ...prev,
      benefits: [...(prev.benefits || []), ''],
      benefits_es: [...(prev.benefits_es || []), ''],
      benefits_en: [...(prev.benefits_en || []), ''],
    }));
  }, []);

  const updateBenefit = useCallback((index: number, field: 'benefits' | 'benefits_es' | 'benefits_en', value: string) => {
    setEditForm(prev => {
      const arr = [...(prev[field] || [])];
      while (arr.length <= index) arr.push('');
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  }, []);

  const removeBenefit = useCallback((index: number) => {
    setEditForm(prev => ({
      ...prev,
      benefits: (prev.benefits || []).filter((_, i) => i !== index),
      benefits_es: (prev.benefits_es || []).filter((_, i) => i !== index),
      benefits_en: (prev.benefits_en || []).filter((_, i) => i !== index),
    }));
  }, []);

  // Group packages by category
  const grouped = activeCategories.map(cat => ({
    category: cat,
    packages: localPackages
      .filter(p => p.category === cat.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  const uncategorized = localPackages.filter(p => !p.category || !sessionCategories.some(c => c.id === p.category));

  const inputClass = "w-full bg-charcoal border border-stone rounded px-2.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans";
  const labelClass = "text-[9px] font-mono text-white/50 uppercase";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-white">
            {t('Paquetes Fotogr\u00e1ficos', 'Photography Packages')}
          </h2>
          <p className="text-xs text-white/50">
            {t('Gestiona los paquetes por tipo de sesión.', 'Manage packages by session type.')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={startCreate} className="py-1.5 px-3 bg-white/10 hover:bg-white/15 text-white/70 border border-white/10 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer transition-all">
            <Plus size={11} />
            <span>{t('Nuevo', 'New')}</span>
          </button>
          <button onClick={handleSaveAll} className="py-1.5 px-4 bg-white/10 text-white border border-white/10 hover:bg-white/15 text-white rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer transition-all">
            <Save size={11} />
            <span>{t('Guardar Todo', 'Save All')}</span>
          </button>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-overlay/80 backdrop-blur-sm overflow-y-auto pt-12">
          <div className="bg-charcoal border border-stone rounded-lg p-6 max-w-3xl w-full space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif text-lg text-white">
                {isCreating ? t('Nuevo Paquete', 'New Package') : t('Editar Paquete', 'Edit Package')}
              </h3>
              <button onClick={cancelEdit} className="text-white/50 hover:text-white cursor-pointer p-1">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left column */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={labelClass}>{t('Categoría', 'Category')}</label>
                  <select value={editForm.category} onChange={(e) => updateField('category', e.target.value)}
                    className="w-full bg-charcoal border border-stone rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-white/30">
                    <option value="" style={{ backgroundColor: '#1a1b1e', color: 'rgba(255,255,255,0.5)' }}>{t('Seleccionar categoría...', 'Select category...')}</option>
                    {activeCategories.map(cat => (
                      <option key={cat.id} value={cat.id} style={{ backgroundColor: '#1a1b1e', color: '#F0F0F0' }}>
                        {lang === 'es' ? cat.name_es : cat.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Nombre / Name</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editForm.name_es} onChange={(e) => updateField('name_es', e.target.value)} placeholder="Español" className={inputClass} />
                    <input value={editForm.name_en} onChange={(e) => updateField('name_en', e.target.value)} placeholder="English" className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>{t('Duración', 'Duration')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editForm.duration_es} onChange={(e) => updateField('duration_es', e.target.value)} placeholder="Español" className={inputClass} />
                    <input value={editForm.duration_en} onChange={(e) => updateField('duration_en', e.target.value)} placeholder="English" className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>{t('Descripción', 'Description')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <textarea rows={2} value={editForm.description_es} onChange={(e) => updateField('description_es', e.target.value)} placeholder="Español" className={inputClass + " resize-none"} />
                    <textarea rows={2} value={editForm.description_en} onChange={(e) => updateField('description_en', e.target.value)} placeholder="English" className={inputClass + " resize-none"} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={labelClass}>{t('Precio ($)', 'Price ($)')}</label>
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
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editForm.priceFromText_es} onChange={(e) => updateField('priceFromText_es', e.target.value)} placeholder="Desde" className={inputClass} />
                    <input value={editForm.priceFromText_en} onChange={(e) => updateField('priceFromText_en', e.target.value)} placeholder="Starting from" className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>{t('Texto del Botón', 'Button Text')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editForm.buttonText_es} onChange={(e) => updateField('buttonText_es', e.target.value)} placeholder="Español" className={inputClass} />
                    <input value={editForm.buttonText_en} onChange={(e) => updateField('buttonText_en', e.target.value)} placeholder="English" className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>{t('Nota de viaje', 'Travel Note')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editForm.travelNote_es || ''} onChange={(e) => updateField('travelNote_es', e.target.value || undefined)} placeholder="Español" className={inputClass} />
                    <input value={editForm.travelNote_en || ''} onChange={(e) => updateField('travelNote_en', e.target.value || undefined)} placeholder="English" className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>{t('Imagen del paquete', 'Package Image')}</label>
                  <div className="flex items-center space-x-2">
                    <input value={editForm.image || ''} onChange={(e) => updateField('image', e.target.value || undefined)} placeholder="https://..." className={inputClass} />
                    <label className="shrink-0 py-2 px-3 bg-white/10 hover:bg-white/20 border border-stone rounded text-[9px] font-mono text-white/70 hover:text-white uppercase tracking-widest cursor-pointer transition-all whitespace-nowrap">
                      {t('Subir', 'Upload')}
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const blob = await compressToBlob(file);
                          const id = `pkg-${editForm.id}-${Date.now()}`;
                          const downloadUrl = await uploadImageBlob(`packages/${id}.jpg`, blob);
                          updateField('image', downloadUrl);
                        } catch (err) {
                          console.error('Package image upload failed', err);
                        }
                        e.target.value = '';
                      }} />
                    </label>
                  </div>
                  {editForm.image && (
                    <div className="rounded-lg overflow-hidden border border-white/10 mt-1">
                      <StorageImage src={editForm.image} alt="Preview" className="w-full h-20 object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={editForm.active} onChange={(e) => updateField('active', e.target.checked)} className="accent-white/50 w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono text-white/70 uppercase">{t('Activo', 'Active')}</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={editForm.featured} onChange={(e) => updateField('featured', e.target.checked)} className="accent-white/50 w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono text-white/70 uppercase">{t('Destacado', 'Featured')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <label className={labelClass}>{t('Beneficios', 'Benefits')}</label>
                <button type="button" onClick={addBenefit} className="text-[9px] font-mono text-white/70 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors">
                  <Plus size={10} />
                  <span>{t('Añadir beneficio', 'Add benefit')}</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-white/30 uppercase px-1">
                <span>Español</span>
                <span>English</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {Array.from({ length: benefitRowCount }).map((_, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 items-start">
                    <input value={(editForm.benefits_es || [])[i] || ''} onChange={(e) => updateBenefit(i, 'benefits_es', e.target.value)}
                      placeholder={t('Beneficio...', 'Benefit...')}
                      className={inputClass} />
                    <div className="flex items-center space-x-1">
                      <input value={(editForm.benefits_en || [])[i] || ''} onChange={(e) => updateBenefit(i, 'benefits_en', e.target.value)}
                        placeholder="Benefit..."
                        className={"flex-1 " + inputClass} />
                      <button type="button" onClick={() => removeBenefit(i)} className="text-red-400/60 hover:text-red-400 cursor-pointer p-1 shrink-0">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2 border-t border-white/10">
              <button onClick={cancelEdit} className="px-4 py-2 border border-stone rounded-lg text-[10px] font-mono text-white/70 hover:text-white cursor-pointer transition-all">
                {t('Cancelar', 'Cancel')}
              </button>
              <button onClick={saveEdit} className="px-4 py-2 bg-white/10 text-white border border-white/10 font-mono text-[10px] tracking-widest uppercase font-bold rounded-lg hover:bg-white/15 text-white cursor-pointer transition-all">
                {isCreating ? t('Crear Paquete', 'Create Package') : t('Guardar Cambios', 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packages List — Grouped by Category */}
      <div className="space-y-6">
        {grouped.map(({ category: cat, packages: catPkgs }) => {
          if (catPkgs.length === 0) return null;
          return (
            <div key={cat.id} className="space-y-2">
              <div className="flex items-center space-x-2 border-b border-white/10 pb-2 mb-2">
                <span className="text-[10px] font-mono text-white/90 uppercase tracking-widest font-semibold">
                  {lang === 'es' ? cat.name_es : cat.name_en}
                </span>
                <span className="text-[9px] font-mono text-white/30">({catPkgs.length})</span>
              </div>
              {catPkgs.map((pkg) => {
                const pName = lang === 'es' ? pkg.name_es : pkg.name_en;
                return (
                  <div key={pkg.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${pkg.active ? 'border-stone bg-dark-gray' : 'border-stone/30 bg-dark-gray opacity-60'}`}>
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-white/30 w-6 text-right">{pkg.sortOrder}</span>
                      {pkg.image && (
                        <div className="w-8 h-8 rounded overflow-hidden shrink-0 bg-charcoal border border-white/10">
                          <StorageImage src={pkg.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className="text-sm font-serif text-white truncate">{pName || '(sin nombre)'}</span>
                      <span className="text-[10px] font-mono text-white/90 font-bold">${pkg.price.toLocaleString()}</span>
                      {pkg.featured && (
                        <span className="text-[11px] font-mono text-white/90 border border-white/10 bg-white/5 px-1.5 py-0.5 rounded uppercase">Featured</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button onClick={() => toggleFeatured(pkg.id)} className={`p-1.5 cursor-pointer transition-colors ${pkg.featured ? 'text-amber-400 hover:text-amber-300' : 'text-white/30 hover:text-amber-400'}`} title={pkg.featured ? t('Quitar de destacados', 'Unfeature') : t('Marcar como destacado', 'Feature')}>
                        <Star size={12} fill={pkg.featured ? 'currentColor' : 'none'} />
                      </button>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input type="checkbox" checked={pkg.active} onChange={() => toggleActive(pkg.id)} className="accent-white/50 w-3 h-3" />
                        <span className="text-[11px] font-mono text-white/40">{t('ON', 'ON')}</span>
                      </label>
                      <label className="p-1.5 text-white/40 hover:text-white/90 cursor-pointer transition-colors" title={t('Subir imagen', 'Upload image')}>
                        <Upload size={12} />
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const blob = await compressToBlob(file);
                            const id = `pkg-${pkg.id}-${Date.now()}`;
                            const downloadUrl = await uploadImageBlob(`packages/${id}.jpg`, blob);
                            setLocalPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, image: downloadUrl } : p));
                          } catch (err) {
                            console.error('Package image upload failed', err);
                          }
                          e.target.value = '';
                        }} />
                      </label>
                      <button onClick={() => startEdit(pkg)} className="p-1.5 text-white/40 hover:text-white/90 cursor-pointer transition-colors" title={t('Editar', 'Edit')}>
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
          );
        })}

        {/* Uncategorized packages */}
        {uncategorized.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 border-b border-white/10 pb-2 mb-2">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                {t('Sin categoría', 'Uncategorized')}
              </span>
            </div>
            {uncategorized.map((pkg) => (
              <div key={pkg.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${pkg.active ? 'border-stone bg-dark-gray' : 'border-stone/30 bg-dark-gray opacity-60'}`}>
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-sm font-serif text-white truncate">{pkg.name_es || pkg.name_en || '(sin nombre)'}</span>
                  <span className="text-[10px] font-mono text-white/90 font-bold">${pkg.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button onClick={() => toggleFeatured(pkg.id)} className={`p-1.5 cursor-pointer transition-colors ${pkg.featured ? 'text-amber-400 hover:text-amber-300' : 'text-white/30 hover:text-amber-400'}`} title={pkg.featured ? t('Quitar de destacados', 'Unfeature') : t('Marcar como destacado', 'Feature')}>
                    <Star size={12} fill={pkg.featured ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => startEdit(pkg)} className="p-1.5 text-white/40 hover:text-white/90 cursor-pointer transition-colors" title={t('Editar', 'Edit')}>
                    <Edit3 size={12} />
                  </button>
                  <button onClick={() => removePackage(pkg.id)} className="p-1.5 text-white/40 hover:text-red-400 cursor-pointer transition-colors" title={t('Eliminar', 'Delete')}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {grouped.every(g => g.packages.length === 0) && uncategorized.length === 0 && (
          <div className="text-center py-12 text-white/40 text-xs">
            {t('No hay paquetes todavía. Crea uno nuevo.', 'No packages yet. Create a new one.')}
          </div>
        )}
      </div>
    </div>
  );
}
