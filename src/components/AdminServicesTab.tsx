import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Plus, X, Edit, Trash2, Check, Save } from 'lucide-react';
import { Service, ActiveLanguage } from '../types';
import { sanitizeString, sanitizeObject } from '../lib/sanitize';

interface AdminServicesTabProps {
  services: Service[];
  onUpdateServices: (services: Service[]) => void;
  triggerAlert: (msg: string) => void;
  lang: ActiveLanguage;
}

function AdminServicesTab({ services, onUpdateServices, triggerAlert, lang }: AdminServicesTabProps) {
  const [serviceEditItem, setServiceEditItem] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({});
  const [newInclusion, setNewInclusion] = useState<string>('');

  const handleEditService = useCallback((service: Service) => {
    setServiceEditItem(service);
    setServiceForm({ ...service });
  }, []);

  const handleSaveService = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceEditItem || !serviceForm.title) return;

    const safeForm = sanitizeObject(serviceForm as Record<string, unknown>) as Partial<Service>;
    const safeTitle = sanitizeString(safeForm.title || '');
    if (!safeTitle) return;

    const isExisting = services.some(s => s.id === serviceEditItem.id);

    if (isExisting) {
      const updated = services.map(s => {
        if (s.id === serviceEditItem.id) {
          return {
            ...s,
            ...safeForm,
            title: safeTitle,
            price: Number(safeForm.price) || 0,
          } as Service;
        }
        return s;
      });
      onUpdateServices(updated);
      triggerAlert('✓ Paquete de servicios actualizado correctamente');
    } else {
      const newService: Service = {
        id: serviceEditItem.id,
        title: safeTitle,
        description: sanitizeString(safeForm.description || ''),
        duration: sanitizeString(safeForm.duration || ''),
        includes: Array.isArray(safeForm.includes) ? safeForm.includes : [],
        price: Number(safeForm.price) || 0,
        slug: safeForm.slug || safeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        image: safeForm.image || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800'
      };
      onUpdateServices([...services, newService]);
      triggerAlert('✓ Paquete de servicios creado correctamente');
    }

    setServiceEditItem(null);
    setServiceForm({});
  }, [serviceEditItem, serviceForm, services, onUpdateServices, triggerAlert]);

  const handleAddInclusion = useCallback(() => {
    const safeText = sanitizeString(newInclusion);
    if (!safeText) return;
    const currentInclusions = Array.isArray(serviceForm.includes) ? serviceForm.includes : [];
    setServiceForm(prev => ({
      ...prev,
      includes: [...currentInclusions, safeText]
    }));
    setNewInclusion('');
  }, [newInclusion, serviceForm.includes]);

  const handleRemoveInclusion = useCallback((indexToRemove: number) => {
    setServiceForm(prev => ({
      ...prev,
      includes: Array.isArray(prev.includes) ? prev.includes.filter((_, idx) => idx !== indexToRemove) : []
    }));
  }, []);

  const handleDeleteService = useCallback((id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este paquete de servicios?')) {
      onUpdateServices(services.filter(s => s.id !== id));
      triggerAlert('✓ Paquete eliminado');
    }
  }, [services, onUpdateServices, triggerAlert]);

  const handleCreateNew = useCallback(() => {
    const id = `service-${Date.now()}`;
    setServiceEditItem({
      id,
      title: 'Nuevo Paquete Premium',
      description: 'Sesión fotográfica exclusiva para bodas, retratos, etc.',
      duration: '2 HORAS',
      includes: ['Fotografías ilimitadas', 'Entrega digital en alta resolución'],
      price: 350,
      slug: 'nuevo-paquete',
      image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800'
    });
    setServiceForm({
      id,
      title: 'Nuevo Paquete Premium',
      description: 'Sesión fotográfica exclusiva para bodas, retratos, etc.',
      duration: '2 HORAS',
      includes: ['Fotografías ilimitadas', 'Entrega digital en alta resolución'],
      price: 350,
      slug: 'nuevo-paquete',
      image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800'
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setServiceEditItem(null);
    setServiceForm({});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-white">
            {lang === 'es' ? 'Tarifas de Servicios Premium' : lang === 'pt' ? 'Tarifas de Serviços Premium' : 'Premium Service Tiers'}
          </h2>
          <p className="text-xs text-white/50">
            {lang === 'es' ? 'Edita las duraciones, precios, descripciones y elementos incluidos en tus paquetes.' : lang === 'pt' ? 'Edite as durações, preços, descrições e itens inclusos em seus pacotes.' : 'Edit durations, pricing matrix rates, and client inclusions.'}
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="py-1.5 px-3 bg-gold-500 text-dark hover:bg-gold-400 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer"
        >
          <Plus size={11} />
          <span>{lang === 'es' ? 'Crear Paquete' : 'Create Package'}</span>
        </button>
      </div>

      {serviceEditItem && (
        <form onSubmit={handleSaveService} className="bg-dark border border-gold-400/20 rounded-2xl p-6 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="font-serif text-lg text-white">
              {services.some(s => s.id === serviceEditItem.id) ? (lang === 'es' ? 'Modificar Paquete' : 'Edit Package') : (lang === 'es' ? 'Crear Paquete' : 'Create Package')}
            </h3>
            <button type="button" onClick={handleCancelEdit} className="p-1.5 rounded bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Título del Paquete' : 'Package Title'}</label>
              <input type="text" required value={serviceForm.title || ''} onChange={(e) => setServiceForm(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:border-gold-400 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/50 uppercase">Precio ($ USD)</label>
              <input type="number" required min="0" value={serviceForm.price ?? ''} onChange={(e) => setServiceForm(prev => ({ ...prev, price: Number(e.target.value) }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:border-gold-400 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Duración' : 'Duration'}</label>
              <input type="text" required value={serviceForm.duration || ''} onChange={(e) => setServiceForm(prev => ({ ...prev, duration: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:border-gold-400 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/50 uppercase">URL de Imagen</label>
              <input type="text" value={serviceForm.image || ''} onChange={(e) => setServiceForm(prev => ({ ...prev, image: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:border-gold-400 focus:outline-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/50 uppercase">{lang === 'es' ? 'Descripción' : 'Description'}</label>
            <textarea required rows={3} value={serviceForm.description || ''} onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:border-gold-400 focus:outline-none resize-none" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-white/50 uppercase block">{lang === 'es' ? 'Inclusiones' : 'Inclusions'}</label>
            <div className="flex gap-2">
              <input type="text" value={newInclusion} onChange={(e) => setNewInclusion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInclusion(); } }} className="flex-1 bg-dark/60 border border-white/10 rounded p-2 text-xs text-white focus:border-gold-400 focus:outline-none" />
              <button type="button" onClick={handleAddInclusion} className="px-3 bg-gold-500 hover:bg-gold-400 text-dark font-mono text-[10px] font-semibold uppercase tracking-wider rounded transition-all cursor-pointer">Añadir</button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2 max-h-36 overflow-y-auto p-1.5 bg-black/20 rounded border border-white/5">
              {(Array.isArray(serviceForm.includes) ? serviceForm.includes : []).map((inc, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded px-2.5 py-1 text-[10px] text-white/90">
                  <span>{inc}</span>
                  <button type="button" onClick={() => handleRemoveInclusion(idx)} className="text-white/45 hover:text-red-400 cursor-pointer transition-colors ml-1"><X size={10} /></button>
                </span>
              ))}
              {(Array.isArray(serviceForm.includes) ? serviceForm.includes : []).length === 0 && (
                <span className="text-[10px] text-white/30 italic p-1">No hay inclusiones registradas.</span>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-white/5">
            <button type="button" onClick={handleCancelEdit} className="px-4 py-2 border border-white/15 hover:bg-white/5 text-white rounded text-xs font-mono uppercase tracking-wider transition-all cursor-pointer">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-dark font-mono text-xs uppercase tracking-wider font-bold rounded shadow-lg shadow-gold-500/15 transition-all cursor-pointer">
              <Save size={12} className="inline mr-1" />
              {lang === 'es' ? 'Guardar Cambios' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-dark/40 border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1 text-left">
                  <h4 className="text-sm font-semibold text-white/95">{service.title}</h4>
                  <p className="text-[10px] font-mono text-gold-400 uppercase">{service.duration}</p>
                </div>
                <span className="font-mono text-base font-bold text-gold-400">${service.price}</span>
              </div>
              <p className="text-xs text-white/60 text-left line-clamp-3 leading-relaxed">{service.description}</p>
            </div>
            <div className="border-t border-white/5 pt-3 flex justify-between items-center">
              <span className="text-[9px] font-mono text-white/35 uppercase">Inclusions: {service.includes.length} Modules</span>
              <div className="flex items-center space-x-3">
                <button onClick={() => handleDeleteService(service.id)} className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center space-x-1 cursor-pointer" title="Eliminar Paquete"><Trash2 size={10} /><span>Delete</span></button>
                <button onClick={() => handleEditService(service)} className="text-xs font-mono text-gold-400 hover:text-gold-300 flex items-center space-x-1 cursor-pointer"><Edit size={10} /><span>Edit Package</span></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(AdminServicesTab);
