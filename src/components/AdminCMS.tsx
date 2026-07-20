/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Camera, Calendar, BookOpen, MessageSquare, HelpCircle, 
  Settings, LogOut, Check, X, ShieldAlert, Edit, Edit3, Trash2, Plus, Menu, Save,
  ArrowUpRight, Eye, RefreshCw, Upload, Sliders, FileCode, CheckSquare,
  User, Mail, ChevronDown, ChevronUp, Phone, Users, FileText, ShoppingBag, Copy
} from 'lucide-react';
import { 
  Photograph, Service, Testimonial, BlogPost, FAQ, Booking, 
  Message, SEOMetadata, AnalyticsStats, ActiveLanguage, PhotographerProfile, BookingConfig, EmailConfig,
  ClientAccount, ProofPhoto, SessionCategory, PhotographyPackage
} from '../types';
import { sanitizeString, sanitizeEmail, sanitizeUrl, sanitizeObject } from '../lib/sanitize';
import { supabase, uploadImageBlob, deleteImageByUrl } from '../lib/db';

import AdminSEOTab from './AdminSEOTab';
import AdminProfileTab from './AdminProfileTab';
import AdminPackagesTab from './AdminPackagesTab';

function compressImage(file: File, maxSize = 1600, quality = 0.85): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context failed')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => blob ? resolve({ blob, width, height }) : reject(new Error('Canvas toBlob failed')),
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}

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
  sessionCategories: SessionCategory[];
  onUpdateSessionCategories: (categories: SessionCategory[]) => void;
  packages: PhotographyPackage[];
  onUpdatePackages: (packages: PhotographyPackage[]) => void;
  onLogout: () => void;
  onBackToSite?: () => void;
}

export default function AdminCMS({
  photographs, services, testimonials, blogPosts, faqs, bookings, messages, clientAccounts = [], seo, profile, bookingConfig, emailConfig, stats, lang,
  onUpdatePhotographs, onUpdateTestimonials, onUpdateBlogPosts,
  onUpdateFaqs, onUpdateBookings, onUpdateMessages, onUpdateClientAccounts, onUpdateSeo, onUpdateProfile, onUpdateBookingConfig, onUpdateEmailConfig, sessionCategories, onUpdateSessionCategories, packages, onUpdatePackages, onLogout, onBackToSite
}: AdminCMSProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'photos' | 'bookings' | 'messages' | 'seo' | 'profile' | 'email_settings' | 'clients' | 'packages' | 'session-categories'>('dashboard');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileSidebarOpen]);

  const t = (es: string, en: string, _pt?: string) => {
    if (lang === 'en') return en;
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
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [sendingToClient, setSendingToClient] = useState<ClientAccount | null>(null);
  const [sendEmailSubject, setSendEmailSubject] = useState('');
  const [sendEmailMessage, setSendEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Blog state
  const [blogEditItem, setBlogEditItem] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState<Partial<BlogPost>>({});

  // Service, SEO, Profile form states moved to extracted components AdminServicesTab, AdminSEOTab, AdminProfileTab

  // Message reply states
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Simulated notification system
  const [cmsAlert, setCmsAlert] = useState<string | null>(null);
  const triggerAlert = (msg: string) => {
    setCmsAlert(msg);
    setTimeout(() => setCmsAlert(null), 3000);
  };

  // Real-time booking notification state
  const [unseenBookings, setUnseenBookings] = useState(0);
  const seenBookingIds = useRef<Set<string>>(new Set());

  // Real-time subscription for new bookings
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          const newBooking = payload.new as Record<string, any>;
          const id = newBooking.id;
          if (id && !seenBookingIds.current.has(id)) {
            seenBookingIds.current.add(id);
            setUnseenBookings(prev => prev + 1);
            const cName = newBooking.clientname || 'Alguien';
            triggerAlert(`📅 ¡Nueva reserva de ${cName}!`);
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification('Nueva Reserva - Aurea Studio', {
                body: `${cName} ha solicitado una sesión. Revisa la cola de reservas.`,
                icon: '/favicon.svg',
              });
            }
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Real-time message notification state
  const [unseenMessages, setUnseenMessages] = useState(0);
  const seenMessageIds = useRef<Set<string>>(new Set());

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Record<string, any>;
          const id = newMsg.id;
          if (id && !seenMessageIds.current.has(id)) {
            seenMessageIds.current.add(id);
            setUnseenMessages(prev => prev + 1);
            const cName = newMsg.name || 'Alguien';
            triggerAlert(`✉️ ¡Nuevo mensaje de ${cName}!`);
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification('Nuevo Mensaje - Aurea Studio', {
                body: `${cName} te ha escrito. Revisa la bandeja de entrada.`,
                icon: '/favicon.svg',
              });
            }
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

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

  // SEO and Profile form effects handled in AdminSEOTab / AdminProfileTab

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

  const compressImage = (file: File, maxSize = 1600, quality = 0.85): Promise<{ blob: Blob; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context failed'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas toBlob failed'));
                return;
              }
              resolve({ blob, width, height });
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files: FileList) => {
    const filesCount = files.length;
    triggerAlert(`Optimizing ${filesCount} images: Auto-converting, generating thumbnails & AI Alt Tags...`);

    try {
      const uploaded: Photograph[] = [];
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const { blob, width, height } = await compressImage(file);
        const id = `photo-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`;
        const downloadUrl = await uploadImageBlob(`photographs/${id}.jpg`, blob);
        uploaded.push({
          id,
          url: downloadUrl,
          title: file.name.split('.')[0] || 'Unfinished Frame',
          category: 'retrato',
          description: 'Optimized master uploaded via back-office CMS.',
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
          size: `${Math.round(blob.size / 1024)} KB`
        });
      }
      onUpdatePhotographs([...uploaded, ...photographs]);
      triggerAlert(`${uploaded.length} photos deployed into index catalog.`);
    } catch (err) {
      console.error('Error processing uploaded images:', err);
      triggerAlert('Error processing uploaded images. Please try again.');
    }
  };

  // handleSeoImageUpload moved to AdminSEOTab

  // handleAvatarImageUpload, handleSaveProfile moved to AdminProfileTab

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

  const handleToggleBookingRead = (id: string) => {
    onUpdateBookings(bookings.map(b => b.id === id ? { ...b, isRead: true } : b));
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
      
      window.open(mailtoUrl, '_blank');
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
    const safeTitle = sanitizeString(blogForm.title || '');
    if (!safeTitle) return;

    const safeForm = sanitizeObject(blogForm as Record<string, unknown>) as Partial<BlogPost>;

    if (blogEditItem) {
      onUpdateBlogPosts(blogPosts.map(p => p.id === blogEditItem.id ? { ...p, ...safeForm } as BlogPost : p));
      triggerAlert('Journal post modified and updated');
    } else {
      const newPost: BlogPost = {
        id: `blog-${Date.now()}`,
        title: safeTitle,
        excerpt: sanitizeString(safeForm.excerpt || ''),
        content: sanitizeString(safeForm.content || ''),
        category: sanitizeString(safeForm.category || 'General'),
        tags: ['Inspiration'],
        image: safeForm.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
        date: new Date().toISOString().split('T')[0],
        readTime: '5 min read',
        seoKeywords: sanitizeString(safeForm.seoKeywords || ''),
        status: safeForm.status || 'draft'
      };
      onUpdateBlogPosts([newPost, ...blogPosts]);
      triggerAlert('New Journal post created successfully');
    }

    setBlogEditItem(null);
    setBlogForm({});
  };

  // handleEditService, handleSaveService, handleAddInclusion, handleRemoveInclusion, handleSaveSEO moved to extracted components

  const handleSaveClientAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateClientAccounts) return;
    
    const safeName = sanitizeString(clientForm.clientName || '');
    const safeEmail = sanitizeEmail(clientForm.clientEmail || '');
    const safePasscode = sanitizeString(clientForm.passcode || '');
    const safeTitle = sanitizeString(clientForm.sessionTitle || '');
    const safeDate = sanitizeString(clientForm.sessionDate || '');

    if (!safeName || !safeEmail || !safePasscode) {
      triggerAlert(t('Por favor completa los campos requeridos', 'Please fill all required fields'));
      return;
    }

    const currentPhotos = clientForm.photos || [];

    if (clientEditItem) {
      const updated = (clientAccounts || []).map(c => c.id === clientEditItem.id ? {
        ...c,
        clientName: safeName,
        clientEmail: safeEmail,
        passcode: safePasscode,
        sessionTitle: safeTitle,
        sessionDate: safeDate,
        photos: currentPhotos
      } as ClientAccount : c);
      onUpdateClientAccounts(updated);
      triggerAlert(t('✓ Cuenta de cliente actualizada correctamente', '✓ Client account updated successfully'));
    } else {
      const newClient: ClientAccount = {
        id: `client-${Date.now()}`,
        clientName: safeName,
        clientEmail: safeEmail,
        passcode: safePasscode,
        sessionDate: safeDate || new Date().toISOString().split('T')[0],
        sessionTitle: safeTitle || 'Sesión Fotográfica Privada',
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
    const safeUrl = sanitizeUrl(newProofPhotoUrl);
    const safeTitle = sanitizeString(newProofPhotoTitle);
    if (!safeUrl || !safeTitle) {
      triggerAlert(t('Por favor ingresa URL y título de la foto', 'Please enter both photo URL and title'));
      return;
    }
    const newPhoto: ProofPhoto = {
      id: `proof-${Date.now()}`,
      url: safeUrl,
      title: safeTitle,
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
        const { blob } = await compressImage(file, 1200, 0.75);
        const title = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const photoId = `proof-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`;
        const downloadUrl = await uploadImageBlob(`proofs/${photoId}.jpg`, blob);

        const newPhoto: ProofPhoto = {
          id: photoId,
          url: downloadUrl,
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
    <div className="min-h-dvh bg-dark-gray rounded-3xl border border-white/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12 text-left shadow-2xl relative">
      
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

      {/* ADMIN NAVIGATION RAIL (Cols 2) — Desktop only */}
      <div className="hidden lg:flex lg:col-span-2 border-r border-white/5 bg-dark-gray p-6 flex-col justify-between">
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
              onClick={() => { setActiveTab('bookings'); setUnseenBookings(0); }}
              className={`w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'bookings' ? 'bg-gold-500 text-dark font-bold' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar size={12} />
              <span className="flex-1">{t('Cola de Reservas', 'Bookings Queue', 'Fila de Reservas')}</span>
              {bookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="bg-gold-500 text-dark text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              )}
              {unseenBookings > 0 && (
                <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                  {unseenBookings}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'packages' ? 'bg-gold-500 text-dark font-bold' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag size={12} />
              <span>{t('Paquetes Fotográficos', 'Photography Packages', 'Pacotes Fotográficos')}</span>
            </button>

            <button
              onClick={() => setActiveTab('session-categories')}
              className={`w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'session-categories' ? 'bg-gold-500 text-dark font-bold' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders size={12} />
              <span>{t('Tipos de Sesión', 'Session Types', 'Tipos de Sessão')}</span>
            </button>

            <button
              onClick={() => { setActiveTab('messages'); setUnseenMessages(0); }}
              className={`w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'messages' ? 'bg-gold-500 text-dark font-bold' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare size={12} />
              <span className="flex-1">{t('Bandeja de Entrada', 'Inbox', 'Caixa de Entrada')}</span>
              {messages.filter(m => !m.isRead).length > 0 && (
                <span className="bg-gold-500 text-dark text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                  {messages.filter(m => !m.isRead).length}
                </span>
              )}
              {unseenMessages > 0 && (
                <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                  {unseenMessages}
                </span>
              )}
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

        <div className="space-y-1.5">
          <button
            onClick={onBackToSite}
            className="w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider text-white/60 hover:text-gold-400 hover:bg-white/5 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Eye size={12} />
            <span>{t('Ver Sitio', 'View Site', 'Ver Site')}</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <LogOut size={12} />
            <span>{t('Cerrar Sesión', 'Exit Workspace', 'Sair')}</span>
          </button>
        </div>
      </div>

      {/* Floating hamburger — mobile only, centered on right edge */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className={`${mobileSidebarOpen ? 'hidden' : 'flex'} lg:hidden fixed right-4 top-1/2 -translate-y-1/2 z-30 bg-dark-gray/90 border border-border/60 rounded-full p-3 text-white hover:text-gold-400 hover:border-gold-400/50 transition-all shadow-lg cursor-pointer backdrop-blur-sm`}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* MAIN ADMIN WORKSPACE WORK AREA (Cols 10) */}
      <div className="lg:col-span-10 p-4 sm:p-5 lg:p-6 lg:overflow-y-auto lg:max-h-[85vh]">

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
              <div className="bg-charcoal border border-white/5 rounded-xl p-4 flex flex-col text-left">
                <span className="text-[9px] font-mono text-white/40 uppercase">{t('Ingresos Estimados', 'Estimated Revenue', 'Receita Estimada')}</span>
                <span className="text-2xl font-mono font-bold text-gold-400 mt-1">${stats.totalRevenue.toLocaleString()}</span>
                <span className="text-[10px] font-mono text-emerald-400 mt-2 flex items-center space-x-1">
                  <ArrowUpRight size={10} />
                  <span>{t('+12.4% vs mes anterior', '+12.4% vs Last month', '+12.4% vs mês anterior')}</span>
                </span>
              </div>

              <div className="bg-charcoal border border-white/5 rounded-xl p-4 flex flex-col text-left">
                <span className="text-[9px] font-mono text-white/40 uppercase">{t('Tasa de Conversión', 'Conversion Rate', 'Taxa de Conversão')}</span>
                <span className="text-2xl font-mono font-bold text-white mt-1">{stats.bookingConversionRate}%</span>
                <span className="text-[10px] font-mono text-emerald-400 mt-2 flex items-center space-x-1">
                  <ArrowUpRight size={10} />
                  <span>{t('+0.8% ganancia SEO orgánica', '+0.8% organic SEO gain', '+0.8% ganho de SEO orgânico')}</span>
                </span>
              </div>

              <div className="bg-charcoal border border-white/5 rounded-xl p-4 flex flex-col text-left">
                <span className="text-[9px] font-mono text-white/40 uppercase">{t('Sesiones Totales', 'Total Sessions', 'Sessões Totais')}</span>
                <span className="text-2xl font-mono font-bold text-white mt-1">{stats.sessionsCount}</span>
                <span className="text-[10px] font-mono text-gold-300 mt-2">{t('Capacidad alcanzada para Q3', 'Cap reached for Q3', 'Capacidade máxima atingida para Q3')}</span>
              </div>

              <div className="bg-charcoal border border-white/5 rounded-xl p-4 flex flex-col text-left">
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
              <div className="bg-charcoal border border-white/5 rounded-2xl p-4">
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
              <div className="bg-charcoal border border-white/5 rounded-2xl p-4">
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
                  : 'border-[#D8C0A8] bg-charcoal hover:border-white/20'
              }`}
            >
              <Upload size={36} className="text-gold-400/80 mx-auto mb-3" />
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
                       <img src={sanitizeUrl(photoEditItem.url) || undefined} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 bg-overlay/70 border border-white/10 text-[9px] font-mono text-gold-400 px-2 py-0.5 rounded uppercase">
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
                          className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t('Categoría *', 'Category *')}</label>
                        <select
                          value={photoEditItem.category}
                          onChange={(e) => setPhotoEditItem({ ...photoEditItem, category: e.target.value })}
                          className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                        >
                          <option value="retrato">Retrato / Portrait</option>
                          <option value="boda">Boda / Wedding</option>
                          <option value="moda">Moda / Fashion</option>
                          <option value="drone">Drone / Aerial</option>
                          <option value="viajes">Viajes / Travel</option>
                          <option value="producto">Producto / Product</option>
                          <option value="evento">Evento / Event</option>
                          <option value="naturaleza">Naturaleza / Nature</option>
                          <option value="compromiso">Compromiso / Engagement</option>
                          <option value="familia">Familia / Family</option>
                          <option value="infantil">Infantil / Children</option>
                          <option value="maternidad">Maternidad / Maternity</option>
                          <option value="cumpleanos">Cumpleaños / Birthday</option>
                          <option value="graduacion">Graduación / Graduation</option>
                          <option value="corporativo">Corporativo / Corporate</option>
                          <option value="gastronomia">Gastronomía / Gastronomy</option>
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
                        className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t('Descripción de la Foto', 'Photo Description')}</label>
                      <textarea
                        rows={3}
                        placeholder="Escribe una breve descripción artística de la captura..."
                        value={photoEditItem.description || ''}
                        onChange={(e) => setPhotoEditItem({ ...photoEditItem, description: e.target.value })}
                        className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400 font-sans resize-none"
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
                <div key={photo.id} className="bg-charcoal border border-white/5 rounded-xl overflow-hidden flex flex-col justify-between animate-fadeIn">
                  <div className="relative aspect-[3/2] overflow-hidden">
                     <img src={sanitizeUrl(photo.url) || undefined} alt="" className="w-full h-full object-cover" />
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

            {/* Desktop table */}
            <div className="hidden md:block border border-white/5 rounded-2xl overflow-hidden bg-charcoal">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-charcoal text-[10px] font-mono text-white/40 uppercase tracking-widest">
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
                            className={`hover:bg-white/5 transition-colors cursor-pointer ${!b.isRead ? 'bg-gold-500/5' : ''}`}
                            onClick={() => { if (!b.isRead) handleToggleBookingRead(b.id); setExpandedBookingId(isExpanded ? null : b.id); }}
                          >
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-white/40 hover:text-white transition-colors mr-1 shrink-0">
                                  {isExpanded ? <ChevronUp size={14} className="text-gold-400" /> : <ChevronDown size={14} />}
                                </span>
                                {!b.isRead && <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse shrink-0" />}
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
                                    <div className="space-y-3 bg-charcoal border border-white/5 rounded-xl p-4 flex flex-col justify-between">
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

            {/* Mobile cards */}
            <div className="block md:hidden space-y-3">
              {bookings.map(b => {
                const isExpanded = expandedBookingId === b.id;
                return (
                  <div key={b.id} className={`border rounded-xl bg-dark-gray p-4 space-y-3 ${!b.isRead ? 'border-gold-400/25 bg-gold-500/5' : 'border-white/5'}`}>
                    <div onClick={() => { if (!b.isRead) handleToggleBookingRead(b.id); setExpandedBookingId(isExpanded ? null : b.id); }} className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <span className="text-white/60 shrink-0">
                            {isExpanded ? <ChevronUp size={16} className="text-gold-400" /> : <ChevronDown size={16} />}
                          </span>
                          {!b.isRead && <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse shrink-0" />}
                          <div className="min-w-0">
                            <div className="font-semibold text-white/90 text-sm truncate">{b.clientName}</div>
                            <div className="text-[10px] text-white/40 font-mono truncate">{b.clientEmail}</div>
                          </div>
                        </div>
                        <span className={`shrink-0 ml-2 px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase ${
                          b.status === 'accepted' 
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' 
                            : b.status === 'pending'
                            ? 'bg-gold-950/40 text-gold-400 border border-gold-400/20'
                            : 'bg-red-950/40 text-red-400 border border-red-500/20'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">{t('Fecha', 'Date', 'Data')}</span>
                          <span className="text-white/90 font-mono">{b.date} · {b.timeSlot}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">{t('Paquete', 'Package', 'Pacote')}</span>
                          <span className="text-white/90 truncate block">{services.find(s=>s.id === b.serviceId)?.title || 'Custom Session'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-gold-300 font-mono text-sm">${b.amount || 1800}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                      {b.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleBookingStatus(b.id, 'accepted')}
                            className="flex-1 min-h-[44px] py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-dark border border-emerald-500/20 transition-all cursor-pointer text-xs font-mono uppercase tracking-wider font-semibold flex items-center justify-center space-x-1.5"
                          >
                            <Check size={14} />
                            <span>{t('Aceptar', 'Accept', 'Aceitar')}</span>
                          </button>
                          <button
                            onClick={() => handleBookingStatus(b.id, 'rejected')}
                            className="flex-1 min-h-[44px] py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-dark border border-red-500/20 transition-all cursor-pointer text-xs font-mono uppercase tracking-wider font-semibold flex items-center justify-center space-x-1.5"
                          >
                            <X size={14} />
                            <span>{t('Rechazar', 'Decline', 'Recusar')}</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleBookingStatus(b.id, 'pending')}
                          className="w-full min-h-[44px] py-2.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 text-white/60 transition-all cursor-pointer text-xs font-mono uppercase tracking-wider font-semibold flex items-center justify-center space-x-1.5"
                        >
                          <RefreshCw size={14} />
                          <span>{t('Corregir', 'Correct', 'Corrigir')}</span>
                        </button>
                      )}
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-3 border-t border-white/5 space-y-3 text-xs"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-0.5">
                            <span className="text-white/40 block text-[9px] uppercase tracking-wider">{t('Teléfono:', 'Phone:', 'Telefone:')}</span>
                            <span className="text-white/90">{b.clientPhone || t('No proporcionado', 'Not provided', 'Não fornecido')}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-white/40 block text-[9px] uppercase tracking-wider">{t('Personas:', 'People:', 'Pessoas:')}</span>
                            <span className="text-white/90">{b.peopleCount || 1}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-1">{t('Notas:', 'Notes:', 'Notas:')}</span>
                          <div className="text-white/80 whitespace-pre-wrap leading-relaxed bg-charcoal border border-white/5 rounded-lg p-3">
                            {b.notes || t('Sin notas adicionales', 'No additional notes', 'Sem notas adicionais')}
                          </div>
                        </div>
                        <div className="text-[10px] text-white/30 italic text-right">
                          {t('Creada:', 'Created:', 'Criada:')} {b.createdAt ? new Date(b.createdAt).toLocaleString(lang === 'es' ? 'es-ES' : 'en-US') : 'N/A'}
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PHOTOGRAPHY PACKAGES */}
        {activeTab === 'packages' && (
          <AdminPackagesTab
            sessionCategories={sessionCategories}
            packages={packages}
            onUpdatePackages={onUpdatePackages}
            triggerAlert={triggerAlert}
            lang={lang}
          />
        )}

        {/* SESSION CATEGORIES */}
        {activeTab === 'session-categories' && (
          <SessionCategoriesEditor
            categories={sessionCategories}
            onUpdate={onUpdateSessionCategories}
            triggerAlert={triggerAlert}
            lang={lang}
          />
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
                  onClick={() => { if (!msg.isRead) handleToggleMessageRead(msg.id); }}
                  className={`border rounded-2xl p-5 space-y-3 transition-all text-left relative cursor-pointer ${
                    msg.isRead 
                      ? 'bg-dark-gray border-white/5 opacity-70' 
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
                    <div className="bg-dark-gray border border-white/5 rounded-xl p-4 space-y-2 text-left mt-2">
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
                    <div className="bg-charcoal border border-gold-400/20 rounded-xl p-4 space-y-3 mt-2 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-gold-400 uppercase tracking-widest font-semibold">
                          Compose Reply to {msg.name}
                        </span>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
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
                        className="w-full bg-dark-gray border-[#D8C0A8] rounded-lg p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold-400 font-sans resize-none leading-relaxed"
                      />
                      <p className="text-[10px] font-mono text-white/40 leading-relaxed">
                        📧 <strong>Nota:</strong> Al hacer clic en "Send Reply", la respuesta se guardará en este panel de control y se abrirá tu gestor de correo predeterminado (Gmail, Outlook, Apple Mail, etc.) para que puedas pulsar "Enviar" y entregar el correo real a <strong>{msg.email}</strong>.
                      </p>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReplyingToId(null);
                            setReplyText('');
                          }}
                          className="py-1 px-3 bg-charcoal hover:bg-white/10 border border-white/10 rounded text-[9px] font-mono tracking-widest uppercase transition-all text-white/70"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendReply(msg.id);
                          }}
                          className="py-1 px-3 bg-gold-500 text-dark hover:bg-gold-400 rounded text-[9px] font-mono tracking-widest uppercase transition-all font-semibold"
                        >
                          Send Reply
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-white/5 pt-3.5 flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
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
                        onClick={(e) => {
                          e.stopPropagation();
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(msg.id);
                        }}
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
          <AdminSEOTab
            seo={seo}
            onUpdateSeo={onUpdateSeo}
            triggerAlert={triggerAlert}
            lang={lang}
          />
        )}

        {/* BIOGRAPHY & PROFILE MANAGEMENT */}
        {activeTab === 'profile' && (
          <AdminProfileTab
            profile={profile}
            onUpdateProfile={onUpdateProfile}
            triggerAlert={triggerAlert}
            lang={lang}
          />
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
                  const trimmedConfig: EmailConfig = {
                    emailjsServiceId: sanitizeString(emailForm.emailjsServiceId),
                    emailjsTemplateId: sanitizeString(emailForm.emailjsTemplateId),
                    emailjsPublicKey: sanitizeString(emailForm.emailjsPublicKey),
                    receiverEmail: sanitizeEmail(emailForm.receiverEmail),
                    enableAutoResponse: emailForm.enableAutoResponse || false,
                    emailjsAutoTemplateId: sanitizeString(emailForm.emailjsAutoTemplateId || ''),
                    autoReplySubject: sanitizeString(emailForm.autoReplySubject || ''),
                    autoReplyMessage: sanitizeString(emailForm.autoReplyMessage || '')
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
                        className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Template ID (ID de Plantilla)</label>
                      <input
                        type="text"
                        placeholder="Ej: template_xxxxxxx"
                        value={emailForm.emailjsTemplateId}
                        onChange={(e) => setEmailForm({ ...emailForm, emailjsTemplateId: e.target.value })}
                        className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Public Key (Clave Pública)</label>
                      <input
                        type="text"
                        placeholder="Ej: xxxxxxxxxxxxxxx"
                        value={emailForm.emailjsPublicKey}
                        onChange={(e) => setEmailForm({ ...emailForm, emailjsPublicKey: e.target.value })}
                        className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Tu Correo Destinatario (Donde recibirás los avisos)</label>
                      <input
                        type="email"
                        placeholder="Ej: tu-email@gmail.com"
                        value={emailForm.receiverEmail}
                        onChange={(e) => setEmailForm({ ...emailForm, receiverEmail: e.target.value })}
                        className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-gold-400"
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
                  
                  <p className="text-[10px] text-white/50 leading-relaxed font-sans bg-dark-gray p-3 rounded-lg border border-white/5 mt-2">
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
                          className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-gold-400"
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
                          className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Mensaje de Respuesta Automática</label>
                        <textarea
                          rows={6}
                          placeholder="Escribe el mensaje que recibirá el cliente..."
                          value={emailForm.autoReplyMessage || ''}
                          onChange={(e) => setEmailForm({ ...emailForm, autoReplyMessage: e.target.value })}
                          className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold-400 font-sans resize-none"
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
              <div className="bg-charcoal border border-white/5 p-4 rounded-xl flex items-center space-x-4">
                <div className="p-3 bg-gold-500/10 rounded-lg text-gold-400">
                  <Users size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase block">{t('Total de Clientes', 'Total Clients', 'Total de Clientes')}</span>
                  <span className="text-xl font-bold text-white font-mono">{(clientAccounts || []).length}</span>
                </div>
              </div>

              <div className="bg-charcoal border border-white/5 p-4 rounded-xl flex items-center space-x-4">
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

              <div className="bg-charcoal border border-white/5 p-4 rounded-xl flex items-center space-x-4">
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
                        className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white font-sans focus:outline-none focus:border-gold-400"
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
                        className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white font-mono focus:outline-none focus:border-gold-400"
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
                          className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white font-sans focus:outline-none focus:border-gold-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t('Fecha de la Sesión', 'Session Date')}</label>
                        <input
                          type="date"
                          value={clientForm.sessionDate || ''}
                          onChange={(e) => setClientForm({ ...clientForm, sessionDate: e.target.value })}
                          className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white font-mono focus:outline-none focus:border-gold-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2 bg-dark-gray p-4 rounded-xl border border-white/5 space-y-3">
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
                              : 'border-[#D8C0A8] bg-charcoal hover:border-gold-400/55 hover:bg-white/5'
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
                          <Upload size={32} className={`mb-3 transition-colors ${isDragOver ? 'text-gold-400' : 'text-white/40'}`} />
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
                                className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2 text-xs text-white font-mono"
                              />
                            </div>
                            
                            <div className="md:col-span-4 space-y-1">
                              <label className="text-[8px] font-mono text-white/40 uppercase">Título de la Foto</label>
                              <input
                                type="text"
                                placeholder="Ej: Retrato Novia"
                                value={newProofPhotoTitle}
                                onChange={(e) => setNewProofPhotoTitle(e.target.value)}
                                className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2 text-xs text-white font-sans"
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
                             <img src={sanitizeUrl(p.url) || undefined} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
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
                                 <img src={sanitizeUrl(photoToEdit.url) || undefined} alt="" className="w-full h-full object-cover" />
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
                                    className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2 text-xs text-white focus:outline-none focus:border-gold-400"
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
                                    className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2 text-xs text-white focus:outline-none focus:border-gold-400"
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
                                    className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2 text-xs text-white focus:outline-none focus:border-gold-400 resize-none font-sans"
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
            <div className="bg-charcoal border border-white/5 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-dark-gray">
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
                              const link = window.location.origin + window.location.pathname + '?gallery=' + account.passcode;
                              navigator.clipboard.writeText(link).then(() => {
                                triggerAlert(t('✓ Link copiado al portapapeles', '✓ Link copied to clipboard'));
                              }).catch(() => {
                                const textArea = document.createElement('textarea');
                                textArea.value = link;
                                document.body.appendChild(textArea);
                                textArea.select();
                                document.execCommand('copy');
                                document.body.removeChild(textArea);
                                triggerAlert(t('✓ Link copiado al portapapeles', '✓ Link copied to clipboard'));
                              });
                            }}
                            className="py-1.5 px-3 bg-gold-400/10 hover:bg-gold-400/20 text-gold-300 rounded text-[9px] font-mono uppercase tracking-wider flex items-center space-x-1 cursor-pointer border border-gold-400/20 transition-all"
                          >
                            <Copy size={10} />
                            <span>{t('Copiar Link', 'Copy Link')}</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setSendingToClient(account);
                              setSendEmailSubject(t('Tu galería fotográfica está lista', 'Your photo gallery is ready'));
                              setSendEmailMessage(t('Hola {name},\n\nTu galería personal ya está disponible. Podés ver y descargar tus fotos en el siguiente enlace:\n\n{link}\n\nCualquier consulta no dudes en escribirme.\n\nSaludos,\nMiriam Campos', 'Hi {name},\n\nYour personal gallery is ready. You can view and download your photos at the following link:\n\n{link}\n\nIf you have any questions, feel free to reach out.\n\nBest regards,\nMiriam Campos'));
                              setShowSendEmailModal(true);
                            }}
                            className="py-1.5 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded text-[9px] font-mono uppercase tracking-wider flex items-center space-x-1 cursor-pointer border border-blue-500/20 transition-all"
                          >
                            <Mail size={10} />
                            <span>{t('Enviar por Email', 'Send via Email')}</span>
                          </button>
                          
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

            {/* Send Email Modal */}
            <AnimatePresence>
              {showSendEmailModal && sendingToClient && (
                <motion.div
                  className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-dark border border-gold-400/20 rounded-2xl p-6 w-full max-w-lg space-y-4 text-left shadow-2xl"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="space-y-0.5">
                        <h3 className="font-serif text-base text-gold-300 font-semibold">
                          {t('Enviar Link de Galería por Email', 'Send Gallery Link via Email')}
                        </h3>
                        <p className="text-[10px] text-white/50 font-sans">
                          {t('Se enviará a: {email}', 'Will be sent to: {email}').replace('{email}', sendingToClient.clientEmail)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSendEmailModal(false)}
                        className="p-1 hover:bg-white/5 rounded text-white/50 hover:text-white cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider">{t('Asunto', 'Subject')}</label>
                        <input
                          type="text"
                          value={sendEmailSubject}
                          onChange={(e) => setSendEmailSubject(e.target.value)}
                          className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400 font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider">{t('Mensaje', 'Message')}</label>
                        <textarea
                          rows={6}
                          value={sendEmailMessage}
                          onChange={(e) => setSendEmailMessage(e.target.value)}
                          className="w-full bg-charcoal border border-[#D8C0A8] rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400 font-sans resize-none"
                        />
                        <p className="text-[8px] text-white/40 font-mono">
                          {t('Podés usar {name} y {link} como marcadores.', 'You can use {name} and {link} as placeholders.')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setShowSendEmailModal(false)}
                        className="py-2 px-4 border border-white/10 text-white/70 hover:text-white rounded-lg text-[9px] font-mono tracking-widest uppercase cursor-pointer"
                      >
                        {t('Cancelar', 'Cancel')}
                      </button>
                      <button
                        type="button"
                        disabled={isSendingEmail}
                        onClick={async () => {
                          if (!sendingToClient || !emailConfig.emailjsServiceId || !emailConfig.emailjsTemplateId || !emailConfig.emailjsPublicKey) {
                            triggerAlert(t('⚠️ Configurá EmailJS primero en Ajustes de Email', '⚠️ Configure EmailJS first in Email Settings'));
                            return;
                          }
                          setIsSendingEmail(true);
                          try {
                            const emailjs = await import('@emailjs/browser');
                            const link = window.location.origin + window.location.pathname + '?gallery=' + sendingToClient.passcode;
                            const message = sendEmailMessage
                              .replace(/\{name\}/g, sendingToClient.clientName)
                              .replace(/\{link\}/g, link);
                            await emailjs.send(
                              emailConfig.emailjsServiceId,
                              emailConfig.emailjsAutoTemplateId || emailConfig.emailjsTemplateId,
                              {
                                to_name: sendingToClient.clientName,
                                to_email: sendingToClient.clientEmail,
                                client_name: sendingToClient.clientName,
                                client_email: sendingToClient.clientEmail,
                                from_name: profile.name || 'Miriam Campos',
                                from_email: emailConfig.receiverEmail,
                                reply_subject: sendEmailSubject,
                                subject: sendEmailSubject,
                                reply_message: message,
                                message: message,
                                gallery_link: link,
                                booking_details: `Galería compartida con ${sendingToClient.clientName}`,
                              },
                              emailConfig.emailjsPublicKey
                            );
                            triggerAlert(t('✓ Email enviado correctamente a {email}', '✓ Email sent successfully to {email}').replace('{email}', sendingToClient.clientEmail));
                            setShowSendEmailModal(false);
                          } catch (err) {
                            console.error('Error sending gallery link email:', err);
                            triggerAlert(t('✗ Error al enviar el email. Verificá la consola.', '✗ Error sending email. Check the console.'));
                          } finally {
                            setIsSendingEmail(false);
                          }
                        }}
                        className="py-2 px-5 bg-gold-500 text-dark hover:bg-gold-400 rounded-lg text-[9px] font-mono tracking-widest uppercase font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSendingEmail ? (
                          <>
                            <div className="w-3 h-3 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                            <span>{t('Enviando...', 'Sending...')}</span>
                          </>
                        ) : (
                          <>
                            <Mail size={12} />
                            <span>{t('Enviar Email', 'Send Email')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* MOBILE SIDEBAR DRAWER — slides from left on < lg */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-overlay/60 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-dark-gray border-r border-white/5 z-50 lg:hidden flex flex-col p-6 overflow-y-auto touch-pan-y"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Settings className="text-gold-400" size={18} />
                  <span className="font-serif text-sm tracking-widest text-gold-50 font-bold">AUREA CMS</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="text-white/60 p-1.5 hover:text-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col flex-1 justify-between">
                <div className="space-y-1.5">
                  {([
                    { id: 'dashboard', icon: BarChart3, label: t('Dashboard', 'Dashboard', 'Painel') },
                    { id: 'photos', icon: Camera, label: t('Fotografías', 'Photographs', 'Fotografias') },
                    { id: 'bookings', icon: Calendar, label: t('Cola de Reservas', 'Bookings Queue', 'Fila de Reservas') },
                    { id: 'packages', icon: ShoppingBag, label: t('Paquetes Fotográficos', 'Photography Packages', 'Pacotes Fotográficos') },
                    { id: 'session-categories', icon: Sliders, label: t('Tipos de Sesión', 'Session Types', 'Tipos de Sessão') },
                    { id: 'messages', icon: MessageSquare, label: t('Bandeja de Entrada', 'Inbox', 'Caixa de Entrada') },
                    { id: 'seo', icon: FileCode, label: t('Configuración SEO', 'SEO Schema', 'Configuração SEO') },
                    { id: 'profile', icon: User, label: t('Biografía y Perfil', 'Biography & Profile', 'Biografia e Perfil') },
                    { id: 'clients', icon: Users, label: t('Clientes y Galerías', 'Clients & Galleries', 'Clientes e Galerias') },
                    { id: 'email_settings', icon: Mail, label: t('Configuración de Correo', 'Email Configuration', 'Configuração de E-mail') },
                  ] as const).map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as typeof activeTab);
                          if (tab.id === 'bookings') setUnseenBookings(0);
                          if (tab.id === 'messages') setUnseenMessages(0);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full text-left min-h-[48px] px-3 py-3 rounded-lg font-mono text-xs uppercase tracking-wider transition-all flex items-center space-x-3 cursor-pointer ${
                          isActive ? 'bg-gold-500 text-dark font-bold' : 'text-white/75 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="flex-1">{tab.label}</span>
                        {tab.id === 'bookings' && bookings.filter(b => b.status === 'pending').length > 0 && (
                          <span className="bg-gold-500 text-dark text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                            {bookings.filter(b => b.status === 'pending').length}
                          </span>
                        )}
                        {tab.id === 'bookings' && unseenBookings > 0 && (
                          <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                            {unseenBookings}
                          </span>
                        )}
                        {tab.id === 'messages' && messages.filter(m => !m.isRead).length > 0 && (
                          <span className="bg-gold-500 text-dark text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                            {messages.filter(m => !m.isRead).length}
                          </span>
                        )}
                        {tab.id === 'messages' && unseenMessages > 0 && (
                          <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                            {unseenMessages}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setMobileSidebarOpen(false);
                      onBackToSite?.();
                    }}
                    className="w-full text-left min-h-[48px] px-3 py-3 rounded-lg font-mono text-xs uppercase tracking-wider text-white/60 hover:text-gold-400 hover:bg-white/5 transition-all flex items-center space-x-3 cursor-pointer"
                  >
                    <Eye size={16} />
                    <span>{t('Ver Sitio', 'View Site', 'Ver Site')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileSidebarOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left min-h-[48px] px-3 py-3 rounded-lg font-mono text-xs uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-all flex items-center space-x-3 cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>{t('Cerrar Sesión', 'Exit Workspace', 'Sair')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

/* ──────────────────────────────────────────────
   Session Categories Editor (sub-component)
   ────────────────────────────────────────────── */
interface SessionCatEditorProps {
  categories: SessionCategory[];
  onUpdate: (cats: SessionCategory[]) => void;
  triggerAlert: (msg: string) => void;
  lang: ActiveLanguage;
}

const CATEGORY_ICONS = ['Heart', 'Gem', 'Camera', 'Users', 'Baby', 'Sparkles', 'PartyPopper', 'GraduationCap', 'Briefcase', 'Utensils', 'Package', 'Calendar'];

function SessionCategoriesEditor({ categories, onUpdate, triggerAlert, lang }: SessionCatEditorProps) {
  const [localCats, setLocalCats] = useState<SessionCategory[]>(categories);
  const [editingCat, setEditingCat] = useState<SessionCategory | null>(null);

  useEffect(() => { setLocalCats(categories); }, [categories]);

  const t = (es: string, en: string) => lang === 'en' ? en : es;

  const sorted = [...localCats].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleSaveAll = () => {
    onUpdate(localCats);
    triggerAlert(t('✓ Categorías guardadas.', '✓ Categories saved.'));
  };

  const startEdit = (cat: SessionCategory) => setEditingCat({ ...cat });
  const cancelEdit = () => setEditingCat(null);

  const saveEdit = () => {
    if (!editingCat) return;
    setLocalCats(prev => prev.map(c => c.id === editingCat.id ? editingCat : c));
    triggerAlert(t('✓ Categoría actualizada.', '✓ Category updated.'));
    setEditingCat(null);
  };

  const toggleActive = (id: string) => {
    setLocalCats(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const updateField = (field: keyof SessionCategory, value: string | number | boolean) => {
    if (!editingCat) return;
    setEditingCat({ ...editingCat, [field]: value });
  };

  const inputClass = "w-full bg-charcoal border border-[#D8C0A8] rounded px-2.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold-400 font-sans";
  const labelClass = "text-[9px] font-mono text-white/50 uppercase";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-white">{t('Tipos de Sesión', 'Session Types')}</h2>
          <p className="text-xs text-white/50">{t('Gestiona las categorías de sesión que se muestran en la sección pública.', 'Manage session categories shown in the public section.')}</p>
        </div>
        <button onClick={handleSaveAll} className="py-1.5 px-4 bg-gold-500 text-dark hover:bg-gold-400 rounded-lg text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer transition-all">
          <Save size={11} />
          <span>{t('Guardar Todo', 'Save All')}</span>
        </button>
      </div>

      {/* Edit Modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-overlay/80 backdrop-blur-sm overflow-y-auto pt-12">
          <div className="bg-charcoal border border-[#D8C0A8] rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-serif text-lg text-white">{t('Editar Categoría', 'Edit Category')}</h3>
              <button onClick={cancelEdit} className="text-white/50 hover:text-white cursor-pointer p-1"><X size={16} /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelClass}>{t('Icono', 'Icon')}</label>
                <select value={editingCat.icon} onChange={(e) => updateField('icon', e.target.value)}
                  className="w-full bg-charcoal border border-[#D8C0A8] rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-gold-400">
                  {CATEGORY_ICONS.map(ico => <option key={ico} value={ico} className="bg-charcoal">{ico}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Nombre / Name</label>
                <div className="grid grid-cols-2 gap-2">
                  <input value={editingCat.name_es} onChange={(e) => updateField('name_es', e.target.value)} placeholder="Español" className={inputClass} />
                  <input value={editingCat.name_en} onChange={(e) => updateField('name_en', e.target.value)} placeholder="English" className={inputClass} />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>{t('Descripción', 'Description')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <textarea rows={2} value={editingCat.description_es} onChange={(e) => updateField('description_es', e.target.value)} placeholder="Español" className={inputClass + " resize-none"} />
                  <textarea rows={2} value={editingCat.description_en} onChange={(e) => updateField('description_en', e.target.value)} placeholder="English" className={inputClass + " resize-none"} />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>{t('Imagen', 'Image')}</label>
                <div className="flex items-center space-x-2">
                  <input value={editingCat.image} onChange={(e) => updateField('image', e.target.value)} placeholder="https://..." className={inputClass} />
                  <label className="shrink-0 py-2 px-3 bg-white/10 hover:bg-white/20 border border-[#D8C0A8] rounded text-[9px] font-mono text-white/70 hover:text-white uppercase tracking-widest cursor-pointer transition-all whitespace-nowrap">
                    {t('Subir', 'Upload')}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const { blob } = await compressImage(file, 1200, 0.8);
                        const id = `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                        const downloadUrl = await uploadImageBlob(`session_categories/${id}.jpg`, blob);
                        updateField('image', downloadUrl);
                      } catch (err) {
                        console.error('Category image upload failed', err);
                      }
                      e.target.value = '';
                    }} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelClass}>{t('Orden', 'Order')}</label>
                  <input type="number" min="0" value={editingCat.sortOrder} onChange={(e) => updateField('sortOrder', Number(e.target.value))} className={inputClass} />
                </div>
                <div className="space-y-1 flex items-end pb-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={editingCat.active} onChange={(e) => updateField('active', e.target.checked)} className="accent-gold-500 w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono text-white/70 uppercase">{t('Activo', 'Active')}</span>
                  </label>
                </div>
              </div>

              {/* Image preview */}
              {editingCat.image && (
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <img src={editingCat.image} alt="Preview" className="w-full h-32 object-cover" />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-2 border-t border-white/5">
              <button onClick={cancelEdit} className="px-4 py-2 border border-[#D8C0A8] rounded-lg text-[10px] font-mono text-white/70 hover:text-white cursor-pointer transition-all">
                {t('Cancelar', 'Cancel')}
              </button>
              <button onClick={saveEdit} className="px-4 py-2 bg-gold-500 text-dark font-mono text-[10px] tracking-widest uppercase font-bold rounded-lg hover:bg-gold-400 cursor-pointer transition-all">
                {t('Guardar', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-2">
        {sorted.map(cat => {
          const cName = lang === 'es' ? cat.name_es : cat.name_en;
          return (
            <div key={cat.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${cat.active ? 'border-[#D8C0A8] bg-dark-gray' : 'border-[#D8C0A8]/30 bg-dark-gray opacity-60'}`}>
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-charcoal border border-white/5">
                  {cat.image && <img src={cat.image} alt={cName} className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-serif text-white truncate block">{cName}</span>
                  <span className="text-[9px] font-mono text-white/40 uppercase">ID: {cat.id}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 shrink-0">
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input type="checkbox" checked={cat.active} onChange={() => toggleActive(cat.id)} className="accent-gold-500 w-3 h-3" />
                  <span className="text-[8px] font-mono text-white/40">{t('ON', 'ON')}</span>
                </label>
                <label className="p-1.5 text-white/40 hover:text-gold-400 cursor-pointer transition-colors" title={t('Subir imagen', 'Upload image')}>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const { blob } = await compressImage(file, 1200, 0.8);
                      const id = `cat-${cat.id}-${Date.now()}`;
                      const downloadUrl = await uploadImageBlob(`session_categories/${id}.jpg`, blob);
                      setLocalCats(prev => prev.map(c => c.id === cat.id ? { ...c, image: downloadUrl } : c));
                    } catch (err) {
                      console.error('Category image upload failed', err);
                    }
                    e.target.value = '';
                  }} />
                  <Upload size={12} />
                </label>
                <button onClick={() => startEdit(cat)} className="p-1.5 text-white/40 hover:text-gold-400 cursor-pointer transition-colors" title={t('Editar', 'Edit')}>
                  <Edit3 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
