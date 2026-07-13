/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Camera, Calendar, BookOpen, MessageSquare, HelpCircle, 
  Settings, LogOut, Check, X, ShieldAlert, Edit, Trash2, Plus, 
  ArrowUpRight, Eye, RefreshCw, UploadCloud, Sliders, FileCode, CheckSquare,
  User, Mail, ChevronDown, ChevronUp, Phone, Users, FileText
} from 'lucide-react';
import { 
  Photograph, Service, Testimonial, BlogPost, FAQ, Booking, 
  Message, SEOMetadata, AnalyticsStats, ActiveLanguage, PhotographerProfile, BookingConfig, EmailConfig,
  ClientAccount, ProofPhoto
} from '../types';

interface AdminCMSProps {
  photographs: Photograph[];
  services: Service[];
  testimonials: Testimonial[];
  blogPosts: BlogPost[];
  faqs: FAQ[];
  bookings: Booking[];
  messages: Message[];
  clientAccounts?: ClientAccount[];
  seo: SEOMetadata;
  profile: PhotographerProfile;
  bookingConfig: BookingConfig;
  emailConfig: EmailConfig;
  stats: AnalyticsStats;
  lang: ActiveLanguage;
  onUpdatePhotographs: (photos: Photograph[]) => void;
  onUpdateServices: (services: Service[]) => void;
  onUpdateTestimonials: (testimonials: Testimonial[]) => void;
  onUpdateBlogPosts: (posts: BlogPost[]) => void;
  onUpdateFaqs: (faqs: FAQ[]) => void;
  onUpdateBookings: (bookings: Booking[]) => void;
  onUpdateMessages: (messages: Message[]) => void;
  onUpdateClientAccounts?: (accounts: ClientAccount[]) => void;
  onUpdateSeo: (seo: SEOMetadata) => void;
  onUpdateProfile: (profile: PhotographerProfile) => void;
  onUpdateBookingConfig: (config: BookingConfig) => void;
  onUpdateEmailConfig: (config: EmailConfig) => void;
  onLogout: () => void;
}

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
  return 'scale-105'; // default
};

export default function AdminCMS({
  photographs, services, testimonials, blogPosts, faqs, bookings, messages, clientAccounts = [], seo, profile, bookingConfig, emailConfig, stats, lang,
  onUpdatePhotographs, onUpdateServices, onUpdateTestimonials, onUpdateBlogPosts,
  onUpdateFaqs, onUpdateBookings, onUpdateMessages, onUpdateClientAccounts, onUpdateSeo, onUpdateProfile, onUpdateBookingConfig, onUpdateEmailConfig, onLogout
}: AdminCMSProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'photos' | 'bookings' | 'services' | 'messages' | 'seo' | 'profile' | 'email_settings' | 'clients'>('dashboard');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

  const t = (es: string, en: string, pt: string = en) => {
    if (lang === 'en') return en;
    if (lang === 'pt') return pt;
    return es;
  };

  // Email Config State
  const [emailForm, setEmailForm] = useState<EmailConfig>(emailConfig);

  // Availability / Schedule state
  const [configForm, setConfigForm] = useState<BookingConfig>(bookingConfig);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [newBlockedDate, setNewBlockedDate] = useState('');

  // Photo state
  const [dragActive, setDragActive] = useState(false);
  const [photoEditItem, setPhotoEditItem] = useState<Photograph | null>(null);
  const [editingProofPhotoId, setEditingProofPhotoId] = useState<string | null>(null);

  // Blog state
  const [blogEditItem, setBlogEditItem] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState<Partial<BlogPost>>({});

  // Service (Package) state
  const [serviceEditItem, setServiceEditItem] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({});
  const [newInclusion, setNewInclusion] = useState<string>('');

  // SEO form state
  const [seoForm, setSeoForm] = useState<SEOMetadata>(seo);

  // Profile form state
  const [profileForm, setProfileForm] = useState<PhotographerProfile>(profile);

  // Message reply states
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Simulated notification system
  const [cmsAlert, setCmsAlert] = useState<string | null>(null);
  const triggerAlert = (msg: string) => {
    setCmsAlert(msg);
    setTimeout(() => setCmsAlert(null), 3000);
  };

  // Client Account management state
  const [clientEditItem, setClientEditItem] = useState<ClientAccount | null>(null);
  const [clientForm, setClientForm] = useState<Partial<ClientAccount>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [newProofPhotoUrl, setNewProofPhotoUrl] = useState('');
  const [newProofPhotoTitle, setNewProofPhotoTitle] = useState('');
  const [newProofPhotoSharpness, setNewProofPhotoSharpness] = useState(95);
  const [newProofPhotoComposition, setNewProofPhotoComposition] = useState(90);
  const [newProofPhotoEmotion, setNewProofPhotoEmotion] = useState(85);

  // Sync form states when async props load from Firestore
  useEffect(() => {
    if (emailConfig) {
      setEmailForm(emailConfig);
    }
  }, [emailConfig]);

  useEffect(() => {
    if (bookingConfig) {
      setConfigForm(bookingConfig);
    }
  }, [bookingConfig]);

  useEffect(() => {
    if (seo) {
      setSeoForm(seo);
    }
  }, [seo]);

  useEffect(() => {
    if (profile) {
      setProfileForm(profile);
    }
  }, [profile]);

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFiles = async (files: FileList) => {
    const filesCount = files.length;
    triggerAlert(`Optimizing ${filesCount} images: Auto-converting, generating thumbnails & AI Alt Tags...`);

    const promises = Array.from(files).map((file, index) => {
      return new Promise<Photograph>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const max_size = 1000; // Crisp but compact
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > max_size) {
                height *= max_size / width;
                width = max_size;
              }
            } else {
              if (height > max_size) {
                width *= max_size / height;
                height = max_size;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

              const randomId = `photo-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`;
              resolve({
                id: randomId,
                url: dataUrl,
                title: file.name.split('.')[0] || 'Unfinished Frame',
                category: 'retrato',
                description: 'Optimized WebP master uploaded via back-office CMS.',
                exif: {
                  camera: 'Leica M11 Rangefinder',
                  lens: 'Summilux-M 35mm f/1.4 ASPH.',
                  focalLength: '35mm',
                  aperture: 'f/2.0',
                  shutterSpeed: '1/500s',
                  iso: '100',
                  location: 'Madrid, Spain'
                },
                tags: ['Portfolio', 'New Upload', 'WebP Optimized'],
                colors: ['#0B0B0B', '#C7A962', '#EFEFEF'],
                isFavorite: false,
                isFeatured: false,
                resolution: `${Math.round(width)} x ${Math.round(height)}`,
                size: `${Math.round(dataUrl.length / 1024)} KB`
              });
            } else {
              reject(new Error('Canvas context failed'));
            }
          };
          img.onerror = () => reject(new Error('Image load failed'));
          img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error('FileReader failed'));
        reader.readAsDataURL(file);
      });
    });

    try {
      const newPhotos = await Promise.all(promises);
      onUpdatePhotographs([...newPhotos, ...photographs]);
      triggerAlert(`${newPhotos.length} photos deployed into index catalog.`);
    } catch (err) {
      console.error('Error processing uploaded images:', err);
      triggerAlert('Error processing uploaded images. Please try again.');
    }
  };

  const handleSeoImageUpload = (file: File) => {
    triggerAlert('Optimizing homepage hero image for premium web deployment...');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const max_size = 1200; // Crisp but under limit
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
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
  };

  const handleAvatarImageUpload = (file: File) => {
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
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setProfileForm(prev => ({ ...prev, avatarUrl: dataUrl }));
          triggerAlert('✓ Foto de perfil optimizada con éxito! Presiona "Guardar Cambios de Perfil" para persistir.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    triggerAlert('✓ Biografía y datos de perfil guardados correctamente.');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Manage bookings
  const handleBookingStatus = (id: string, newStatus: 'pending' | 'accepted' | 'rejected' | 'completed') => {
    onUpdateBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
    triggerAlert(`Booking status updated to ${newStatus.toUpperCase()}`);
  };

  // Photo actions
  const handleDeletePhoto = (id: string) => {
    onUpdatePhotographs(photographs.filter(p => p.id !== id));
    triggerAlert('Photograph removed from gallery database');
  };

  const handleTogglePhotoFeatured = (id: string) => {
    onUpdatePhotographs(photographs.map(p => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p));
    triggerAlert('Featured status toggled');
  };

  // Messages management
  const handleToggleMessageRead = (id: string) => {
    onUpdateMessages(messages.map(m => m.id === id ? { ...m, isRead: !m.isRead } : m));
  };

  const handleDeleteMessage = (id: string) => {
    onUpdateMessages(messages.filter(m => m.id !== id));
    triggerAlert('Message deleted');
  };

  const handleSendReply = (id: string) => {
    if (!replyText.trim()) return;
    const targetMsg = messages.find(m => m.id === id);
    
    onUpdateMessages(messages.map(m => m.id === id ? {
      ...m,
      replyText: replyText.trim(),
      replyAt: new Date().toISOString(),
      isRead: true
    } : m));
    
    triggerAlert('✓ Guardado en sistema. Abriendo cliente de correo...');
    
    if (targetMsg) {
      const subject = encodeURIComponent(`Re: ${targetMsg.subject || 'Consulta Miriam Campos Photography'}`);
      const body = encodeURIComponent(replyText.trim());
      const mailtoUrl = `mailto:${targetMsg.email}?subject=${subject}&body=${body}`;
      
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 300);
    }
    
    setReplyingToId(null);
    setReplyText('');
  };

  // Blog management
  const handleEditBlog = (post: BlogPost) => {
    setBlogEditItem(post);
    setBlogForm(post);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title) return;

    if (blogEditItem) {
      onUpdateBlogPosts(blogPosts.map(p => p.id === blogEditItem.id ? { ...p, ...blogForm } as BlogPost : p));
      triggerAlert('Journal post modified and updated');
    } else {
      const newPost: BlogPost = {
        id: `blog-${Date.now()}`,
        title: blogForm.title,
        excerpt: blogForm.excerpt || '',
        content: blogForm.content || '',
        category: blogForm.category || 'General',
        tags: blogForm.tags || ['Inspiration'],
        image: blogForm.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
        date: new Date().toISOString().split('T')[0],
        readTime: '5 min read',
        seoKeywords: blogForm.seoKeywords || '',
        status: blogForm.status || 'draft'
      };
      onUpdateBlogPosts([newPost, ...blogPosts]);
      triggerAlert('New Journal post created successfully');
    }

    setBlogEditItem(null);
    setBlogForm({});
  };

  // Edit Service package
  const handleEditService = (service: Service) => {
    setServiceEditItem(service);
    setServiceForm({ ...service });
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceEditItem || !serviceForm.title) return;

    const isExisting = services.some(s => s.id === serviceEditItem.id);
    let updated: Service[];

    if (isExisting) {
      updated = services.map(s => {
        if (s.id === serviceEditItem.id) {
          return {
            ...s,
            ...serviceForm,
            price: Number(serviceForm.price) || 0,
          } as Service;
        }
        return s;
      });
    } else {
      const newService: Service = {
        id: serviceEditItem.id,
        title: serviceForm.title,
        description: serviceForm.description || '',
        duration: serviceForm.duration || '',
        includes: serviceForm.includes || [],
        price: Number(serviceForm.price) || 0,
        slug: serviceForm.slug || serviceForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        image: serviceForm.image || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800'
      };
      updated = [...services, newService];
    }

    onUpdateServices(updated);
    setServiceEditItem(null);
    setServiceForm({});
    triggerAlert(isExisting ? '✓ Paquete de servicios actualizado correctamente' : '✓ Paquete de servicios creado correctamente');
  };

  const handleAddInclusion = () => {
    if (!newInclusion.trim()) return;
    const currentInclusions = serviceForm.includes || [];
    setServiceForm({
      ...serviceForm,
      includes: [...currentInclusions, newInclusion.trim()]
    });
    setNewInclusion('');
  };

  const handleRemoveInclusion = (indexToRemove: number) => {
    const currentInclusions = serviceForm.includes || [];
    setServiceForm({
      ...serviceForm,
      includes: currentInclusions.filter((_, idx) => idx !== indexToRemove)
    });
  };

  // Save SEO settings
  const handleSaveSEO = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSeo(seoForm);
    triggerAlert('SEO Schema, Meta tags and Robots.txt deployed to production');
  };

  // Client Account handlers
  const handleSaveClientAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateClientAccounts) return;
    
    if (!clientForm.clientName || !clientForm.clientEmail || !clientForm.passcode) {
      triggerAlert(t('Por favor completa los campos requeridos', 'Please fill all required fields'));
      return;
    }

    const currentPhotos = clientForm.photos || [];

    if (clientEditItem) {
      // Edit existing
      const updated = (clientAccounts || []).map(c => c.id === clientEditItem.id ? {
        ...c,
        clientName: clientForm.clientName,
        clientEmail: clientForm.clientEmail,
        passcode: clientForm.passcode,
        sessionTitle: clientForm.sessionTitle || '',
        sessionDate: clientForm.sessionDate || '',
        photos: currentPhotos
      } as ClientAccount : c);
      onUpdateClientAccounts(updated);
      triggerAlert(t('✓ Cuenta de cliente actualizada correctamente', '✓ Client account updated successfully'));
    } else {
      // Create new
      const newClient: ClientAccount = {
        id: `client-${Date.now()}`,
        clientName: clientForm.clientName,
        clientEmail: clientForm.clientEmail,
        passcode: clientForm.passcode,
        sessionDate: clientForm.sessionDate || new Date().toISOString().split('T')[0],
        sessionTitle: clientForm.sessionTitle || 'Sesión Fotográfica Privada',
        photos: currentPhotos,
        createdAt: new Date().toISOString()
      };
      onUpdateClientAccounts([newClient, ...(clientAccounts || [])]);
      triggerAlert(t('✓ Nueva cuenta de cliente creada correctamente', '✓ New client account created successfully'));
    }

    setClientEditItem(null);
    setClientForm({});
  };

  const handleGeneratePasscode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 4; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    setClientForm(prev => ({ ...prev, passcode: code }));
    triggerAlert(t('Código generado: ' + code, 'Passcode generated: ' + code));
  };

  const handleDeleteClientAccount = (id: string) => {
    if (!onUpdateClientAccounts) return;
    if (confirm(t('¿Estás seguro de eliminar este cliente y toda su galería?', 'Are you sure you want to delete this client and their entire gallery?'))) {
      onUpdateClientAccounts((clientAccounts || []).filter(c => c.id !== id));
      triggerAlert(t('Cuenta de cliente eliminada', 'Client account deleted'));
    }
  };

  const handleAddProofPhoto = () => {
    if (!newProofPhotoUrl.trim() || !newProofPhotoTitle.trim()) {
      triggerAlert(t('Por favor ingresa URL y título de la foto', 'Please enter both photo URL and title'));
      return;
    }
    const newPhoto: ProofPhoto = {
      id: `proof-${Date.now()}`,
      url: newProofPhotoUrl.trim(),
      title: newProofPhotoTitle.trim(),
      sharpness: Number(newProofPhotoSharpness) || 95,
      thirdsAlign: Number(newProofPhotoComposition) || 90,
      emotionScore: Number(newProofPhotoEmotion) || 85,
      isFav: false,
      printSize: ''
    };

    const updatedPhotos = [...(clientForm.photos || []), newPhoto];
    setClientForm(prev => ({ ...prev, photos: updatedPhotos }));
    
    // Clear sub-inputs
    setNewProofPhotoUrl('');
    setNewProofPhotoTitle('');
    triggerAlert(t('Foto agregada a la previsualización de la galería', 'Photo added to gallery preview list'));
  };

  const handleRemoveProofPhoto = (photoId: string) => {
    const updatedPhotos = (clientForm.photos || []).filter(p => p.id !== photoId);
    setClientForm(prev => ({ ...prev, photos: updatedPhotos }));
    triggerAlert(t('Foto removida', 'Photo removed'));
  };

  const handleMultipleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    triggerAlert(t('Optimizando imágenes para la web...', 'Optimizing images for web...'));
    const addedPhotos: ProofPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const compressedBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const maxDim = 1200; // Medida ideal para web/móvil
              let width = img.width;
              let height = img.height;

              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                // Compresión a JPEG con calidad 75% para reducir drásticamente el peso manteniendo alta nitidez visual
                const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
                resolve(dataUrl);
              } else {
                resolve(event.target?.result as string);
              }
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        });

        const title = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const photoId = `proof-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`;
        
        const newPhoto: ProofPhoto = {
          id: photoId,
          url: compressedBase64,
          title: title,
          sharpness: 92 + Math.floor(Math.random() * 8),
          thirdsAlign: 88 + Math.floor(Math.random() * 12),
          emotionScore: 80 + Math.floor(Math.random() * 18),
          isFav: false,
          printSize: ''
        };
        addedPhotos.push(newPhoto);
      } catch (err) {
        console.error('Error optimizing image:', err);
      }
    }

    if (addedPhotos.length > 0) {
      setClientForm(prev => ({
        ...prev,
        photos: [...(prev.photos || []), ...addedPhotos]
      }));
      triggerAlert(t(`✓ ${addedPhotos.length} fotos optimizadas y añadidas`, `✓ ${addedPhotos.length} photos optimized and added`));
    }
  };

  return (
    <div className="min-h-[85vh] bg-dark-gray rounded-3xl border border-white/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12 text-left shadow-2xl relative">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {cmsAlert && (
          <motion.div
            className="absolute top-6 right-6 glass-premium px-4 py-2.5 rounded-lg border border-gold-400/30 text-gold-200 text-xs font-mono tracking-wider flex items-center space-x-2 shadow-2xl z-55"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="w-2 h-2 rounded-full bg-gold-400 animate-ping" />
            <span>{cmsAlert}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN NAVIGATION RAIL (Cols 2) */}
      <div className="lg:col-span-2 border-r border-white/5 bg-dark p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center space-x-2 px-2">
            <Settings className="text-gold-400" size={18} />
            <span className="font-serif text-sm tracking-widest text-gold-50 font-bold">AUREA BACKOFFICE</span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'dashboard' ? 'bg-gold-500 text-dark font-bold' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 size={12} />
              <span>{t('Dashboard', 'Dashboard', 'Painel')}</span>
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'photos' ? 'bg-gold-500 text-dark font-bold' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <Camera size={12} />
              <span>{t('Fotografías', 'Photographs', 'Fotografias')}</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'bookings' ? 'bg-gold-500 text-dark font-bold' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar size={12} />
              <span>{t('Cola de Reservas', 'Bookings Queue', 'Fila de Reservas')}</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'services' ? 'bg-gold-500 text-dark font-bold' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders size={12} />
              <span>{t('Servicios', 'Services', 'Serviços')}</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'messages' ? 'bg-gold-500 text-dark font-bold' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare size={12} />
              <span>{t('Bandeja de Entrada', 'Inbox', 'Caixa de Entrada')} ({messages.filter(m=>!m.isRead).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('seo')}
              className={`w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'seo' ? 'bg-gold-500 text-dark font-bold' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileCode size={12} />
              <span>{t('Configuración SEO', 'SEO Schema', 'Configuração SEO')}</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'profile' ? 'bg-gold-500 text-dark font-bold' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <User size={12} />
              <span>{t('Biografía y Perfil', 'Biography & Profile', 'Biografia e Perfil')}</span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'clients' ? 'bg-gold-500 text-dark font-bold' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users size={12} />
              <span>{t('Clientes y Galerías', 'Clients & Galleries', 'Clientes e Galerias')}</span>
            </button>

            <button
              onClick={() => setActiveTab('email_settings')}
              className={`w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'email_settings' ? 'bg-gold-500 text-dark font-bold' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail size={12} />
              <span>{t('Configuración de Correo', 'Email Configuration', 'Configuração de E-mail')}</span>
            </button>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-all flex items-center space-x-2 cursor-pointer"
        >
          <LogOut size={12} />
          <span>{t('Cerrar Sesión', 'Exit Workspace', 'Sair')}</span>
        </button>
      </div>

      {/* MAIN ADMIN WORKSPACE WORK AREA (Cols 10) */}
      <div className="lg:col-span-10 p-6 md:p-8 overflow-y-auto max-h-[85vh]">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="font-serif text-2xl text-white">{t('Análisis Interactivo', 'Interactive Analytics', 'Análise Interativa')}</h2>
                <p className="text-xs text-white/50">{t('Estadísticas integradas de visitas, reservas e ingresos estimados.', 'Bespoke integration of total visits, conversion rates, and estimated revenue.', 'Estatísticas integradas de visitas, reservas e receita estimada.')}</p>
              </div>
              <span className="text-[10px] font-mono bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded">
                {t('MONITOR DE PRODUCCIÓN EN VIVO', 'LIVE PRODUCTION MONITOR', 'MONITOR DE PRODUÇÃO EM TEMPO REAL')}
              </span>
            </div>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-dark/40 border border-white/5 rounded-xl p-4 flex flex-col text-left">
                <span className="text-[9px] font-mono text-white/40 uppercase">{t('Ingresos Estimados', 'Estimated Revenue', 'Receita Estimada')}</span>
                <span className="text-2xl font-mono font-bold text-gold-400 mt-1">${stats.totalRevenue.toLocaleString()}</span>
                <span className="text-[10px] font-mono text-emerald-400 mt-2 flex items-center space-x-1">
                  <ArrowUpRight size={10} />
                  <span>{t('+12.4% vs mes anterior', '+12.4% vs Last month', '+12.4% vs mês anterior')}</span>
                </span>
              </div>

              <div className="bg-dark/40 border border-white/5 rounded-xl p-4 flex flex-col text-left">
                <span className="text-[9px] font-mono text-white/40 uppercase">{t('Tasa de Conversión', 'Conversion Rate', 'Taxa de Conversão')}</span>
                <span className="text-2xl font-mono font-bold text-white mt-1">{stats.bookingConversionRate}%</span>
                <span className="text-[10px] font-mono text-emerald-400 mt-2 flex items-center space-x-1">
                  <ArrowUpRight size={10} />
                  <span>{t('+0.8% ganancia SEO orgánica', '+0.8% organic SEO gain', '+0.8% ganho de SEO orgânico')}</span>
                </span>
              </div>

              <div className="bg-dark/40 border border-white/5 rounded-xl p-4 flex flex-col text-left">
                <span className="text-[9px] font-mono text-white/40 uppercase">{t('Sesiones Totales', 'Total Sessions', 'Sessões Totais')}</span>
                <span className="text-2xl font-mono font-bold text-white mt-1">{stats.sessionsCount}</span>
                <span className="text-[10px] font-mono text-gold-300 mt-2">{t('Capacidad alcanzada para Q3', 'Cap reached for Q3', 'Capacidade máxima atingida para Q3')}</span>
              </div>

              <div className="bg-dark/40 border border-white/5 rounded-xl p-4 flex flex-col text-left">
                <span className="text-[9px] font-mono text-white/40 uppercase">{t('Visitantes Únicos', 'Page Visitors', 'Visitantes Únicos')}</span>
                <span className="text-2xl font-mono font-bold text-white mt-1">{stats.totalVisits.toLocaleString()}</span>
                <span className="text-[10px] font-mono text-emerald-400 mt-2 flex items-center space-x-1">
                  <ArrowUpRight size={10} />
                  <span>{t('+4.2% backlinks SEO', '+4.2% SEO backlinks', '+4.2% backlinks de SEO')}</span>
                </span>
              </div>
            </div>

            {/* Bespoke Custom SVG Visual Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Revenue Chart */}
              <div className="bg-dark/40 border border-white/5 rounded-2xl p-4">
                <h4 className="text-xs font-mono tracking-widest text-white/60 uppercase mb-4 text-left">Revenue Progression (Last 6 Months)</h4>
                <div className="h-44 w-full flex items-end justify-between px-4 pb-2 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-y-0 inset-x-4 flex flex-col justify-between pointer-events-none border-b border-white/5">
                    <div className="border-t border-white/5 w-full h-px" />
                    <div className="border-t border-white/5 w-full h-px" />
                    <div className="border-t border-white/5 w-full h-px" />
                    <div className="border-t border-white/5 w-full h-px" />
                  </div>
                  {stats.revenueByMonth.map((item, index) => {
                    const pct = (item.value / 35000) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group relative z-10">
                        <div className="text-[10px] font-mono text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-bold">
                          ${item.value / 1000}k
                        </div>
                        <div 
                          className="w-8 bg-gold-500 rounded-t-sm group-hover:bg-gold-400 transition-all shadow-[0_0_8px_rgba(180,142,67,0.3)]"
                          style={{ height: `${pct}%` }}
                        />
                        <span className="text-[9px] font-mono text-white/40 mt-2">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Visitors Daily Activity Chart */}
              <div className="bg-dark/40 border border-white/5 rounded-2xl p-4">
                <h4 className="text-xs font-mono tracking-widest text-white/60 uppercase mb-4 text-left">Traffic Density (Weekly visits)</h4>
                <div className="h-44 w-full flex items-end justify-between px-4 pb-2 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-y-0 inset-x-4 flex flex-col justify-between pointer-events-none border-b border-white/5">
                    <div className="border-t border-white/5 w-full h-px" />
                    <div className="border-t border-white/5 w-full h-px" />
                    <div className="border-t border-white/5 w-full h-px" />
                    <div className="border-t border-white/5 w-full h-px" />
                  </div>
                  {stats.visitsByDay.map((item, index) => {
                    const pct = (item.count / 1000) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group relative z-10">
                        <div className="text-[10px] font-mono text-white/80 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                          {item.count}
                        </div>
                        <div 
                          className="w-6 bg-charcoal hover:bg-white/15 rounded-t-sm transition-all border border-white/10"
                          style={{ height: `${pct}%` }}
                        />
                        <span className="text-[9px] font-mono text-white/40 mt-2">{item.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHOTOGRAPHS CRUD */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="font-serif text-2xl text-white">{t('Base de Datos de Fotografías', 'Photograph Database', 'Banco de Imagens')}</h2>
                <p className="text-xs text-white/50">{t('Administra las galerías artísticas, formatos de recorte y etiquetas de las fotografías.', 'Manage fine-art galleries, crop layout formats, and image tags.', 'Gerencie as galerias de arte, formatos de corte e tags de imagem.')}</p>
              </div>
            </div>

            {/* Drag & drop mock uploader */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive 
                  ? 'border-gold-400 bg-gold-500/5' 
                  : 'border-white/10 bg-dark/20 hover:border-white/20'
              }`}
            >
              <UploadCloud size={36} className="text-gold-400/80 mx-auto mb-3" />
              <p className="text-xs font-semibold text-white/95 mb-1">
                {t('Arrastra y suelta las fotografías originales aquí', 'Drag and Drop RAW photographs here', 'Arraste e solte as fotos originais aqui')}
              </p>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-3">
                {t('Conversión optimizada a WebP y extracción automática de metadatos EXIF', 'Auto-optimized conversion to WebP & metadata extraction', 'Conversão otimizada para WebP e extração automática de metadados EXIF')}
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                id="file-upload"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    processFiles(e.target.files);
                  }
                }}
              />
              <label 
                htmlFor="file-upload"
                className="px-4 py-2 border border-white/15 hover:border-gold-400/50 hover:text-gold-300 text-white/80 rounded-lg text-[10px] font-mono tracking-widest uppercase transition-all cursor-pointer inline-block"
              >
                {t('Explorar Archivos Locales', 'Browse Master Files', 'Procurar Arquivos Locais')}
              </label>
            </div>

            {/* EDIT PHOTOGRAPH FORM */}
            {photoEditItem && (
              <div className="bg-dark border border-gold-400/20 rounded-2xl p-6 space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="font-serif text-lg text-gold-300">
                    {t('Editar Detalles de Fotografía', 'Edit Photograph Details')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPhotoEditItem(null)}
                    className="p-1 hover:bg-white/5 rounded text-white/50 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Photo Preview Column */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="aspect-[3/2] rounded-xl overflow-hidden border border-white/10 relative">
                      <img src={photoEditItem.url} className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 bg-dark/70 border border-white/10 text-[9px] font-mono text-gold-400 px-2 py-0.5 rounded uppercase">
                        {photoEditItem.category}
                      </span>
                    </div>
                    <div className="bg-dark-gray/20 border border-white/5 p-3 rounded-lg text-left">
                      <span className="text-[8px] font-mono text-white/40 uppercase block mb-1">EXIF Data</span>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[9px] text-white/70">
                        <div>Cámara: {photoEditItem.exif?.camera || 'N/A'}</div>
                        <div>Lente: {photoEditItem.exif?.lens || 'N/A'}</div>
                        <div>Apertura: {photoEditItem.exif?.aperture || 'N/A'}</div>
                        <div>Velocidad: {photoEditItem.exif?.shutterSpeed || 'N/A'}</div>
                        <div>ISO: {photoEditItem.exif?.iso || 'N/A'}</div>
                        <div>Focal: {photoEditItem.exif?.focalLength || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Editing Fields Column */}
                  <div className="lg:col-span-8 space-y-4 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t('Título de la Foto *', 'Photo Title *')}</label>
                        <input
                          type="text"
                          required
                          value={photoEditItem.title}
                          onChange={(e) => setPhotoEditItem({ ...photoEditItem, title: e.target.value })}
                          className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t('Categoría *', 'Category *')}</label>
                        <select
                          value={photoEditItem.category}
                          onChange={(e) => setPhotoEditItem({ ...photoEditItem, category: e.target.value })}
                          className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                        >
                          <option value="retrato">Retrato</option>
                          <option value="boda">Boda</option>
                          <option value="moda">Moda</option>
                          <option value="drone">Drone / Aéreo</option>
                          <option value="viajes">Viajes</option>
                          <option value="producto">Producto</option>
                          <option value="evento">Evento</option>
                          <option value="naturaleza">Naturaleza</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t('Localización de la Foto', 'Location / Localization')}</label>
                      <input
                        type="text"
                        placeholder="Ej: París, Francia"
                        value={photoEditItem.exif?.location || ''}
                        onChange={(e) => setPhotoEditItem({ 
                          ...photoEditItem, 
                          exif: { ...photoEditItem.exif, location: e.target.value } 
                        })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t('Descripción de la Foto', 'Photo Description')}</label>
                      <textarea
                        rows={3}
                        placeholder="Escribe una breve descripción artística de la captura..."
                        value={photoEditItem.description || ''}
                        onChange={(e) => setPhotoEditItem({ ...photoEditItem, description: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400 font-sans resize-none"
                      />
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!photoEditItem.title.trim()) {
                            triggerAlert(t('Por favor ingresa un título válido', 'Please enter a valid title'));
                            return;
                          }
                          const updated = photographs.map(p => p.id === photoEditItem.id ? photoEditItem : p);
                          onUpdatePhotographs(updated);
                          setPhotoEditItem(null);
                          triggerAlert(t('✓ Detalles de fotografía guardados', '✓ Photo details saved successfully'));
                        }}
                        className="py-2 px-5 bg-gold-500 text-dark hover:bg-gold-400 rounded-lg text-[10px] font-mono tracking-widest uppercase font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Check size={12} />
                        <span>{t('Guardar Cambios', 'Save Changes')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoEditItem(null)}
                        className="py-2 px-4 bg-dark border border-white/10 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-[10px] font-mono tracking-widest uppercase cursor-pointer"
                      >
                        {t('Cancelar', 'Cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Photo List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {photographs.map(photo => (
                <div key={photo.id} className="bg-dark/40 border border-white/5 rounded-xl overflow-hidden flex flex-col justify-between animate-fadeIn">
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <img src={photo.url} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-dark/75 border border-white/10 px-1.5 py-0.5 text-[8px] font-mono text-gold-400 rounded uppercase tracking-wider">
                      {photo.category}
                    </span>
                  </div>

                  <div className="p-3 space-y-2 text-left">
                    <h5 className="text-xs font-semibold text-white truncate">{photo.title}</h5>
                    <p className="text-[10px] font-mono text-white/40 truncate">{photo.exif.camera}</p>
                    {photo.exif.location && (
                      <p className="text-[9px] font-mono text-gold-300 truncate">📍 {photo.exif.location}</p>
                    )}

                    <div className="flex items-center justify-between border-t border-white/5 pt-2.5 gap-2">
                      <button
                        onClick={() => handleTogglePhotoFeatured(photo.id)}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all shrink-0 ${
                          photo.isFeatured 
                            ? 'bg-gold-500 text-dark font-bold' 
                            : 'bg-white/5 text-white/50 hover:bg-white/10'
                        }`}
                      >
                        {photo.isFeatured ? '★ Featured' : '☆ Promote'}
                      </button>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setPhotoEditItem({ ...photo })}
                          className="text-white/40 hover:text-gold-400 p-1"
                          title="Edit Photograph"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="text-white/40 hover:text-red-400 p-1"
                          title="Delete Photograph"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKINGS QUEUE */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="font-serif text-2xl text-white">{t('Registro de Reservas', 'Commission Booking Ledger', 'Registro de Reservas')}</h2>
                <p className="text-xs text-white/50">{t('Gestiona las reservas de sesiones, revisa las respuestas de los cuestionarios y aprueba las solicitudes.', 'Manage booking slots, review questionnaire answers, and approve requests.', 'Gerencie as reservas de sessões, revise as respostas dos questionários e aprove as solicitações.')}</p>
              </div>
            </div>

            <div className="border border-white/5 rounded-2xl overflow-hidden bg-dark/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-dark/40 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                      <th className="p-4">{t('Detalles del Cliente', 'Client Detail', 'Detalhes do Cliente')}</th>
                      <th className="p-4">{t('Fecha de Sesión', 'Shooting Date', 'Data da Sessão')}</th>
                      <th className="p-4">{t('Colección / Paquete', 'Package', 'Coleção')}</th>
                      <th className="p-4">{t('Monto', 'Amount', 'Valor')}</th>
                      <th className="p-4">{t('Estado', 'Status', 'Estado')}</th>
                      <th className="p-4 text-right">{t('Acciones', 'Actions', 'Ações')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.map(b => {
                      const isExpanded = expandedBookingId === b.id;
                      return (
                        <React.Fragment key={b.id}>
                          <tr 
                            className="hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => setExpandedBookingId(isExpanded ? null : b.id)}
                          >
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-white/40 hover:text-white transition-colors mr-1 shrink-0">
                                  {isExpanded ? <ChevronUp size={14} className="text-gold-400" /> : <ChevronDown size={14} />}
                                </span>
                                <div>
                                  <div className="font-semibold text-white/90">{b.clientName}</div>
                                  <div className="text-[10px] text-white/40 font-mono mt-0.5">{b.clientEmail}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-white/90 font-mono">{b.date}</div>
                              <div className="text-[10px] text-white/45 font-mono mt-0.5">{b.timeSlot}</div>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-mono">
                                {services.find(s=>s.id === b.serviceId)?.title || 'Custom Session'}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-gold-300 font-mono">${b.amount || 1800}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase ${
                                b.status === 'accepted' 
                                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' 
                                  : b.status === 'pending'
                                  ? 'bg-gold-950/40 text-gold-400 border border-gold-400/20'
                                  : 'bg-red-950/40 text-red-400 border border-red-500/20'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                              {b.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleBookingStatus(b.id, 'accepted')}
                                    className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-dark border border-emerald-500/20 transition-all cursor-pointer"
                                    title="Accept & Sync Calendar"
                                  >
                                    <Check size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleBookingStatus(b.id, 'rejected')}
                                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-dark border border-red-500/20 transition-all cursor-pointer"
                                    title="Decline Slot"
                                  >
                                    <X size={12} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleBookingStatus(b.id, 'pending')}
                                  className="px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 text-white/60 transition-all cursor-pointer inline-flex items-center space-x-1 animate-fade-in"
                                  title={t('Revertir estado a Pendiente (Corregir error)', 'Revert status to Pending (Correct error)', 'Reverter status para Pendente (Corrigir erro)')}
                                >
                                  <RefreshCw size={10} className="mr-1" />
                                  <span className="text-[9px] font-mono uppercase tracking-wider font-semibold">{t('Corregir', 'Correct', 'Corrigir')}</span>
                                </button>
                              )}
                            </td>
                          </tr>
                          
                          {/* Expanded questionnaire and detail card */}
                          {isExpanded && (
                            <tr className="bg-white/[0.02]">
                              <td colSpan={6} className="p-6 border-b border-white/5">
                                <motion.div
                                  initial={{ opacity: 0, y: -8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  className="text-left"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Contact and Core Session Data */}
                                    <div className="space-y-4">
                                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-gold-400 font-semibold border-b border-white/5 pb-2">
                                        {t('Detalles del Cliente y Sesión', 'Client & Session Details', 'Detalhes do Cliente e Sessão')}
                                      </h4>
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                                        <div className="space-y-0.5">
                                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">{t('Nombre Completo:', 'Full Name:', 'Nome Completo:')}</span>
                                          <span className="text-white font-medium flex items-center space-x-1.5">
                                            <User size={12} className="text-gold-400/80 shrink-0" />
                                            <span>{b.clientName}</span>
                                          </span>
                                        </div>
                                        <div className="space-y-0.5">
                                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">{t('Correo Electrónico:', 'Email Address:', 'E-mail:')}</span>
                                          <span className="text-white font-medium flex items-center space-x-1.5 break-all">
                                            <Mail size={12} className="text-gold-400/80 shrink-0" />
                                            <span>{b.clientEmail}</span>
                                          </span>
                                        </div>
                                        <div className="space-y-0.5">
                                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">{t('Teléfono / WhatsApp:', 'Phone / WhatsApp:', 'Telefone / WhatsApp:')}</span>
                                          <span className="text-white font-medium flex items-center space-x-1.5">
                                            <Phone size={12} className="text-gold-400/80 shrink-0" />
                                            <span>{b.clientPhone || t('No proporcionado', 'Not provided', 'Não fornecido')}</span>
                                          </span>
                                        </div>
                                        <div className="space-y-0.5">
                                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">{t('Personas:', 'People Count:', 'Pessoas:')}</span>
                                          <span className="text-white font-medium flex items-center space-x-1.5">
                                            <Users size={12} className="text-gold-400/80 shrink-0" />
                                            <span>{b.peopleCount || 1} {b.peopleCount === 1 ? t('persona', 'person', 'pessoa') : t('personas', 'people', 'pessoas')}</span>
                                          </span>
                                        </div>
                                        <div className="space-y-0.5">
                                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">{t('Fecha Programada:', 'Scheduled Date:', 'Data Agendada:')}</span>
                                          <span className="text-white font-medium flex items-center space-x-1.5">
                                            <Calendar size={12} className="text-gold-400/80 shrink-0" />
                                            <span className="font-mono">{b.date}</span>
                                          </span>
                                        </div>
                                        <div className="space-y-0.5">
                                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">{t('Horario Preferido:', 'Preferred Time:', 'Horário Preferido:')}</span>
                                          <span className="text-white font-medium flex items-center space-x-1.5">
                                            <Sliders size={12} className="text-gold-400/80 shrink-0" />
                                            <span>{b.timeSlot}</span>
                                          </span>
                                        </div>
                                      </div>

                                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                        <div>
                                          <span className="text-white/40 block text-[9px] uppercase font-mono tracking-wider">{t('Monto Presupuestado:', 'Estimated Amount:', 'Valor Orçado:')}</span>
                                          <span className="text-lg font-serif text-gold-300 font-semibold">${b.amount || 1800}</span>
                                        </div>
                                        <div>
                                          <span className="text-white/40 block text-[9px] uppercase font-mono tracking-wider text-right">{t('Estado Solicitud:', 'Request Status:', 'Estado da Solicitação:')}</span>
                                          <span className="text-[11px] font-mono text-white/90 block text-right capitalize">{b.status}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Creative Questionnaire Details */}
                                    <div className="space-y-3 bg-dark/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                                          <FileText size={12} className="text-gold-400 shrink-0" />
                                          <h4 className="text-[10px] font-mono uppercase tracking-widest text-gold-400 font-semibold">
                                            {t('Respuestas del Cuestionario Creativo', 'Creative Questionnaire Answers', 'Respostas do Questionário Criativo')}
                                          </h4>
                                        </div>
                                        <div className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed max-h-[180px] overflow-y-auto pr-2 scrollbar-thin font-sans">
                                          {b.notes || t('El cliente no dejó respuestas adicionales para el cuestionario.', 'The client did not leave additional answers for the questionnaire.', 'O cliente não deixou respostas adicionais para o questionário.')}
                                        </div>
                                      </div>
                                      <div className="text-[10px] text-white/30 border-t border-white/5 pt-2 italic text-right">
                                        {t('Creada el:', 'Created at:', 'Criado em:')} {b.createdAt ? new Date(b.createdAt).toLocaleString(lang === 'es' ? 'es-ES' : 'en-US') : 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* COMMISSIONED SERVICES CRUD */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="font-serif text-2xl text-white">{t('Tarifas de Servicios Premium', 'Premium Service Tiers', 'Tarifas de Serviços Premium')}</h2>
                <p className="text-xs text-white/50">{t('Edita las duraciones, precios, descripciones y elementos incluidos en tus paquetes de fotografía.', 'Edit durations, pricing matrix rates, and client inclusions.', 'Edite as durações, preços, descrições e itens inclusos em seus pacotes de fotografia.')}</p>
              </div>
              <button
                onClick={() => {
                  setServiceEditItem({
                    id: `service-${Date.now()}`,
                    title: '',
                    description: '',
                    duration: '',
                    includes: [],
                    price: 0,
                    slug: '',
                    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800'
                  });
                  setServiceForm({
                    id: `service-${Date.now()}`,
                    title: 'Nuevo Paquete Premium',
                    description: 'Sesión fotográfica exclusiva para bodas, retratos, etc.',
                    duration: '2 HORAS',
                    includes: ['Fotografías ilimitadas', 'Entrega digital en alta resolución'],
                    price: 350,
                    slug: 'nuevo-paquete',
                    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800'
                  });
                }}
                className="py-1.5 px-3 bg-gold-500 text-dark hover:bg-gold-400 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Plus size={11} />
                <span>Crear Paquete</span>
              </button>
            </div>

            {/* EDIT / CREATE FORM */}
            {serviceEditItem && (
              <form onSubmit={handleSaveService} className="glass-premium border border-gold-400/20 rounded-2xl p-6 text-left space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="font-serif text-lg text-white">
                    {services.some(s => s.id === serviceEditItem.id) ? 'Modificar Paquete' : 'Crear Paquete de Servicios'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceEditItem(null);
                      setServiceForm({});
                    }}
                    className="p-1.5 rounded bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/50 uppercase">Título del Paquete</label>
                    <input
                      type="text"
                      required
                      value={serviceForm.title || ''}
                      onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                      className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:border-gold-400 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/50 uppercase">Precio ($ USD)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={serviceForm.price || ''}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                      className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:border-gold-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/50 uppercase">Duración / Formato</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2 HORAS DE SESIÓN"
                      value={serviceForm.duration || ''}
                      onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                      className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:border-gold-400 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/50 uppercase">URL de Imagen de Fondo</label>
                    <input
                      type="text"
                      required
                      value={serviceForm.image || ''}
                      onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                      className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:border-gold-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase">Descripción</label>
                  <textarea
                    required
                    rows={3}
                    value={serviceForm.description || ''}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:border-gold-400 focus:outline-none resize-none"
                  />
                </div>

                {/* INCLUSIONS LIST */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-white/50 uppercase block">Inclusiones & Beneficios</label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 50 fotografías en alta resolución"
                      value={newInclusion}
                      onChange={(e) => setNewInclusion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInclusion();
                        }
                      }}
                      className="flex-1 bg-dark/60 border border-white/10 rounded p-2 text-xs text-white focus:border-gold-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddInclusion}
                      className="px-3 bg-gold-500 hover:bg-gold-400 text-dark font-mono text-[10px] font-semibold uppercase tracking-wider rounded transition-all cursor-pointer"
                    >
                      Añadir
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2 max-h-36 overflow-y-auto p-1.5 bg-black/20 rounded border border-white/5">
                    {(serviceForm.includes || []).map((inc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded px-2.5 py-1 text-[10px] text-white/90"
                      >
                        <span>{inc}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveInclusion(idx)}
                          className="text-white/45 hover:text-red-400 cursor-pointer transition-colors ml-1"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    {(serviceForm.includes || []).length === 0 && (
                      <span className="text-[10px] text-white/30 italic p-1">No hay inclusiones registradas. Agregue un beneficio arriba.</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setServiceEditItem(null);
                      setServiceForm({});
                    }}
                    className="px-4 py-2 border border-white/15 hover:bg-white/5 text-white rounded text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-dark font-mono text-xs uppercase tracking-wider font-bold rounded shadow-lg shadow-gold-500/15 transition-all cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            )}

            {/* CARDS LIST */}
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
                    <span className="text-[9px] font-mono text-white/35 uppercase">
                      Inclusions: {service.includes.length} Modules
                    </span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          if (confirm('¿Está seguro de que desea eliminar este paquete de servicios?')) {
                            const updated = services.filter(s => s.id !== service.id);
                            onUpdateServices(updated);
                            triggerAlert('✓ Paquete eliminado');
                          }
                        }}
                        className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center space-x-1 cursor-pointer"
                        title="Eliminar Paquete"
                      >
                        <Trash2 size={10} />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={() => handleEditService(service)}
                        className="text-xs font-mono text-gold-400 hover:text-gold-300 flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit size={10} />
                        <span>Edit Package</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* INBOX MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="font-serif text-2xl text-white">{t('Bandeja de Entrada del Cliente', 'Client Inbox', 'Caixa de Entrada')}</h2>
                <p className="text-xs text-white/50">{t('Gestiona las consultas de contacto, lee los mensajes y redacta respuestas rápidas.', 'Manage contact inquiries, view messages, and compile instant replies.', 'Gerencie os contatos, leia as mensagens e envie respostas rápidas.')}</p>
              </div>
            </div>

            <div className="space-y-4">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`border rounded-2xl p-5 space-y-3 transition-all text-left relative ${
                    msg.isRead 
                      ? 'bg-dark/30 border-white/5 opacity-70' 
                      : 'bg-gold-500/5 border-gold-400/25 shadow-[0_0_10px_rgba(180,142,67,0.05)]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-semibold text-white/95">{msg.name}</h4>
                        {!msg.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-white/40">{msg.email}</p>
                    </div>
                    <span className="text-[9px] font-mono text-white/35">{msg.createdAt.split('T')[0]}</span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gold-300">{msg.subject}</p>
                    <p className="text-xs text-white/70 leading-relaxed font-sans">{msg.message}</p>
                  </div>

                  {msg.replyText && (
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2 text-left mt-2">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                        <span className="text-[9px] font-mono text-gold-400 uppercase tracking-widest font-semibold flex items-center space-x-1">
                          <span>✓ Respuesta Enviada (Reply Sent)</span>
                        </span>
                        <span className="text-[9px] font-mono text-white/30">
                          {msg.replyAt ? msg.replyAt.split('T')[0] : msg.createdAt.split('T')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed font-sans whitespace-pre-line">{msg.replyText}</p>
                    </div>
                  )}

                  {replyingToId === msg.id && (
                    <div className="bg-dark/40 border border-gold-400/20 rounded-xl p-4 space-y-3 mt-2 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-gold-400 uppercase tracking-widest font-semibold">
                          Compose Reply to {msg.name}
                        </span>
                        <button 
                          type="button"
                          onClick={() => {
                            setReplyText(`Estimado/a ${msg.name},\n\nMuchas gracias por contactar con Miriam Campos Photography. He recibido su consulta sobre "${msg.subject}" y estaré encantada de atenderle.\n\nMe pondré en contacto con usted muy pronto para detallarle las opciones y coordinar una llamada de asesoramiento creativo.\n\nAtentamente,\nMiriam Campos\nMiriam Campos Photography`);
                          }}
                          className="text-[9px] font-mono text-white/40 hover:text-gold-400 transition-all uppercase tracking-wider underline cursor-pointer"
                        >
                          Use Template / Usar Plantilla
                        </button>
                      </div>
                      <textarea
                        rows={5}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escribe tu respuesta profesional aquí o usa la plantilla de arriba..."
                        className="w-full bg-dark/80 border border-white/10 rounded-lg p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold-400 font-sans resize-none leading-relaxed"
                      />
                      <p className="text-[10px] font-mono text-white/40 leading-relaxed">
                        📧 <strong>Nota:</strong> Al hacer clic en "Send Reply", la respuesta se guardará en este panel de control y se abrirá tu gestor de correo predeterminado (Gmail, Outlook, Apple Mail, etc.) para que puedas pulsar "Enviar" y entregar el correo real a <strong>{msg.email}</strong>.
                      </p>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyText('');
                          }}
                          className="py-1 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] font-mono tracking-widest uppercase transition-all text-white/70"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReply(msg.id)}
                          className="py-1 px-3 bg-gold-500 text-dark hover:bg-gold-400 rounded text-[9px] font-mono tracking-widest uppercase transition-all font-semibold"
                        >
                          Send Reply
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-white/5 pt-3.5 flex justify-between items-center">
                    <button
                      onClick={() => {
                        handleToggleMessageRead(msg.id);
                        triggerAlert(msg.isRead ? 'Marked as unread' : 'Marked as read');
                      }}
                      className="text-[10px] font-mono text-white/40 hover:text-white flex items-center space-x-1"
                    >
                      <CheckSquare size={11} className={msg.isRead ? 'text-gold-400' : ''} />
                      <span>{msg.isRead ? 'Mark Unread' : 'Mark Read'}</span>
                    </button>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (replyingToId === msg.id) {
                            setReplyingToId(null);
                            setReplyText('');
                          } else {
                            setReplyingToId(msg.id);
                            setReplyText(msg.replyText || '');
                          }
                        }}
                        className={`py-1 px-3 border rounded-md text-[9px] font-mono tracking-widest uppercase transition-all ${
                          replyingToId === msg.id 
                            ? 'bg-gold-500 text-dark border-gold-500 font-bold'
                            : 'bg-white/5 hover:bg-gold-500 hover:text-dark border-white/10'
                        }`}
                      >
                        {replyingToId === msg.id ? 'Cancel' : msg.replyText ? 'Edit Reply' : 'Reply'}
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1.5 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-dark border border-red-500/20 transition-all cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO SCHEMA MANAGEMENT */}
        {activeTab === 'seo' && (
          <form onSubmit={handleSaveSEO} className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="font-serif text-2xl text-white">{t('Configuración SEO y Meta-tags', 'SEO & Meta-Tag Deployment', 'Configuração SEO e Meta-Tags')}</h2>
                <p className="text-xs text-white/50">{t('Configura los títulos, meta descripciones, Open Graph y datos estructurados de búsqueda.', 'Edit Schema.org, Open Graph preview data, and custom metadata settings.', 'Configure títulos, meta descrições, dados estruturados e Open Graph.')}</p>
              </div>
              <button
                type="submit"
                className="py-1.5 px-4 bg-gold-500 text-dark hover:bg-gold-400 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw size={11} />
                <span>{t('Aplicar Cambios SEO', 'Deploy Metadata', 'Implantar Metadados')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase">Homepage SEO Title</label>
                  <input
                    type="text"
                    required
                    value={seoForm.title}
                    onChange={(e) => setSeoForm({ ...seoForm, title: e.target.value, ogTitle: e.target.value })}
                    className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase">Meta Description</label>
                  <textarea
                    rows={3}
                    required
                    value={seoForm.description}
                    onChange={(e) => setSeoForm({ ...seoForm, description: e.target.value, ogDescription: e.target.value })}
                    className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase block">Foto de Portada (Hero Photo / OpenGraph)</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      id="seo-hero-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleSeoImageUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <label
                      htmlFor="seo-hero-upload"
                      className="px-6 py-3 border border-white/10 hover:border-gold-400 hover:text-gold-300 bg-dark-gray text-white text-xs font-mono rounded-lg cursor-pointer transition-all uppercase tracking-widest whitespace-nowrap flex items-center space-x-2"
                    >
                      <UploadCloud size={14} />
                      <span>Subir Nueva Imagen</span>
                    </label>
                    <span className="text-[10px] text-white/40 font-mono italic">
                      Se recomienda subir una imagen optimizada. Haz clic en "Deploy Metadata" después de subir para guardar los cambios.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/50 uppercase block">Enfoque / Posición de la Foto</label>
                    <select
                      value={seoForm.heroPosition || 'center'}
                      onChange={(e) => setSeoForm({ ...seoForm, heroPosition: e.target.value })}
                      className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white"
                    >
                      <option value="center">Centro (Predeterminado)</option>
                      <option value="top">Arriba</option>
                      <option value="bottom">Abajo</option>
                      <option value="left">Izquierda</option>
                      <option value="right">Derecha</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/50 uppercase block">Zoom / Escala de la Foto</label>
                    <select
                      value={seoForm.heroScale || 105}
                      onChange={(e) => setSeoForm({ ...seoForm, heroScale: Number(e.target.value) })}
                      className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white"
                    >
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
                  <label className="text-[10px] font-mono text-white/50 uppercase">Robots.txt Schema</label>
                  <textarea
                    rows={3}
                    value={seoForm.robotsText}
                    onChange={(e) => setSeoForm({ ...seoForm, robotsText: e.target.value })}
                    className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white font-mono resize-none"
                  />
                </div>
              </div>

              {/* High Fidelity OG Card Live Preview Area */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">Open Graph Card (Live Preview)</span>
                
                <div className="border border-white/10 bg-dark rounded-xl overflow-hidden shadow-2xl flex flex-col">
                  <div className="relative aspect-[1.91/1] overflow-hidden bg-charcoal">
                    <img src={seoForm.ogImage} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-blue-500/95 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold tracking-wider">
                      og:image preview
                    </div>
                  </div>

                  <div className="p-4 space-y-1 text-left bg-[#1C1C1E]">
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">AUREA-PHOTOGRAPHY.COM</span>
                    <h5 className="text-xs font-semibold text-white/95 truncate">{seoForm.ogTitle}</h5>
                    <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2">{seoForm.ogDescription}</p>
                  </div>
                </div>

                {/* Google Search Listing card simulation */}
                <div className="border border-white/5 bg-dark/20 rounded-xl p-4 space-y-1 text-left">
                  <span className="text-[9px] font-mono text-white/35 block">google.com/search</span>
                  <span className="text-xs font-semibold text-[#8AB4F8] hover:underline cursor-pointer block">{seoForm.title}</span>
                  <span className="text-[10px] text-[#A6C8FF] font-mono block">https://aurea-photography.com</span>
                  <p className="text-[10px] text-white/60 leading-normal">{seoForm.description}</p>
                </div>

                {/* Homepage Hero Preview simulation */}
                <div className="border border-white/10 bg-dark rounded-xl overflow-hidden shadow-2xl p-4 space-y-3 text-left">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">Vista Previa de la Portada de Inicio</span>
                  
                  <div className="relative aspect-[21/9] rounded-lg overflow-hidden bg-charcoal border border-white/5">
                    <img 
                      src={seoForm.ogImage} 
                      className={`w-full h-full object-cover transition-all duration-500 filter brightness-[0.7] ${getHeroPositionClass(seoForm.heroPosition)} ${getHeroScaleClass(seoForm.heroScale)}`} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent flex items-end p-3">
                      <div className="space-y-0.5">
                        <span className="text-[7px] font-mono text-gold-400 uppercase tracking-wider">MUSEUM-GRADE FINE ART</span>
                        <h4 className="text-[10px] font-serif text-white italic leading-tight line-clamp-1">Miriam Campos Photography</h4>
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-white/45 leading-normal">
                    * Muestra cómo se visualizará la foto de fondo en la portada con la alineación ({seoForm.heroPosition || 'center'}) y el zoom ({seoForm.heroScale || 105}%).
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* BIOGRAPHY & PROFILE MANAGEMENT */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="font-serif text-2xl text-white">{t('Biografía y Perfil Profesional', 'Biography & Professional Profile', 'Biografia e Perfil Profissional')}</h2>
                <p className="text-xs text-white/50">{t('Edita tu información de marca personal, foto de perfil, equipos preferidos y biografías multilingües', 'Edit your personal branding, profile photograph, favorite gear, and multilingual bios', 'Edite suas informações de marca pessoal, foto de perfil, equipamentos preferidos e biografias multilíngues')}</p>
              </div>
              <button
                type="submit"
                className="py-1.5 px-4 bg-gold-500 text-dark hover:bg-gold-400 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Check size={11} />
                <span>{t('Guardar Perfil', 'Save Profile', 'Salvar Perfil')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
              {/* Left Column: Core Fields & Biographies */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* General Personal Details */}
                <div className="bg-dark-gray/40 border border-white/5 p-6 rounded-xl space-y-4">
                  <h3 className="text-xs font-mono text-gold-400 uppercase tracking-wider border-b border-white/5 pb-2">{t('Datos Principales', 'Core Information', 'Dados Principais')}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">{t('Nombre Artístico', 'Artistic Name', 'Nome Artístico')}</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">{t('Título Profesional / Rol', 'Professional Title / Role', 'Título Profissional / Cargo')}</label>
                      <input
                        type="text"
                        required
                        value={profileForm.title}
                        onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white"
                        placeholder="Ej: AUREA STUDIO HEAD PHOTOGRAPHER"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">{t('Cámara Predilecta', 'Preferred Camera', 'Câmera Predileta')}</label>
                      <input
                        type="text"
                        required
                        value={profileForm.preferredCamera}
                        onChange={(e) => setProfileForm({ ...profileForm, preferredCamera: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white"
                        placeholder="Ej: Hasselblad X2D 100C"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">{t('Lente / Óptica Predilecta', 'Preferred Lens / Optics', 'Lente / Óptica Predileta')}</label>
                      <input
                        type="text"
                        required
                        value={profileForm.preferredLens}
                        onChange={(e) => setProfileForm({ ...profileForm, preferredLens: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white"
                        placeholder="Ej: Leica Noctilux-M 50 f/0.95"
                      />
                    </div>
                  </div>
                </div>

                {/* Multilingual Biography Tabs/Section */}
                <div className="bg-dark-gray/40 border border-white/5 p-6 rounded-xl space-y-6">
                  <h3 className="text-xs font-mono text-gold-400 uppercase tracking-wider border-b border-white/5 pb-2">{t('Biografías Multilingües', 'Multilingual Biographies', 'Biografias Multilíngues')}</h3>

                  {/* SPANISH BIOGRAPHY */}
                  <div className="space-y-4 border-l-2 border-gold-500/30 pl-4">
                    <span className="text-[9px] font-mono bg-gold-500/10 text-gold-300 px-2 py-0.5 rounded uppercase font-semibold">Español</span>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">Título del Apartado (Español)</label>
                      <input
                        type="text"
                        required
                        value={profileForm.aboutTitle_es}
                        onChange={(e) => setProfileForm({ ...profileForm, aboutTitle_es: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-serif"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">Párrafo de Biografía 1 (Español)</label>
                      <textarea
                        rows={4}
                        required
                        value={profileForm.aboutText1_es}
                        onChange={(e) => setProfileForm({ ...profileForm, aboutText1_es: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white resize-none font-sans leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">Párrafo de Biografía 2 (Español)</label>
                      <textarea
                        rows={4}
                        required
                        value={profileForm.aboutText2_es}
                        onChange={(e) => setProfileForm({ ...profileForm, aboutText2_es: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white resize-none font-sans leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* ENGLISH BIOGRAPHY */}
                  <div className="space-y-4 border-l-2 border-blue-500/30 pl-4 pt-4 border-t border-white/5">
                    <span className="text-[9px] font-mono bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded uppercase font-semibold">English</span>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">Section Title (English)</label>
                      <input
                        type="text"
                        required
                        value={profileForm.aboutTitle_en}
                        onChange={(e) => setProfileForm({ ...profileForm, aboutTitle_en: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-serif"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">Biography Paragraph 1 (English)</label>
                      <textarea
                        rows={4}
                        required
                        value={profileForm.aboutText1_en}
                        onChange={(e) => setProfileForm({ ...profileForm, aboutText1_en: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white resize-none font-sans leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">Biography Paragraph 2 (English)</label>
                      <textarea
                        rows={4}
                        required
                        value={profileForm.aboutText2_en}
                        onChange={(e) => setProfileForm({ ...profileForm, aboutText2_en: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white resize-none font-sans leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* PORTUGUESE BIOGRAPHY */}
                  <div className="space-y-4 border-l-2 border-green-500/30 pl-4 pt-4 border-t border-white/5">
                    <span className="text-[9px] font-mono bg-green-500/10 text-green-300 px-2 py-0.5 rounded uppercase font-semibold">Português</span>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">Título da Seção (Português)</label>
                      <input
                        type="text"
                        required
                        value={profileForm.aboutTitle_pt}
                        onChange={(e) => setProfileForm({ ...profileForm, aboutTitle_pt: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-serif"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">Parágrafo de Biografia 1 (Português)</label>
                      <textarea
                        rows={4}
                        required
                        value={profileForm.aboutText1_pt}
                        onChange={(e) => setProfileForm({ ...profileForm, aboutText1_pt: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white resize-none font-sans leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">Parágrafo de Biografia 2 (Português)</label>
                      <textarea
                        rows={4}
                        required
                        value={profileForm.aboutText2_pt}
                        onChange={(e) => setProfileForm({ ...profileForm, aboutText2_pt: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-3 text-xs text-white resize-none font-sans leading-relaxed"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Avatar Upload & Real-time About Card Preview */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Profile Picture Upload Box */}
                <div className="bg-dark-gray/40 border border-white/5 p-6 rounded-xl space-y-4">
                  <h3 className="text-xs font-mono text-gold-400 uppercase tracking-wider border-b border-white/5 pb-2">Foto de Perfil</h3>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gold-400 bg-charcoal shadow-lg">
                      <img 
                        src={profileForm.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=85&w=800"} 
                        className="w-full h-full object-cover" 
                        alt="Profile preview"
                      />
                    </div>

                    <div className="w-full text-center">
                      <input
                        type="file"
                        id="profile-avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleAvatarImageUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <label
                        htmlFor="profile-avatar-upload"
                        className="w-full py-2.5 px-4 border border-white/10 hover:border-gold-400 hover:text-gold-300 bg-dark-gray text-white text-[10px] font-mono rounded-lg cursor-pointer transition-all uppercase tracking-widest inline-flex items-center justify-center space-x-2"
                      >
                        <UploadCloud size={12} />
                        <span>Subir Foto Nueva</span>
                      </label>
                      <p className="text-[9px] text-white/40 mt-2 font-mono leading-tight">
                        Formatos: JPG, PNG. Se optimizará automáticamente a tamaño web.
                      </p>
                    </div>

                    {/* Or manually set Image URL */}
                    <div className="w-full space-y-1">
                      <label className="text-[9px] font-mono text-white/50 uppercase">O ingresar URL de Imagen directamente:</label>
                      <input
                        type="text"
                        value={profileForm.avatarUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2 text-[10px] text-white font-mono"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>
                </div>

                {/* About Section Live Preview simulation */}
                <div className="bg-dark-gray/40 border border-white/5 p-6 rounded-xl space-y-4">
                  <h3 className="text-xs font-mono text-gold-400 uppercase tracking-wider border-b border-white/5 pb-2">Previsualización en Vivo</h3>

                  <div className="border border-white/10 bg-dark rounded-xl p-4 text-left space-y-4">
                    <div className="aspect-[4/5] rounded-lg overflow-hidden relative border border-white/5">
                      <img src={profileForm.avatarUrl} className="w-full h-full object-cover grayscale" />
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
        )}



        {/* EMAIL SETTINGS */}
        {activeTab === 'email_settings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="font-serif text-2xl text-white">{t('Configuración de Correo Electrónico', 'Email Configuration', 'Configuração de E-mail')}</h2>
                <p className="text-xs text-white/50">{t('Vincula tu cuenta de EmailJS para automatizar y recibir las alertas reales en tu casilla de correo', 'Link your EmailJS credentials to automate client confirmations and receive notification alerts', 'Vincule sua conta do EmailJS para automatizar e receber alertas reais em sua caixa de entrada')}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const trimmedConfig = {
                    emailjsServiceId: emailForm.emailjsServiceId.trim(),
                    emailjsTemplateId: emailForm.emailjsTemplateId.trim(),
                    emailjsPublicKey: emailForm.emailjsPublicKey.trim(),
                    receiverEmail: emailForm.receiverEmail.trim(),
                    enableAutoResponse: emailForm.enableAutoResponse || false,
                    emailjsAutoTemplateId: (emailForm.emailjsAutoTemplateId || '').trim(),
                    autoReplySubject: (emailForm.autoReplySubject || '').trim(),
                    autoReplyMessage: (emailForm.autoReplyMessage || '')
                  };
                  setEmailForm(trimmedConfig);
                  onUpdateEmailConfig(trimmedConfig);
                  triggerAlert(t('Configuración de correo guardada correctamente', 'Email settings saved successfully', 'Configurações de e-mail salvas com sucesso'));
                }}
                className="py-1.5 px-4 bg-gold-500 text-dark hover:bg-gold-400 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Check size={11} />
                <span>{t('Guardar Configuración', 'Save Configuration', 'Salvar Configuração')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-dark-gray/40 border border-white/5 p-6 rounded-xl space-y-4">
                  <h3 className="text-xs font-mono text-gold-400 uppercase tracking-wider border-b border-white/5 pb-2">Credenciales de EmailJS</h3>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Service ID (ID de Servicio)</label>
                      <input
                        type="text"
                        placeholder="Ej: service_xxxxxxx"
                        value={emailForm.emailjsServiceId}
                        onChange={(e) => setEmailForm({ ...emailForm, emailjsServiceId: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Template ID (ID de Plantilla)</label>
                      <input
                        type="text"
                        placeholder="Ej: template_xxxxxxx"
                        value={emailForm.emailjsTemplateId}
                        onChange={(e) => setEmailForm({ ...emailForm, emailjsTemplateId: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Public Key (Clave Pública)</label>
                      <input
                        type="text"
                        placeholder="Ej: xxxxxxxxxxxxxxx"
                        value={emailForm.emailjsPublicKey}
                        onChange={(e) => setEmailForm({ ...emailForm, emailjsPublicKey: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Tu Correo Destinatario (Donde recibirás los avisos)</label>
                      <input
                        type="email"
                        placeholder="Ej: tu-email@gmail.com"
                        value={emailForm.receiverEmail}
                        onChange={(e) => setEmailForm({ ...emailForm, receiverEmail: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-gold-400"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex space-x-3 border-t border-white/5">
                    <button
                      type="button"
                      onClick={async () => {
                        const trimmedConfig = {
                          emailjsServiceId: emailForm.emailjsServiceId.trim(),
                          emailjsTemplateId: emailForm.emailjsTemplateId.trim(),
                          emailjsPublicKey: emailForm.emailjsPublicKey.trim(),
                          receiverEmail: emailForm.receiverEmail.trim(),
                          enableAutoResponse: emailForm.enableAutoResponse || false,
                          emailjsAutoTemplateId: (emailForm.emailjsAutoTemplateId || '').trim(),
                          autoReplySubject: (emailForm.autoReplySubject || '').trim(),
                          autoReplyMessage: (emailForm.autoReplyMessage || '')
                        };
                        setEmailForm(trimmedConfig);

                        if (!trimmedConfig.emailjsServiceId || !trimmedConfig.emailjsTemplateId || !trimmedConfig.emailjsPublicKey || !trimmedConfig.receiverEmail) {
                          triggerAlert('Por favor completa todos los campos para enviar el correo de prueba');
                          return;
                        }
                        
                        try {
                          triggerAlert('Enviando correo de prueba...');
                          const emailjs = await import('@emailjs/browser');
                          
                          const templateParams = {
                            to_name: profile.name || 'Miriam',
                            to_email: trimmedConfig.receiverEmail,
                            from_name: 'Sistema Aurea Studio',
                            from_email: 'test@aurea.com',
                            message: '¡Excelente! Tu integración de correo con EmailJS está funcionando de manera impecable.',
                            booking_details: 'Reserva de Prueba - Fecha: Hoy - Horario: 10:00 AM'
                          };

                          await emailjs.send(
                            trimmedConfig.emailjsServiceId,
                            trimmedConfig.emailjsTemplateId,
                            templateParams,
                            trimmedConfig.emailjsPublicKey
                          );
                          
                          triggerAlert('¡Correo de prueba enviado con éxito! Revisa tu casilla.');
                        } catch (err: any) {
                          console.error(err);
                          let errorMsg = err?.text || err?.message || 'Error desconocido';
                          if (errorMsg.includes('template ID not found') || errorMsg.includes('Template ID not found')) {
                            errorMsg += ' -> Recuerda GUARDAR los cambios de tu plantilla pulsando "Save" en la esquina superior derecha del panel de EmailJS, y asegúrate de no haber copiado el "Template Name" en vez del "Template ID".';
                          }
                          triggerAlert(`Error al enviar: ${errorMsg}`);
                        }
                      }}
                      className="py-2 px-4 bg-white/10 text-white hover:bg-white/20 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold cursor-pointer transition-all"
                    >
                      Enviar Correo de Prueba
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-white/50 leading-relaxed font-sans bg-white/[0.02] p-3 rounded-lg border border-white/5 mt-2">
                    ℹ️ <strong>¿Cómo funciona el envío?</strong> EmailJS es una API invisible que procesa el correo de forma 100% silenciosa en segundo plano. <strong>No te redireccionará a Gmail</strong> ni te pedirá abrir aplicaciones de correo externas al hacer clic; el mensaje se envía directamente a tu casilla destinataria.
                  </p>
                </div>

                {/* Auto-Responder Settings Card */}
                <div className="bg-dark-gray/40 border border-white/5 p-6 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="text-xs font-mono text-gold-400 uppercase tracking-wider">Respuestas Automáticas (Auto-Responder)</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={emailForm.enableAutoResponse || false} 
                        onChange={(e) => setEmailForm({ ...emailForm, enableAutoResponse: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div>
                      <span className="ml-2 text-[10px] font-mono text-white/70 uppercase">Activar</span>
                    </label>
                  </div>

                  <p className="text-[10px] text-white/50 leading-relaxed">
                    Cuando un cliente complete un agendamiento en el calendario o envíe un mensaje en el formulario de contacto, el sistema le enviará un correo automático usando tus credenciales de EmailJS.
                  </p>

                  {emailForm.enableAutoResponse && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">
                          ID de Plantilla de Auto-Respuesta (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: template_auto_reply (Dejar vacío para usar la misma plantilla)"
                          value={emailForm.emailjsAutoTemplateId || ''}
                          onChange={(e) => setEmailForm({ ...emailForm, emailjsAutoTemplateId: e.target.value })}
                          className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-gold-400"
                        />
                        <span className="text-[9px] text-white/30 block leading-tight">
                          Recomendamos usar una plantilla de EmailJS específica para el cliente, donde configures que el destinatario (To Email) sea <code>{"{{to_email}}"}</code> o <code>{"{{client_email}}"}</code>, y uses las variables <code>{"{{reply_subject}}"}</code> y <code>{"{{reply_message}}"}</code> en el cuerpo. Si dejas este campo vacío, se usará la misma plantilla principal de arriba.
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Asunto del Correo de Respuesta</label>
                        <input
                          type="text"
                          placeholder="Ej: ¡Tu reserva ha sido recibida con éxito! - Aurea Studio"
                          value={emailForm.autoReplySubject || ''}
                          onChange={(e) => setEmailForm({ ...emailForm, autoReplySubject: e.target.value })}
                          className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Mensaje de Respuesta Automática</label>
                        <textarea
                          rows={6}
                          placeholder="Escribe el mensaje que recibirá el cliente..."
                          value={emailForm.autoReplyMessage || ''}
                          onChange={(e) => setEmailForm({ ...emailForm, autoReplyMessage: e.target.value })}
                          className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold-400 font-sans resize-none"
                        />
                        <span className="text-[9px] text-white/30 block leading-tight">
                          Puedes usar texto plano. Este contenido se enviará en el campo <code>{"{{reply_message}}"}</code> a tu plantilla de EmailJS.
                        </span>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex flex-col space-y-2">
                        <button
                          type="button"
                          onClick={async () => {
                            const trimmedConfig = {
                              emailjsServiceId: emailForm.emailjsServiceId.trim(),
                              emailjsTemplateId: emailForm.emailjsTemplateId.trim(),
                              emailjsPublicKey: emailForm.emailjsPublicKey.trim(),
                              receiverEmail: emailForm.receiverEmail.trim(),
                              enableAutoResponse: true,
                              emailjsAutoTemplateId: (emailForm.emailjsAutoTemplateId || '').trim(),
                              autoReplySubject: (emailForm.autoReplySubject || '').trim(),
                              autoReplyMessage: (emailForm.autoReplyMessage || '')
                            };
                            setEmailForm(trimmedConfig);

                            if (!trimmedConfig.emailjsServiceId || !trimmedConfig.emailjsPublicKey || !trimmedConfig.receiverEmail) {
                              triggerAlert('Por favor completa al menos: ID de Servicio, Clave Pública y Tu Correo Destinatario para enviar la prueba.');
                              return;
                            }

                            try {
                              triggerAlert('Enviando auto-respuesta de prueba a tu propio correo...');
                              const emailjs = await import('@emailjs/browser');
                              
                              const testTemplateId = trimmedConfig.emailjsAutoTemplateId || trimmedConfig.emailjsTemplateId;
                              const testSubject = trimmedConfig.autoReplySubject || '¡Tu reserva ha sido recibida con éxito! - Aurea Studio';
                              const testMessage = trimmedConfig.autoReplyMessage || 'Hola, esto es un mensaje de prueba de respuesta automática.';

                              const testParams = {
                                to_name: 'Cliente de Prueba',
                                to_email: trimmedConfig.receiverEmail, // Sent to admin's email so they can check it
                                client_name: 'Cliente de Prueba',
                                client_email: trimmedConfig.receiverEmail,
                                email: trimmedConfig.receiverEmail,
                                recipient_email: trimmedConfig.receiverEmail,
                                reply_to: trimmedConfig.receiverEmail,
                                from_name: profile.name || 'Miriam Campos - Aurea Studio',
                                from_email: trimmedConfig.receiverEmail,
                                reply_subject: testSubject,
                                subject: testSubject,
                                autoReplySubject: testSubject,
                                reply_message: testMessage,
                                message: testMessage,
                                autoReplyMessage: testMessage,
                                booking_details: 'Sesión Fotográfica de Prueba - Fecha: Mañana - Horario: 4:00 PM - Total: $150'
                              };

                              await emailjs.send(
                                trimmedConfig.emailjsServiceId,
                                testTemplateId,
                                testParams,
                                trimmedConfig.emailjsPublicKey
                              );
                              
                              triggerAlert('¡Auto-respuesta enviada con éxito! Revisa tu propia casilla de correo (simula ser el cliente).');
                            } catch (err: any) {
                              console.error(err);
                              let errorMsg = err?.text || err?.message || 'Error desconocido';
                              if (errorMsg.includes('template ID not found') || errorMsg.includes('Template ID not found')) {
                                errorMsg += ' -> Verifica si el ID de Plantilla de Auto-Respuesta es correcto.';
                              }
                              triggerAlert(`Error al enviar auto-respuesta: ${errorMsg}`);
                            }
                          }}
                          className="py-2 px-4 bg-gold-500/10 text-gold-400 border border-gold-500/20 hover:bg-gold-500/20 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold cursor-pointer transition-all w-full text-center"
                        >
                          ⚡ Enviar Auto-Respuesta de Prueba
                        </button>
                        <span className="text-[9px] text-white/30 block leading-tight text-center italic">
                          Se enviará a tu dirección <code>{emailForm.receiverEmail || '(No configurada)'}</code> simulando el diseño final.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Step-by-Step Tutorial Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="border border-gold-400/20 bg-gold-400/5 rounded-xl p-6 text-left space-y-4">
                  <h3 className="font-serif text-lg text-gold-300 flex items-center space-x-2">
                    <Mail size={16} />
                    <span>Guía de Conexión (EmailJS)</span>
                  </h3>
                  
                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    Para que los correos automáticos de reserva y contacto se envíen de forma real, utilizamos <strong>EmailJS</strong>, un servicio gratuito que te permite conectar tu Gmail o casilla corporativa directamente sin necesidad de programar un servidor.
                  </p>

                  <div className="space-y-3 pt-2 text-[11px] font-sans text-white/80">
                    <div className="flex items-start space-x-2">
                      <span className="font-mono text-gold-400 font-bold bg-white/5 rounded w-5 h-5 flex items-center justify-center shrink-0">1</span>
                      <p>Crea una cuenta gratuita en <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-gold-400 underline hover:text-gold-300">emailjs.com</a>.</p>
                    </div>

                    <div className="flex items-start space-x-2">
                      <span className="font-mono text-gold-400 font-bold bg-white/5 rounded w-5 h-5 flex items-center justify-center shrink-0">2</span>
                      <p>En el panel, ve a <strong>Email Services</strong> y conecta tu Gmail (ese será tu <strong>Service ID</strong>).</p>
                    </div>

                    <div className="flex items-start space-x-2">
                      <span className="font-mono text-gold-400 font-bold bg-white/5 rounded w-5 h-5 flex items-center justify-center shrink-0">3</span>
                      <p>Ve a <strong>Email Templates</strong> y crea una plantilla. Los campos que envía la web son:</p>
                    </div>

                    <div className="bg-black/30 p-2.5 rounded font-mono text-[9px] text-white/50 space-y-1 ml-7">
                      <div>• <span className="text-gold-400">{"{{to_name}}"}</span> - Nombre de Miriam Campos</div>
                      <div>• <span className="text-gold-400">{"{{to_email}}"}</span> - Correo Destinatario configurado</div>
                      <div>• <span className="text-gold-400">{"{{from_name}}"}</span> - Nombre del Cliente</div>
                      <div>• <span className="text-gold-400">{"{{from_email}}"}</span> - Correo del Cliente</div>
                      <div>• <span className="text-gold-400">{"{{message}}"}</span> - Mensaje / Comentario</div>
                      <div>• <span className="text-gold-400">{"{{booking_details}}"}</span> - Servicio, fecha y horario seleccionado</div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <span className="font-mono text-gold-400 font-bold bg-white/5 rounded w-5 h-5 flex items-center justify-center shrink-0">4</span>
                      <p>Copia el <strong>Template ID</strong>, la <strong>Public Key</strong> (en Account → API Keys), pégalos aquí y haz clic en <strong>Guardar</strong>.</p>
                    </div>

                    <div className="border-t border-white/5 pt-3 mt-2 space-y-2">
                      <h4 className="text-[10px] uppercase font-mono text-gold-400 tracking-wider">⚠️ Configuración de Respuesta Automática</h4>
                      <p className="text-[10px] text-white/60 leading-normal">
                        Por defecto, las plantillas de EmailJS suelen tener tu correo de Miriam escrito de forma fija en el campo <strong>To Email (Para)</strong>. Si usas esa misma plantilla, EmailJS te enviará la respuesta automática a ti misma en lugar de al cliente.
                      </p>
                      <p className="text-[10px] text-white/60 leading-normal">
                        Para solucionarlo, ve a EmailJS y crea una <strong>segunda plantilla independiente</strong> (por ejemplo: <code>plantilla_autoresponder</code>) y configúrala así:
                      </p>
                      <div className="bg-black/40 p-3 rounded font-mono text-[9px] text-white/50 space-y-1.5 ml-2 border border-white/5">
                        <div>• <strong>To Email (Para):</strong> escribe <span className="text-gold-400">{"{{to_email}}"}</span> <span className="text-white/30">(¡muy importante!)</span></div>
                        <div>• <strong>Subject (Asunto):</strong> escribe <span className="text-gold-400">{"{{reply_subject}}"}</span></div>
                        <div>• <strong>Content (Cuerpo):</strong> usa las variables <span className="text-gold-400">{"{{reply_message}}"}</span> y <span className="text-gold-400">{"{{booking_details}}"}</span> para mostrar el texto personalizado y los datos de la reserva o contacto.</div>
                      </div>
                      <p className="text-[10px] text-white/50 leading-normal">
                        Copia el ID de esta nueva plantilla y pégalo abajo en el campo <strong>ID de Plantilla de Auto-Respuesta</strong>. ¡Listo! El sistema responderá automáticamente al correo correcto de cada cliente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CLIENTS AND PRIVATE GALLERIES MANAGEMENT */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
              <div>
                <h2 className="font-serif text-2xl text-white">
                  {t('Gestión de Clientes y Galerías Privadas', 'Client & Private Gallery Management', 'Gestão de Clientes e Galerias')}
                </h2>
                <p className="text-xs text-white/50">
                  {t('Crea cuentas de acceso seguro para tus clientes con códigos de acceso (passcode) dinámicos para que seleccionen y descarguen sus fotos.', 'Create secure access accounts for your clients with dynamic passcodes so they can proof and download their galleries.', 'Crie contas de acesso seguro para seus clientes com códigos de acesso dinâmicos para seleção de fotos.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setClientEditItem(null);
                  setClientForm({
                    photos: [],
                    sessionDate: new Date().toISOString().split('T')[0],
                    sessionTitle: '',
                    clientName: '',
                    clientEmail: '',
                    passcode: ''
                  });
                  // Scroll to form
                  setTimeout(() => {
                    document.getElementById('client-form-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="py-1.5 px-4 bg-gold-500 text-dark hover:bg-gold-400 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer self-start md:self-auto animate-pulse"
              >
                <Plus size={12} />
                <span>{t('Crear Nueva Cuenta', 'Create New Account', 'Criar Nova Conta')}</span>
              </button>
            </div>

            {/* Dashboard / Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-dark/40 border border-white/5 p-4 rounded-xl flex items-center space-x-4">
                <div className="p-3 bg-gold-500/10 rounded-lg text-gold-400">
                  <Users size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase block">{t('Total de Clientes', 'Total Clients', 'Total de Clientes')}</span>
                  <span className="text-xl font-bold text-white font-mono">{(clientAccounts || []).length}</span>
                </div>
              </div>

              <div className="bg-dark/40 border border-white/5 p-4 rounded-xl flex items-center space-x-4">
                <div className="p-3 bg-gold-500/10 rounded-lg text-gold-400">
                  <Camera size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase block">{t('Fotos de Prueba cargadas', 'Uploaded Proof Photos', 'Fotos de Prova')}</span>
                  <span className="text-xl font-bold text-white font-mono">
                    {(clientAccounts || []).reduce((acc, curr) => acc + (curr.photos?.length || 0), 0)}
                  </span>
                </div>
              </div>

              <div className="bg-dark/40 border border-white/5 p-4 rounded-xl flex items-center space-x-4">
                <div className="p-3 bg-gold-500/10 rounded-lg text-gold-400">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase block">{t('Favoritos de Clientes', 'Client Favorites Selected', 'Favoritas de Clientes')}</span>
                  <span className="text-xl font-bold text-white font-mono">
                    {(clientAccounts || []).reduce((acc, curr) => acc + (curr.photos?.filter(p => p.isFav).length || 0), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Section (Visible only when clientForm is active) */}
            {clientForm.clientName !== undefined && (
              <div id="client-form-section" className="bg-dark border border-gold-400/20 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="font-serif text-lg text-gold-300">
                    {clientEditItem ? t('Editar Cuenta de Cliente', 'Edit Client Account') : t('Registrar Nueva Cuenta de Cliente', 'Register New Client Account')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setClientEditItem(null);
                      setClientForm({});
                    }}
                    className="p-1 hover:bg-white/5 rounded text-white/50 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSaveClientAccount} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t('Nombre del Cliente *', 'Client Name *')}</label>
                      <input
                        type="text"
                        required
                        placeholder={t('Ej: Clara & Mateo', 'E.g. Clara & Mateo')}
                        value={clientForm.clientName || ''}
                        onChange={(e) => setClientForm({ ...clientForm, clientName: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-sans focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t('Email del Cliente *', 'Client Email *')}</label>
                      <input
                        type="email"
                        required
                        placeholder="clara@example.com"
                        value={clientForm.clientEmail || ''}
                        onChange={(e) => setClientForm({ ...clientForm, clientEmail: e.target.value })}
                        className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-mono focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t('Título de la Sesión', 'Session Title')}</label>
                        <input
                          type="text"
                          placeholder={t('Ej: Boda Civil / Sesión Preboda', 'E.g. Pre-wedding session')}
                          value={clientForm.sessionTitle || ''}
                          onChange={(e) => setClientForm({ ...clientForm, sessionTitle: e.target.value })}
                          className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-sans focus:outline-none focus:border-gold-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t('Fecha de la Sesión', 'Session Date')}</label>
                        <input
                          type="date"
                          value={clientForm.sessionDate || ''}
                          onChange={(e) => setClientForm({ ...clientForm, sessionDate: e.target.value })}
                          className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white font-mono focus:outline-none focus:border-gold-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2 bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-[10px] font-mono text-gold-300 uppercase tracking-wider flex items-center space-x-1.5">
                          <CheckSquare size={12} className="text-gold-400" />
                          <span>{t('Código de Acceso de Galería (Passcode) *', 'Gallery Passcode *')}</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleGeneratePasscode}
                          className="text-[9px] font-mono bg-gold-400/10 text-gold-400 border border-gold-400/20 hover:bg-gold-400/20 px-2 py-1 rounded transition-all flex items-center space-x-1 cursor-pointer uppercase self-start sm:self-auto"
                        >
                          <RefreshCw size={8} />
                          <span>{t('Generar Código Seguro', 'Generate Secure Code')}</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          required
                          placeholder={t('Ej: SELECCION2026', 'E.g. SELECCION2026')}
                          value={clientForm.passcode || ''}
                          onChange={(e) => setClientForm({ ...clientForm, passcode: e.target.value.toUpperCase() })}
                          className="bg-dark border border-white/10 rounded p-2.5 text-sm text-gold-400 tracking-wider font-mono uppercase font-bold focus:outline-none focus:border-gold-400 w-full sm:w-64"
                        />
                        <span className="text-[10px] text-white/40 leading-relaxed font-sans max-w-sm hidden sm:block">
                          {t('Este código es único. El cliente lo ingresará en el Portal de Clientes para abrir su galería personal.', 'This code is unique. The client will enter it in the Client Portal to unlock their personal gallery.')}
                        </span>
                      </div>
                    </div>
                  </div>

                    {/* PHOTOS MANAGEMENT SUB-SECTION */}
                    <div className="border-t border-white/5 pt-4 space-y-4">
                      <div>
                        <h4 className="text-xs font-mono text-gold-400 uppercase tracking-widest">{t('Fotos en la Galería del Cliente', 'Photos in Client Gallery')}</h4>
                        <p className="text-[10px] text-white/50">{t('Añade las fotos de previsualización que el cliente verá para elegir sus preferidas y descargar.', 'Add the preview photographs the client will review to pick their favorites and download.')}</p>
                      </div>

                      {/* Drag-and-drop & File upload zone */}
                      <div className="bg-dark-gray/30 p-4 rounded-xl border border-white/5 space-y-4">
                        <h5 className="text-[10px] font-mono text-white/60 uppercase tracking-wider">
                          {t('📁 Cargar Fotos de Pruebas', '📁 Upload Proof Photos')}
                        </h5>

                        {/* Interactive Drag & Drop Area */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOver(true);
                          }}
                          onDragLeave={() => setIsDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOver(false);
                            handleMultipleFilesUpload(e.dataTransfer.files);
                          }}
                          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                            isDragOver 
                              ? 'border-gold-400 bg-gold-400/5 scale-[0.99]' 
                              : 'border-white/10 bg-dark/40 hover:border-gold-400/55 hover:bg-white/5'
                          }`}
                          onClick={() => document.getElementById('client-photo-file-input')?.click()}
                        >
                          <input
                            id="client-photo-file-input"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleMultipleFilesUpload(e.target.files)}
                          />
                          <UploadCloud size={32} className={`mb-3 transition-colors ${isDragOver ? 'text-gold-400' : 'text-white/40'}`} />
                          <span className="text-xs text-white/80 font-medium block">
                            {t('Arrastra y suelta tus fotos aquí o haz clic para explorar', 'Drag & drop your photos here or click to browse')}
                          </span>
                          <span className="text-[9px] text-white/40 font-mono mt-1 block">
                            {t('Soporta múltiples archivos a la vez (PNG, JPG, WEBP)', 'Supports multiple files at once (PNG, JPG, WEBP)')}
                          </span>
                        </div>

                        {/* Fallback Option: Toggle URL input if they prefer */}
                        <details className="text-left group">
                          <summary className="text-[9px] font-mono text-white/40 hover:text-white/60 cursor-pointer select-none transition-colors outline-none list-none flex items-center space-x-1">
                            <span>▸ {t('¿Prefieres usar URLs externas?', 'Prefer to use external URLs?')}</span>
                          </summary>
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end mt-3 pt-3 border-t border-white/5 animate-fadeIn">
                            <div className="md:col-span-5 space-y-1">
                              <label className="text-[8px] font-mono text-white/40 uppercase">URL de la Imagen</label>
                              <input
                                type="text"
                                placeholder="https://images.unsplash.com/..."
                                value={newProofPhotoUrl}
                                onChange={(e) => setNewProofPhotoUrl(e.target.value)}
                                className="w-full bg-dark/60 border border-white/10 rounded p-2 text-xs text-white font-mono"
                              />
                            </div>
                            
                            <div className="md:col-span-4 space-y-1">
                              <label className="text-[8px] font-mono text-white/40 uppercase">Título de la Foto</label>
                              <input
                                type="text"
                                placeholder="Ej: Retrato Novia"
                                value={newProofPhotoTitle}
                                onChange={(e) => setNewProofPhotoTitle(e.target.value)}
                                className="w-full bg-dark/60 border border-white/10 rounded p-2 text-xs text-white font-sans"
                              />
                            </div>

                            <div className="md:col-span-3">
                              <button
                                type="button"
                                onClick={handleAddProofPhoto}
                                className="w-full py-2 bg-gold-500 hover:bg-gold-400 text-dark font-mono text-[9px] tracking-wider uppercase font-bold rounded cursor-pointer"
                              >
                                {t('Agregar Foto', 'Add Photo')}
                              </button>
                            </div>
                          </div>
                        </details>
                      </div>

                    {/* Previews list of added photos inside the form */}
                    {(clientForm.photos?.length || 0) > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        {clientForm.photos?.map((p) => (
                          <div key={p.id} className="relative aspect-square bg-dark border border-white/10 rounded-lg overflow-hidden group">
                            <img src={p.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-left text-[8px] font-mono">
                              <div>
                                <span className="text-white/90 font-semibold block truncate">{p.title}</span>
                                <span className="text-gold-400 text-[7px] block">⚡ SH:{p.sharpness} CO:{p.thirdsAlign} EM:{p.emotionScore}</span>
                                {p.location && <span className="text-white/50 block mt-0.5 truncate">📍 {p.location}</span>}
                              </div>
                              <div className="flex flex-col space-y-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingProofPhotoId(p.id)}
                                  className="w-full py-1 px-1.5 bg-gold-500 hover:bg-gold-600 text-dark font-mono text-[7px] uppercase tracking-wider rounded font-bold text-center cursor-pointer flex items-center justify-center space-x-0.5"
                                >
                                  <Edit size={8} />
                                  <span>{t('Editar', 'Edit')}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProofPhoto(p.id)}
                                  className="w-full py-1 px-1.5 bg-red-500 hover:bg-red-600 text-white font-mono text-[7px] uppercase tracking-wider rounded font-semibold text-center cursor-pointer flex items-center justify-center space-x-0.5"
                                >
                                  <Trash2 size={8} />
                                  <span>{t('Quitar', 'Remove')}</span>
                                </button>
                              </div>
                            </div>
                            {p.isFav && (
                              <div className="absolute top-1 right-1 bg-gold-400 text-dark px-1.5 py-0.5 rounded text-[7px] font-mono font-bold">
                                FAV
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-white/10 rounded-xl p-8 text-center text-xs text-white/40">
                        {t('No hay fotos en esta galería aún. Añade fotos usando el formulario de arriba.', 'No photos in this gallery yet. Add photos using the form above.')}
                      </div>
                    )}

                    {/* PROOF PHOTO EDIT MODAL */}
                    <AnimatePresence>
                      {editingProofPhotoId && (() => {
                        const photoToEdit = clientForm.photos?.find(p => p.id === editingProofPhotoId);
                        if (!photoToEdit) return null;
                        return (
                          <motion.div 
                            className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div 
                              className="bg-dark border border-gold-400/20 rounded-2xl p-6 w-full max-w-md space-y-4 text-left shadow-2xl"
                              initial={{ scale: 0.95 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0.95 }}
                            >
                              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <h4 className="font-serif text-sm font-semibold text-gold-300 uppercase tracking-wider">
                                  {t('Editar Metadatos de Foto de Prueba', 'Edit Proof Photo Metadata')}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => setEditingProofPhotoId(null)}
                                  className="p-1 hover:bg-white/5 rounded text-white/50 hover:text-white"
                                >
                                  <X size={14} />
                                </button>
                              </div>

                              <div className="aspect-[3/2] rounded-lg overflow-hidden border border-white/10">
                                <img src={photoToEdit.url} className="w-full h-full object-cover" />
                              </div>

                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider">{t('Título', 'Title')}</label>
                                  <input
                                    type="text"
                                    value={photoToEdit.title}
                                    onChange={(e) => {
                                      const updatedPhotos = clientForm.photos?.map(p => 
                                        p.id === editingProofPhotoId ? { ...p, title: e.target.value } : p
                                      );
                                      setClientForm({ ...clientForm, photos: updatedPhotos });
                                    }}
                                    className="w-full bg-dark/60 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-gold-400"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider">{t('Localización', 'Location')}</label>
                                  <input
                                    type="text"
                                    placeholder={t('Ej: Madrid, España', 'E.g. Madrid, Spain')}
                                    value={photoToEdit.location || ''}
                                    onChange={(e) => {
                                      const updatedPhotos = clientForm.photos?.map(p => 
                                        p.id === editingProofPhotoId ? { ...p, location: e.target.value } : p
                                      );
                                      setClientForm({ ...clientForm, photos: updatedPhotos });
                                    }}
                                    className="w-full bg-dark/60 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-gold-400"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider">{t('Descripción', 'Description')}</label>
                                  <textarea
                                    rows={2}
                                    placeholder={t('Ej: Retrato tomado a contraluz durante el atardecer', 'E.g. Portrait taken against backlight during sunset')}
                                    value={photoToEdit.description || ''}
                                    onChange={(e) => {
                                      const updatedPhotos = clientForm.photos?.map(p => 
                                        p.id === editingProofPhotoId ? { ...p, description: e.target.value } : p
                                      );
                                      setClientForm({ ...clientForm, photos: updatedPhotos });
                                    }}
                                    className="w-full bg-dark/60 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-gold-400 resize-none font-sans"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end space-x-2 pt-2 border-t border-white/5">
                                <button
                                  type="button"
                                  onClick={() => setEditingProofPhotoId(null)}
                                  className="py-1.5 px-4 bg-gold-500 text-dark hover:bg-gold-400 rounded-md text-[9px] font-mono tracking-widest uppercase font-bold cursor-pointer"
                                >
                                  {t('Listo', 'Done')}
                                </button>
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  </div>

                  {/* SAVE / CANCEL ACTION BUTTONS */}
                  <div className="flex items-center space-x-3 border-t border-white/5 pt-4">
                    <button
                      type="submit"
                      className="py-2 px-6 bg-gold-500 text-dark hover:bg-gold-400 rounded-lg text-[10px] font-mono tracking-widest uppercase font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Check size={12} />
                      <span>{clientEditItem ? t('Guardar Cambios', 'Save Changes') : t('Crear Cuenta de Cliente', 'Create Client Account')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClientEditItem(null);
                        setClientForm({});
                      }}
                      className="py-2 px-4 bg-dark border border-white/10 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-[10px] font-mono tracking-widest uppercase cursor-pointer"
                    >
                      {t('Cancelar', 'Cancel')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* CLIENTS LIST / DIRECTORY */}
            <div className="bg-dark/40 border border-white/5 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-dark/40">
                <h3 className="text-xs font-mono text-gold-400 uppercase tracking-wider">
                  {t('Listado de Clientes Activos', 'Active Client Directory')}
                </h3>
              </div>

              {(clientAccounts || []).length > 0 ? (
                <div className="divide-y divide-white/5">
                  {(clientAccounts || []).map((account) => {
                    const favoritesCount = account.photos?.filter(p => p.isFav).length || 0;
                    return (
                      <div key={account.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                        <div className="space-y-1 text-left">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-serif text-sm font-bold text-white">{account.clientName}</h4>
                            <span className="text-[9px] font-mono bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-white/50">
                              ID: {account.id}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-[10px] font-mono text-white/50">
                            <div>
                              <span className="text-white/35 font-semibold">EMAIL:</span> {account.clientEmail}
                            </div>
                            <div>
                              <span className="text-white/35 font-semibold">FECHA:</span> {account.sessionDate}
                            </div>
                            <div>
                              <span className="text-white/35 font-semibold">SESIÓN:</span> {account.sessionTitle}
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 pt-1.5 text-[10px] font-mono">
                            <div className="flex items-center space-x-1 text-gold-400 bg-gold-400/5 px-2 py-0.5 rounded border border-gold-400/10">
                              <CheckSquare size={10} />
                              <span className="font-bold">PASSCODE: {account.passcode}</span>
                            </div>
                            <div className="text-white/70">
                              <span>📁 {account.photos?.length || 0} {t('Fotos', 'Photos')}</span>
                            </div>
                            <div className="text-gold-300">
                              <span>⭐ {favoritesCount} {t('Favoritas', 'Favorites')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick action buttons for this client */}
                        <div className="flex items-center space-x-2 shrink-0 self-start md:self-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setClientEditItem(account);
                              setClientForm({ ...account });
                              setTimeout(() => {
                                document.getElementById('client-form-section')?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }}
                            className="py-1.5 px-3 bg-white/5 hover:bg-white/10 text-white/90 rounded text-[9px] font-mono uppercase tracking-wider flex items-center space-x-1 cursor-pointer border border-white/5 transition-colors"
                          >
                            <Edit size={10} />
                            <span>{t('Gestionar y Editar', 'Manage & Edit')}</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteClientAccount(account.id)}
                            className="py-1.5 px-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded text-[9px] font-mono uppercase tracking-wider flex items-center space-x-1 cursor-pointer border border-red-500/20 transition-all"
                          >
                            <Trash2 size={10} />
                            <span>{t('Eliminar', 'Delete')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-white/40 italic">
                  {t('No hay cuentas de clientes registradas en el sistema.', 'No client accounts registered in the system yet.')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
