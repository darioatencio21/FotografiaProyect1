/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
   Heart, ArrowRight, MessageSquare, MapPin, 
   Mail, Phone, ShieldCheck, Sparkles, AlertCircle, ChevronDown,
   Eye, EyeOff, X, Camera, Users, Calendar, PartyPopper, 
   CheckCircle2, ShoppingBag, Star, Baby, GraduationCap, Gift, Briefcase
} from 'lucide-react';

import { 
  INITIAL_PHOTOGRAPHS, INITIAL_SERVICES, INITIAL_TESTIMONIALS, 
  INITIAL_BLOG_POSTS, INITIAL_FAQS, INITIAL_BOOKINGS, 
  INITIAL_MESSAGES, INITIAL_SEO, INITIAL_ANALYTICS, TRANSLATIONS,
  INITIAL_PROFILE, INITIAL_BOOKING_CONFIG, INITIAL_EMAIL_CONFIG,
   INITIAL_CLIENT_ACCOUNTS, INITIAL_PHOTOGRAPHY_PACKAGES
} from './data/mockData';
import { Photograph, Service, Testimonial, BlogPost, FAQ, Booking, Message, SEOMetadata, PhotographerProfile, BookingConfig, EmailConfig, ClientAccount, AnalyticsStats, PhotographyPackage } from './types';

import CustomCursor from './components/CustomCursor';
import Lightbox from './components/Lightbox';
import BookingCalendar from './components/BookingCalendar';
import ClientPortal from './components/ClientPortal';
import StripeCheckout from './components/StripeCheckout';
import AdminCMS from './components/AdminCMS';
import Header from './components/Header';
import Footer from './components/Footer';
import LegalViews from './components/LegalViews';

import {
  getCollectionWithFallback,
  getSingleDocument,
  saveDocument,
  deleteDocument,
  loginWithFirebase,
  logoutFromFirebase,
  onAuthChange
} from './lib/firebase';
import { sanitizeString, sanitizeEmail, unescapeHTMLEntities } from './lib/sanitize';

async function syncCollection<T extends { id: string }>(
  collectionPath: string,
  oldList: T[],
  newList: T[]
) {
  try {
    const newIds = new Set(newList.map(item => item.id));
    const deletedItems = oldList.filter(item => !newIds.has(item.id));
    for (const item of deletedItems) {
      await deleteDocument(collectionPath, item.id);
    }

    const oldMap = new Map(oldList.map(item => [item.id, item]));
    for (const item of newList) {
      const oldItem = oldMap.get(item.id);
      if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(item)) {
        await saveDocument(collectionPath, item.id, item);
      }
    }
  } catch (err) {
    console.error(`Error syncing collection "${collectionPath}":`, err);
  }
}

export const getHeroPositionClass = (pos?: string) => {
  if (pos === 'top') return 'object-top';
  if (pos === 'bottom') return 'object-bottom';
  if (pos === 'left') return 'object-left';
  if (pos === 'right') return 'object-right';
  return 'object-center';
};

export const getHeroScaleClass = (scale?: number) => {
  if (scale === 100) return 'scale-100';
  if (scale === 110) return 'scale-110';
  if (scale === 120) return 'scale-120';
  if (scale === 130) return 'scale-130';
  if (scale === 150) return 'scale-150';
  return 'scale-105'; // default
};

export default function App() {
  // Navigation & Language Context
  const [currentView, setCurrentView] = useState<string>('home');
  const [lang, setLang] = useState<'es' | 'en' | 'pt'>('es');
  
  const [photographs, setPhotographs] = useState<Photograph[]>(() => {
    const saved = localStorage.getItem('aurea_photos');
    return saved ? JSON.parse(saved) : INITIAL_PHOTOGRAPHS;
  });
  
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('aurea_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('aurea_testimonials');
    return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('aurea_blog');
    return saved ? JSON.parse(saved) : INITIAL_BLOG_POSTS;
  });

  const [faqs, setFaqs] = useState<FAQ[]>(() => {
    const saved = localStorage.getItem('aurea_faqs');
    return saved ? JSON.parse(saved) : INITIAL_FAQS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('aurea_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('aurea_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [seo, setSeo] = useState<SEOMetadata>(() => {
    const saved = localStorage.getItem('aurea_seo');
    return saved ? JSON.parse(saved) : INITIAL_SEO;
  });

  const [profile, setProfile] = useState<PhotographerProfile>(() => {
    const saved = localStorage.getItem('aurea_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [bookingConfig, setBookingConfig] = useState<BookingConfig>(() => {
    const saved = localStorage.getItem('aurea_booking_config');
    return saved ? JSON.parse(saved) : INITIAL_BOOKING_CONFIG;
  });

  const [emailConfig, setEmailConfig] = useState<EmailConfig>(() => {
    const saved = localStorage.getItem('aurea_email_config');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_CONFIG;
  });

  const [packages, setPackages] = useState<PhotographyPackage[]>(() => {
    const saved = localStorage.getItem('aurea_packages');
    return saved ? JSON.parse(saved) : INITIAL_PHOTOGRAPHY_PACKAGES;
  });

  const [clientAccounts, setClientAccounts] = useState<ClientAccount[]>(() => {
    const saved = localStorage.getItem('aurea_client_accounts');
    return saved ? JSON.parse(saved) : INITIAL_CLIENT_ACCOUNTS;
  });

  // UI Interactive States
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedPhotoForLightbox, setSelectedPhotoForLightbox] = useState<Photograph | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('aurea_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [activeBlogModal, setActiveBlogModal] = useState<BlogPost | null>(null);
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);

  // Administrative Workspace credentials
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('aurea_admin_logged') === 'true';
  });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  const [isAdminAuthLoading, setIsAdminAuthLoading] = useState(false);

  // Stripe Checkout Integrations
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [checkoutDesc, setCheckoutDesc] = useState('');

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  const t = TRANSLATIONS[lang];

  const [seoAnalytics, setSeoAnalytics] = useState<AnalyticsStats>(INITIAL_ANALYTICS);

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (user) {
        setIsAdminLoggedIn(true);
        localStorage.setItem('aurea_admin_logged', 'true');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function syncFirestore() {
      const [photosRes, servicesRes, testimonialsRes, blogRes, faqsRes,
        bookingsRes, messagesRes, clientAccsRes] = await Promise.all([
        getCollectionWithFallback<Photograph>('photographs', INITIAL_PHOTOGRAPHS),
        getCollectionWithFallback<Service>('services', INITIAL_SERVICES),
        getCollectionWithFallback<Testimonial>('testimonials', INITIAL_TESTIMONIALS),
        getCollectionWithFallback<BlogPost>('blogPosts', INITIAL_BLOG_POSTS),
        getCollectionWithFallback<FAQ>('faqs', INITIAL_FAQS),
        getCollectionWithFallback<Booking>('bookings', INITIAL_BOOKINGS),
        getCollectionWithFallback<Message>('messages', INITIAL_MESSAGES),
        getCollectionWithFallback<ClientAccount>('clientAccounts', INITIAL_CLIENT_ACCOUNTS),
      ]);

      const packagesRes = await getCollectionWithFallback<PhotographyPackage>('photography_packages', []);
      const [seoRes, profileRes, bookingConfigRes, emailConfigRes, analyticsRes, adminDocRes] = await Promise.all([
        getSingleDocument<SEOMetadata>('seo', 'config'),
        getSingleDocument<PhotographerProfile>('profile', 'photographer'),
        getSingleDocument<BookingConfig>('bookingConfig', 'config'),
        getSingleDocument<EmailConfig>('emailConfig', 'config'),
        getSingleDocument<AnalyticsStats>('analytics', 'stats'),
        getSingleDocument<{ username: string }>('admin', 'config'),
      ]);

      if (cancelled) return;

      // One-time migration: repair data corrupted by old sanitizeString HTML escaping
      const MIGRATE_FLAG = 'aurea_html_entities_migrated_v2';
      const needsMigration = !localStorage.getItem(MIGRATE_FLAG);

      if (needsMigration) {
        function migrateStrings(obj: unknown): unknown {
          if (typeof obj === 'string') return unescapeHTMLEntities(obj);
          if (Array.isArray(obj)) return obj.map(migrateStrings);
          if (obj && typeof obj === 'object') {
            const result: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
              result[k] = migrateStrings(v);
            }
            return result;
          }
          return obj;
        }
        const migratedPhotos = photosRes.map(p => migrateStrings(p));
        const migratedServices = servicesRes.map(s => migrateStrings(s));
        const migratedTestimonials = testimonialsRes.map(t => migrateStrings(t));
        const migratedBlogs = blogRes.map(b => migrateStrings(b));
        const migratedFaqs = faqsRes.map(f => migrateStrings(f));
        const migratedBookings = bookingsRes.map(b => migrateStrings(b));
        const migratedMessages = messagesRes.map(m => migrateStrings(m));
        const migratedClients = clientAccsRes.map(c => migrateStrings(c));
        const migratedSeo = seoRes ? migrateStrings(seoRes) : seoRes;
        const migratedProfile = profileRes ? migrateStrings(profileRes) : profileRes;
        const migratedEmailCfg = emailConfigRes ? migrateStrings(emailConfigRes) : emailConfigRes;
        Promise.all([
          ...(migratedPhotos as Photograph[]).map((p, i) => p !== photosRes[i] ? saveDocument('photographs', p.id, p) : Promise.resolve()),
          ...(migratedServices as Service[]).map((s, i) => s !== servicesRes[i] ? saveDocument('services', s.id, s) : Promise.resolve()),
          ...(migratedTestimonials as Testimonial[]).map((t, i) => t !== testimonialsRes[i] ? saveDocument('testimonials', t.id, t) : Promise.resolve()),
          ...(migratedBlogs as BlogPost[]).map((b, i) => b !== blogRes[i] ? saveDocument('blogPosts', b.id, b) : Promise.resolve()),
          ...(migratedFaqs as FAQ[]).map((f, i) => f !== faqsRes[i] ? saveDocument('faqs', f.id, f) : Promise.resolve()),
          ...(migratedBookings as Booking[]).map((b, i) => b !== bookingsRes[i] ? saveDocument('bookings', b.id, b) : Promise.resolve()),
          ...(migratedMessages as Message[]).map((m, i) => m !== messagesRes[i] ? saveDocument('messages', m.id, m) : Promise.resolve()),
          ...(migratedClients as ClientAccount[]).map((c, i) => c !== clientAccsRes[i] ? saveDocument('clientAccounts', c.id, c) : Promise.resolve()),
          migratedSeo && migratedSeo !== seoRes ? saveDocument('seo', 'config', migratedSeo) : Promise.resolve(),
          migratedProfile && migratedProfile !== profileRes ? saveDocument('profile', 'photographer', migratedProfile) : Promise.resolve(),
          migratedEmailCfg && migratedEmailCfg !== emailConfigRes ? saveDocument('emailConfig', 'config', migratedEmailCfg) : Promise.resolve(),
        ]).then(() => {
          localStorage.setItem(MIGRATE_FLAG, 'true');
          console.log('Data migration complete: HTML entities unescaped in Firestore');
        }).catch(() => {});
        setPhotographs(migratedPhotos);
        setServices(migratedServices);
        setTestimonials(migratedTestimonials);
        setBlogPosts(migratedBlogs);
        setFaqs(migratedFaqs);
        setBookings(migratedBookings);
        setMessages(migratedMessages);
        setClientAccounts(migratedClients);
        localStorage.setItem('aurea_client_accounts', JSON.stringify(migratedClients));
        setSeo(migratedSeo ?? INITIAL_SEO);
        setProfile(migratedProfile ?? INITIAL_PROFILE);
      } else {
        setPhotographs(photosRes);
        setServices(servicesRes);
        setTestimonials(testimonialsRes);
        setBlogPosts(blogRes);
        setFaqs(faqsRes);
        setBookings(bookingsRes);
        setMessages(messagesRes);
        setClientAccounts(clientAccsRes);
        localStorage.setItem('aurea_client_accounts', JSON.stringify(clientAccsRes));
        setSeo(seoRes ?? INITIAL_SEO);
        setProfile(profileRes ?? INITIAL_PROFILE);
      }

      setPackages(packagesRes.length > 0 ? packagesRes : INITIAL_PHOTOGRAPHY_PACKAGES);
      setBookingConfig(bookingConfigRes ?? INITIAL_BOOKING_CONFIG);
      setEmailConfig(emailConfigRes ? { ...INITIAL_EMAIL_CONFIG, ...emailConfigRes } : INITIAL_EMAIL_CONFIG);
      setSeoAnalytics(analyticsRes ?? INITIAL_ANALYTICS);

      if (!seoRes) saveDocument('seo', 'config', INITIAL_SEO);
      if (!profileRes) saveDocument('profile', 'photographer', INITIAL_PROFILE);
      if (!bookingConfigRes) saveDocument('bookingConfig', 'config', INITIAL_BOOKING_CONFIG);
      if (!emailConfigRes) saveDocument('emailConfig', 'config', INITIAL_EMAIL_CONFIG);
      if (!analyticsRes) saveDocument('analytics', 'stats', INITIAL_ANALYTICS);
      if (packagesRes.length === 0) {
        for (const pkg of INITIAL_PHOTOGRAPHY_PACKAGES) {
          await saveDocument('photography_packages', pkg.id, pkg);
        }
      }
      if (!adminDocRes) {
        await saveDocument('admin', 'config', { username: 'admin', password: 'admin123' });
      }
    }
    syncFirestore();
    return () => { cancelled = true; };
  }, []);

  // Custom state wrappers that write changes to both local state and sync them to Firestore
  const handleUpdatePhotographs = (newPhotos: Photograph[]) => {
    syncCollection('photographs', photographs, newPhotos);
    setPhotographs(newPhotos);
  };

  const handleUpdateServices = (newServices: Service[]) => {
    syncCollection('services', services, newServices);
    setServices(newServices);
  };

  const handleUpdateTestimonials = (newTestimonials: Testimonial[]) => {
    syncCollection('testimonials', testimonials, newTestimonials);
    setTestimonials(newTestimonials);
  };

  const handleUpdateBlogPosts = (newBlogPosts: BlogPost[]) => {
    syncCollection('blogPosts', blogPosts, newBlogPosts);
    setBlogPosts(newBlogPosts);
  };

  const handleUpdateFaqs = (newFaqs: FAQ[]) => {
    syncCollection('faqs', faqs, newFaqs);
    setFaqs(newFaqs);
  };

  const handleUpdateBookings = (newBookings: Booking[]) => {
    syncCollection('bookings', bookings, newBookings);
    setBookings(newBookings);
  };

  const handleUpdateMessages = (newMessages: Message[]) => {
    syncCollection('messages', messages, newMessages);
    setMessages(newMessages);
  };

  const handleUpdateClientAccounts = (newAccounts: ClientAccount[]) => {
    syncCollection('clientAccounts', clientAccounts, newAccounts);
    setClientAccounts(newAccounts);
    localStorage.setItem('aurea_client_accounts', JSON.stringify(newAccounts));
  };

  const handleUpdateSeo = async (newSeo: SEOMetadata) => {
    setSeo(newSeo);
    await saveDocument('seo', 'config', newSeo);
  };

  const handleUpdateProfile = async (newProfile: PhotographerProfile) => {
    setProfile(newProfile);
    await saveDocument('profile', 'photographer', newProfile);
  };

  const handleUpdateBookingConfig = async (newConfig: BookingConfig) => {
    setBookingConfig(newConfig);
    await saveDocument('bookingConfig', 'config', newConfig);
  };

  const handleUpdateEmailConfig = async (newConfig: EmailConfig) => {
    setEmailConfig(newConfig);
    await saveDocument('emailConfig', 'config', newConfig);
  };

  const handleUpdatePackages = async (newPackages: PhotographyPackage[]) => {
    setPackages(newPackages);
    await syncCollection('photography_packages', packages, newPackages);
  };

  // Sync to LocalStorage whenever DB collections update (for offline-fallback cache layer)
  useEffect(() => {
    localStorage.setItem('aurea_photos', JSON.stringify(photographs));
  }, [photographs]);

  useEffect(() => {
    localStorage.setItem('aurea_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('aurea_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('aurea_blog', JSON.stringify(blogPosts));
  }, [blogPosts]);

  useEffect(() => {
    localStorage.setItem('aurea_faqs', JSON.stringify(faqs));
  }, [faqs]);

  useEffect(() => {
    localStorage.setItem('aurea_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('aurea_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('aurea_seo', JSON.stringify(seo));
  }, [seo]);

  useEffect(() => {
    localStorage.setItem('aurea_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('aurea_booking_config', JSON.stringify(bookingConfig));
  }, [bookingConfig]);

  useEffect(() => {
    localStorage.setItem('aurea_email_config', JSON.stringify(emailConfig));
  }, [emailConfig]);

  useEffect(() => {
    localStorage.setItem('aurea_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('aurea_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Update Dynamic Document Meta tags according to active SEO settings
  useEffect(() => {
    document.title = seo.title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seo.description);
  }, [seo]);

  // Favorites management
  const handleToggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Submit contact message (inputs sanitized)
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const safeName = sanitizeString(contactName);
    const safeEmail = sanitizeEmail(contactEmail);
    const safeSubject = sanitizeString(contactSubject);
    const safeMsg = sanitizeString(contactMsg);

    if (!safeName || !safeEmail || !safeMsg) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      name: safeName,
      email: safeEmail,
      subject: safeSubject || 'Direct Portfolio Query',
      message: safeMsg,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    const updated = [newMessage, ...messages];
    setMessages(updated);
    setContactSuccess(true);
    
    // Save directly to Firestore collection
    try {
      await saveDocument('messages', newMessage.id, newMessage);
    } catch (err) {
      console.error('Could not save message directly to Firestore:', err);
    }

    if (emailConfig && emailConfig.emailjsServiceId && emailConfig.emailjsTemplateId && emailConfig.emailjsPublicKey) {
      try {
        const emailjs = await import('@emailjs/browser');
        await emailjs.send(
          emailConfig.emailjsServiceId,
          emailConfig.emailjsTemplateId,
          {
            to_name: sanitizeString(profile.name || 'Miriam Campos'),
            to_email: emailConfig.receiverEmail || safeEmail,
            from_name: safeName,
            from_email: safeEmail,
            message: safeMsg,
            booking_details: `Mensaje de contacto - Asunto: ${safeSubject || 'Direct Portfolio Query'}`
          },
          emailConfig.emailjsPublicKey
        );

        if (emailConfig.enableAutoResponse) {
          const autoTemplateId = emailConfig.emailjsAutoTemplateId || emailConfig.emailjsTemplateId;
          const autoSubject = emailConfig.autoReplySubject || '¡Tu mensaje ha sido recibido! - Aurea Studio';
          const autoMessage = emailConfig.autoReplyMessage || 'Gracias por contactarte con nosotros. Responderemos a la brevedad.';

          await emailjs.send(
            emailConfig.emailjsServiceId,
            autoTemplateId,
            {
              to_name: safeName,
              to_email: safeEmail,
              client_name: safeName,
              client_email: safeEmail,
              email: safeEmail,
              recipient_email: safeEmail,
              reply_to: safeEmail,
              from_name: sanitizeString(profile.name || 'Miriam Campos'),
              from_email: emailConfig.receiverEmail,
              reply_subject: autoSubject,
              subject: autoSubject,
              autoReplySubject: autoSubject,
              reply_message: autoMessage,
              message: autoMessage,
              autoReplyMessage: autoMessage,
              booking_details: `Contacto recibido: "${safeSubject || 'Consulta General'}"`
            },
            emailConfig.emailjsPublicKey
          );
        }
      } catch (err) {
        console.error('Could not send contact emails via EmailJS:', err);
      }
    }

    setContactName('');
    setContactEmail('');
    setContactSubject('');
    setContactMsg('');
    setTimeout(() => setContactSuccess(false), 4000);
  };

  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminAuthLoading(true);
    setAdminLoginError('');

    const FALLBACK_USER = 'admin';
    const FALLBACK_PASS = 'admin123';
    const username = sanitizeString(adminUsername).toLowerCase();
    const password = adminPassword;

    // 1) Check hardcoded fallback FIRST — instant, no network
    if (username === FALLBACK_USER && password === FALLBACK_PASS) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('aurea_admin_logged', 'true');
      setShowAdminLogin(false);
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsAdminAuthLoading(false);
      return;
    }

    // 2) Try Firebase Auth with a short timeout
    try {
      const email = `${username}@admin.local`;
      await Promise.race([
        loginWithFirebase(email, password),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]);
      setIsAdminLoggedIn(true);
      localStorage.setItem('aurea_admin_logged', 'true');
      setShowAdminLogin(false);
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsAdminAuthLoading(false);
      return;
    } catch {
      // Firebase Auth not available or credentials wrong - continue
    }

    // 3) Try Firestore admin document
    try {
      const adminDoc = await getSingleDocument<{ username: string; password: string }>('admin', 'config');
      if (adminDoc && username === adminDoc.username.toLowerCase() && password === adminDoc.password) {
        setIsAdminLoggedIn(true);
        localStorage.setItem('aurea_admin_logged', 'true');
        setShowAdminLogin(false);
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsAdminAuthLoading(false);
        return;
      }
      setAdminLoginError(adminDoc ? 'CREDENCIALES INCORRECTAS' : 'ADMIN ACCOUNT NOT FOUND. USING DEFAULT: admin / admin123');
    } catch {
      setAdminLoginError('AUTH SYSTEM UNAVAILABLE. CHECK DATABASE CONNECTION.');
    } finally {
      setIsAdminAuthLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.setItem('aurea_admin_logged', 'false');
    setCurrentView('home');
    logoutFromFirebase().catch(() => {});
  };

  // Trigger Stripe print or service booking Checkout overlay
  const handleOpenStripeCheckout = (amount: number, description: string) => {
    setCheckoutAmount(amount);
    setCheckoutDesc(description);
    setCheckoutOpen(true);
  };

  // Next / Prev photo in Lightbox
  const handleLightboxNext = () => {
    if (!selectedPhotoForLightbox) return;
    const filteredPhotos = photographs.filter(p => activeFilter === 'all' || p.category === activeFilter);
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhotoForLightbox.id);
    if (currentIndex < filteredPhotos.length - 1) {
      setSelectedPhotoForLightbox(filteredPhotos[currentIndex + 1]);
    } else {
      setSelectedPhotoForLightbox(filteredPhotos[0]);
    }
  };

  const handleLightboxPrev = () => {
    if (!selectedPhotoForLightbox) return;
    const filteredPhotos = photographs.filter(p => activeFilter === 'all' || p.category === activeFilter);
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhotoForLightbox.id);
    if (currentIndex > 0) {
      setSelectedPhotoForLightbox(filteredPhotos[currentIndex - 1]);
    } else {
      setSelectedPhotoForLightbox(filteredPhotos[filteredPhotos.length - 1]);
    }
  };

  // Categories translation tags
  const filterCategories = [
    { value: 'all', label: t.all },
    { value: 'retrato', label: t.retrato },
    { value: 'boda', label: t.boda },
    { value: 'moda', label: t.moda },
    { value: 'drone', label: t.drone },
    { value: 'producto', label: t.producto },
    { value: 'viajes', label: t.viajes },
    { value: 'evento', label: t.evento },
    { value: 'naturaleza', label: t.naturaleza }
  ];

  // Filtered photograph collection
  const filteredPhotographs = photographs.filter(photo => {
    const matchesCategory = activeFilter === 'all' || photo.category === activeFilter;
    
    // Text search query by tag, metadata, location, colors
    const matchesSearch = !searchQuery ? true : (
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.exif.camera.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.exif.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-dark text-white min-h-screen relative font-sans select-none selection:bg-gold-500 selection:text-dark">
      {/* CORE HEADER */}
      <Header
        currentView={currentView}
        onSetView={setCurrentView}
        lang={lang}
        onSetLang={setLang}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setShowAdminLogin(true)}
      />

      <AnimatePresence mode="wait">
        <motion.main
          key={currentView}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="pb-24 pt-4 px-6 lg:px-12 max-w-7xl mx-auto space-y-24"
        >
          {/* ======================================================= */}
          {/* HOME SCREEN */}
          {/* ======================================================= */}
          {currentView === 'home' && (
            <div className="space-y-24">
              {/* Split-Screen Editorial Hero */}
              <section className="relative h-screen -mx-6 lg:-mx-12 -mt-4 overflow-hidden">
                
                {/* Mobile: single image */}
                <div className="absolute inset-0 z-0 md:hidden overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="w-full h-full"
                  >
                    <div className="absolute inset-0 bg-dark/20 z-10" />
                    <img
                      src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=85&w=1200"
                      alt="Fine Art Photography"
                      className="w-full h-full object-cover object-center"
                      style={{
                        animation: 'heroZoom 20s ease-in-out infinite alternate'
                      }}
                    />
                  </motion.div>
                </div>

                {/* Desktop: Left image */}
                <div className="hidden md:block absolute inset-y-0 left-0 w-1/2 z-0 overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="w-full h-full"
                  >
                    <div className="absolute inset-0 bg-dark/15 z-10" />
                    <img
                      src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=85&w=1600"
                      alt="Fine Art Wedding"
                      className="w-full h-full object-cover object-center"
                      style={{
                        animation: 'heroZoom 20s ease-in-out infinite alternate'
                      }}
                    />
                  </motion.div>
                </div>

                {/* Desktop: Right image */}
                <div className="hidden md:block absolute inset-y-0 right-0 w-1/2 z-0 overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                    className="w-full h-full"
                  >
                    <div className="absolute inset-0 bg-dark/15 z-10" />
                    <img
                      src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=85&w=1600"
                      alt="Editorial Fashion"
                      className="w-full h-full object-cover object-center"
                      style={{
                        animation: 'heroZoom 20s ease-in-out infinite alternate'
                      }}
                    />
                  </motion.div>
                </div>

                {/* Subtle divider line */}
                <div className="absolute inset-y-[15%] left-1/2 w-px bg-white/10 z-20 hidden md:block" />

                {/* Central content overlay */}
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <div className="text-center max-w-2xl mx-auto px-6 pointer-events-auto">
                    <motion.h1
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.15] tracking-wide text-white"
                    >
                      <span className="italic">{t.heroTitle.split(',')[0]},</span>
                      <br />
                      <span className="not-italic font-light">{t.heroTitle.split(',')[1] ? t.heroTitle.split(',')[1].trim().split('&')[0]?.trim() : 'EMOTIÓN'}</span>
                      <br />
                      <span className="italic font-medium">&</span>{' '}
                      <span className="not-italic font-light">{t.heroTitle.split('&')[1]?.trim() || 'SIMETRÍA'}</span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                      className="text-[10px] sm:text-[11px] md:text-xs text-white/70 max-w-lg mx-auto leading-relaxed tracking-wider font-light mt-6 md:mt-10"
                    >
                      {t.heroSubtitle}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                      className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-8 md:mt-12"
                    >
                      <button
                        onClick={() => setCurrentView('portfolio')}
                        className="px-6 md:px-7 py-2.5 md:py-3 bg-white text-dark hover:bg-gold-400 font-mono text-[9px] md:text-[10px] tracking-widest uppercase font-semibold transition-all duration-300 cursor-pointer"
                      >
                        {t.ctaPortfolio}
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('services');
                          setTimeout(() => {
                            const element = document.getElementById('booking-calendar');
                            if (element) element.scrollIntoView({ behavior: 'smooth' });
                          }, 200);
                        }}
                        className="px-6 md:px-7 py-2.5 md:py-3 border border-white/40 text-white hover:border-white font-mono text-[9px] md:text-[10px] tracking-widest uppercase font-semibold transition-all duration-300 cursor-pointer bg-transparent"
                      >
                        {t.ctaBook}
                      </button>
                    </motion.div>
                  </div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center space-y-2"
                >
                  <span className="text-[7px] font-mono tracking-[0.3em] text-white/30 uppercase">Scroll</span>
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-px h-8 bg-white/20"
                  />
                </motion.div>
              </section>

              {/* Statistics Showcase Ribbon Banner */}
              <section className="py-12 border-y border-white/10 bg-dark-gray rounded-2xl grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono tracking-widest text-gold-400 uppercase">{t.sessions}</p>
                  <p className="text-3xl font-mono font-bold text-white">500+</p>
                  <p className="text-[9px] text-white/65 font-sans leading-normal">Editorial & weddings</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-mono tracking-widest text-gold-400 uppercase">{t.yearsExp}</p>
                  <p className="text-3xl font-mono font-bold text-white">15+</p>
                  <p className="text-[9px] text-white/65 font-sans leading-normal">Leica & Hasselblad systems</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-mono tracking-widest text-gold-400 uppercase">{t.satisfied}</p>
                  <p className="text-3xl font-mono font-bold text-white">98%</p>
                  <p className="text-[9px] text-white/65 font-sans leading-normal">Verified 5-Star Reviews</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-mono tracking-widest text-gold-400 uppercase">{t.awardCount}</p>
                  <p className="text-3xl font-mono font-bold text-white">50+</p>
                  <p className="text-[9px] text-white/65 font-sans leading-normal">Global Fine Art Prizes</p>
                </div>
              </section>

              {/* Portfolio teaser block */}
              <section className="space-y-6 text-left">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-gold-400 tracking-widest uppercase block">Fine Art Showcases</span>
                    <h2 className="font-serif text-3xl text-white tracking-wide mt-1">Symmetrical Curation</h2>
                  </div>
                  <button 
                    onClick={() => setCurrentView('portfolio')}
                    className="text-xs font-mono text-gold-400 hover:text-gold-300 flex items-center space-x-1 transition-colors"
                  >
                    <span>View Full Portfolio</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {photographs.slice(0, 3).map(photo => (
                    <div 
                      key={photo.id}
                      onClick={() => setSelectedPhotoForLightbox(photo)}
                      className="group relative rounded-xl overflow-hidden aspect-[3/4] cursor-pointer border border-white/5"
                    >
                      {/* Premium internal mounting frame */}
                      <div className="absolute inset-0 border-[0.5px] border-white/20 z-20 pointer-events-none rounded-xl" />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity" />
                      <img 
                        src={photo.url} 
                        alt={photo.title} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 ease-in-out scale-102 group-hover:scale-105"
                      />
                      
                      {/* Photo overlay description */}
                      <div className="absolute inset-x-0 bottom-0 p-5 z-20 text-left space-y-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                        <span className="text-[9px] font-mono text-gold-400 uppercase tracking-widest">{photo.category}</span>
                        <h4 className="font-serif text-lg text-white font-medium">{photo.title}</h4>
                        <p className="text-[10px] text-white/80 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          {photo.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ======================================================= */}
          {/* ABOUT SCREEN */}
          {/* ======================================================= */}
          {currentView === 'about' && (
            <div className="space-y-24 text-left">
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Artist Bio image (Cols 5) */}
                <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/5] border border-white/5">
                  <img
                    src={profile.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=85&w=800"}
                    alt={profile.name || "Photographer Portrait"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-dark-gray/90 border border-white/10 px-3 py-1.5 rounded text-[9px] font-mono text-gold-400">
                    {profile.title || "AUREA STUDIO HEAD PHOTOGRAPHER"}
                  </div>
                </div>

                {/* Biography (Cols 7) */}
                <div className="lg:col-span-7 space-y-6">
                  <span className="text-[10px] font-mono text-gold-400 tracking-widest uppercase block">BIOGRAPHY</span>
                  <h2 className="font-serif text-3xl md:text-4xl text-white tracking-wide">
                    {lang === 'es' ? (profile.aboutTitle_es || t.aboutTitle) : lang === 'pt' ? (profile.aboutTitle_pt || t.aboutTitle) : (profile.aboutTitle_en || t.aboutTitle)}
                  </h2>
                  <p className="text-xs md:text-sm text-white/90 leading-relaxed font-sans">
                    {lang === 'es' ? (profile.aboutText1_es || t.aboutText1) : lang === 'pt' ? (profile.aboutText1_pt || t.aboutText1) : (profile.aboutText1_en || t.aboutText1)}
                  </p>
                  <p className="text-xs md:text-sm text-white/90 leading-relaxed font-sans">
                    {lang === 'es' ? (profile.aboutText2_es || t.aboutText2) : lang === 'pt' ? (profile.aboutText2_pt || t.aboutText2) : (profile.aboutText2_en || t.aboutText2)}
                  </p>
                </div>
              </section>

              {/* Award List Dynamic Timeline */}
              <section className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono text-gold-400 tracking-widest uppercase block">ACHIEVEMENTS</span>
                  <h2 className="font-serif text-2xl text-white mt-1">Selected Fine-Art Prizes</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-dark-gray border border-white/5 p-5 rounded-xl text-left space-y-2">
                    <span className="font-mono text-xs text-gold-400 font-bold">2026</span>
                    <h4 className="text-xs font-semibold text-white">Awwwards Portfolio Site of the Year Nomination</h4>
                    <p className="text-[10px] text-white/70 font-sans leading-normal">Celebrated for interactive medium format gallery UX.</p>
                  </div>
                  <div className="bg-dark-gray border border-white/5 p-5 rounded-xl text-left space-y-2">
                    <span className="font-mono text-xs text-gold-400 font-bold">2024</span>
                    <h4 className="text-xs font-semibold text-white">Hasselblad Master Award (Editorial & Fashion)</h4>
                    <p className="text-[10px] text-white/70 font-sans leading-normal">Voted best macro commercial product campaigns.</p>
                  </div>
                  <div className="bg-dark-gray border border-white/5 p-5 rounded-xl text-left space-y-2">
                    <span className="font-mono text-xs text-gold-400 font-bold">2022</span>
                    <h4 className="text-xs font-semibold text-white">Leica Oskar Barnack Newcomer Prize</h4>
                    <p className="text-[10px] text-white/70 font-sans leading-normal">Documentary series on rural Italian coastal mists.</p>
                  </div>
                  <div className="bg-dark-gray border border-white/5 p-5 rounded-xl text-left space-y-2">
                    <span className="font-mono text-xs text-gold-400 font-bold">2019</span>
                    <h4 className="text-xs font-semibold text-white">Siena International Photo Awards</h4>
                    <p className="text-[10px] text-white/70 font-sans leading-normal">First place under destination wedding candid categories.</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ======================================================= */}
          {/* PORTFOLIO SCREEN */}
          {/* ======================================================= */}
          {currentView === 'portfolio' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-white/5 pb-6 gap-4 text-left">
                <div>
                  <h2 className="font-serif text-3xl text-gold-50 tracking-wide">Archival Portfolio</h2>
                  <p className="text-xs text-white/50">Filtered by commission categories. Click any master frame for EXIF diagnostics.</p>
                </div>

                {/* Filter & Search actions bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Dynamic text-search query field */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="bg-dark-gray border border-white/10 rounded-lg px-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold-400 font-mono w-full sm:w-64"
                  />
                </div>
              </div>

              {/* Responsive Category Filters scrollable trail */}
              <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
                {filterCategories.map(cat => {
                  const isActive = activeFilter === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setActiveFilter(cat.value);
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                      }}
                      className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gold-500 border-gold-500 text-dark font-bold'
                          : 'bg-dark-gray border-white/5 text-white/50 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Pinterest Premium Masonry style layout */}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {filteredPhotographs.length > 0 ? (
                  filteredPhotographs.map(photo => {
                    const isFav = favorites.includes(photo.id);
                    return (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedPhotoForLightbox(photo)}
                        className="break-inside-avoid relative rounded-2xl overflow-hidden cursor-pointer border border-white/5 group bg-charcoal/20"
                      >
                        {/* Premium internal mounting frame */}
                        <div className="absolute inset-0 border-[0.5px] border-white/20 z-20 pointer-events-none rounded-2xl" />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity z-10" />
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-auto object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-1000 ease-in-out scale-101 group-hover:scale-103"
                        />

                        {/* Top quick metrics floating indicators */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-dark/85 border border-white/10 px-1.5 py-0.5 text-[8px] font-mono text-gold-400 rounded uppercase tracking-wider">
                            {photo.category}
                          </span>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(photo.id);
                            }}
                            className={`p-1.5 rounded-full border ${
                              isFav ? 'bg-gold-500 border-gold-500 text-dark' : 'bg-dark/80 border-white/10 text-white'
                            }`}
                          >
                            <Heart size={10} className={isFav ? 'fill-dark' : ''} />
                          </button>
                        </div>

                        {/* Bottom Metadata details */}
                        <div className="absolute inset-x-0 bottom-0 p-5 z-20 text-left space-y-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          <h4 className="font-serif text-base text-gold-50 font-medium">{photo.title}</h4>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-24 text-center max-w-sm mx-auto space-y-3 col-span-3">
                    <p className="text-white/40 text-xs">No photographs matches your query.</p>
                    <button
                      onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                      className="px-4 py-2 border border-white/10 rounded font-mono text-[9px] tracking-widest uppercase text-white hover:border-gold-400"
                    >
                      Reset Filter
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* SERVICES SCREEN — PHOTOGRAPHY PACKAGES */}
          {/* ======================================================= */}
          {currentView === 'services' && (
            <div className="space-y-24">
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                className="space-y-4 text-center max-w-2xl mx-auto"
              >
                <span className="text-[10px] font-mono text-gold-400 tracking-widest uppercase block">PACKAGES</span>
                <h2 className="font-serif text-3xl md:text-4xl text-white tracking-wide">{t.servicesTitle}</h2>
                <p className="text-xs text-white/55 leading-relaxed">{t.servicesSubtitle}</p>
              </motion.section>

              {/* Photography Package Cards */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.filter(p => p.active).sort((a, b) => a.sortOrder - b.sortOrder).map((pkg, idx) => {
                  const pName = lang === 'es' ? pkg.name_es : lang === 'pt' ? pkg.name_pt : pkg.name_en;
                  const pDesc = lang === 'es' ? pkg.description_es : lang === 'pt' ? pkg.description_pt : pkg.description_en;
                  const pDuration = lang === 'es' ? pkg.duration_es : lang === 'pt' ? pkg.duration_pt : pkg.duration_en;
                  const pPriceFrom = lang === 'es' ? pkg.priceFromText_es : lang === 'pt' ? pkg.priceFromText_pt : pkg.priceFromText_en;
                  const pButton = lang === 'es' ? pkg.buttonText_es : lang === 'pt' ? pkg.buttonText_pt : pkg.buttonText_en;

                  const iconMap: Record<string, React.ReactNode> = {
                    Heart: <Heart size={28} className="text-gold-400" />,
                    Camera: <Camera size={28} className="text-gold-400" />,
                    Users: <Users size={28} className="text-gold-400" />,
                    Calendar: <Calendar size={28} className="text-gold-400" />,
                    PartyPopper: <PartyPopper size={28} className="text-gold-400" />,
                    ShoppingBag: <ShoppingBag size={28} className="text-gold-400" />,
                    Star: <Star size={28} className="text-gold-400" />,
                    Baby: <Baby size={28} className="text-gold-400" />,
                    GraduationCap: <GraduationCap size={28} className="text-gold-400" />,
                    Gift: <Gift size={28} className="text-gold-400" />,
                    Briefcase: <Briefcase size={28} className="text-gold-400" />,
                  };

                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: idx * 0.08 }}
                      className={`group bg-dark-gray border border-white/5 rounded-2xl p-6 md:p-7 flex flex-col justify-between space-y-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-dark/80 hover:border-gold-500/40 ${pkg.featured ? 'ring-1 ring-gold-500/30' : ''}`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                            {iconMap[pkg.icon] || <Camera size={28} className="text-gold-400" />}
                          </div>
                          {pkg.featured && (
                            <span className="text-[8px] font-mono text-gold-400 border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Featured</span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="font-serif text-xl text-white font-medium">{pName}</h3>
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] font-mono text-white/45">{pDuration}</span>
                            <div className="text-right font-mono">
                              <span className="text-[8px] text-white/35 block">{pPriceFrom}</span>
                              <span className="text-xl font-bold text-gold-400">${pkg.price.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-white/60 leading-relaxed font-sans">{pDesc}</p>

                        <div className="space-y-2.5">
                          <h5 className="text-[9px] font-mono tracking-widest text-white/40 uppercase font-bold">{t.includesLabel}:</h5>
                          <ul className="space-y-2">
                            {pkg.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-start space-x-2.5 text-xs text-white/70">
                                <CheckCircle2 size={12} className="text-gold-400 mt-0.5 shrink-0" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedPackageId(pkg.id);
                          const targetCalendar = document.getElementById('booking-calendar');
                          if (targetCalendar) {
                            targetCalendar.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="w-full py-3 bg-white hover:bg-gold-400 text-dark font-mono text-[10px] tracking-widest uppercase font-bold rounded-lg transition-all duration-300 flex items-center justify-center space-x-1.5 cursor-pointer group/btn"
                      >
                        <span>{pButton}</span>
                        <ArrowRight size={10} className="transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </section>

              {/* Inline interactive Booking Calendar module */}
              <section id="booking-calendar" className="pt-12 border-t border-white/5 space-y-8">
                <div className="text-center max-w-md mx-auto space-y-2">
                  <h3 className="font-serif text-2xl text-white font-medium">{t.bookingTitle}</h3>
                  <p className="text-xs text-white/50">{t.bookingSubtitle}</p>
                </div>

                <BookingCalendar
                  services={services}
                  lang={lang}
                  config={bookingConfig}
                  emailConfig={emailConfig}
                  preSelectedPackage={selectedPackageId ? packages.find(p => p.id === selectedPackageId) ?? null : null}
                  onAddBooking={(newBook) => {
                    setSelectedPackageId(null);
                    const savedBook: Booking = {
                      id: `book-${Date.now()}`,
                      status: 'pending',
                      createdAt: new Date().toISOString(),
                      ...newBook
                    };
                    handleUpdateBookings([savedBook, ...bookings]);
                  }}
                />
              </section>
            </div>
          )}

          {/* ======================================================= */}
          {/* CLIENT PORTAL SCREEN */}
          {/* ======================================================= */}
          {currentView === 'client-portal' && (
            <div className="w-full">
              <ClientPortal
                lang={lang}
                onOpenCheckout={handleOpenStripeCheckout}
                clientAccounts={clientAccounts}
                onUpdateClientAccounts={handleUpdateClientAccounts}
              />
            </div>
          )}

          {/* ======================================================= */}
          {/* FAQ ACCORDION SCREEN */}
          {/* ======================================================= */}
          {currentView === 'faq' && (
            <div className="space-y-12 max-w-3xl mx-auto text-left">
              <section className="space-y-3 border-b border-white/5 pb-6">
                <span className="text-[10px] font-mono text-gold-400 tracking-widest uppercase block">QUESTIONS</span>
                <h2 className="font-serif text-3xl text-white tracking-wide">{t.faqTitle}</h2>
                <p className="text-xs text-white/55">{t.faqSubtitle}</p>
              </section>

              {/* Accordion list */}
              <section className="space-y-3">
                {faqs.map(faq => {
                  const isOpen = activeFaqId === faq.id;
                  const fQuestion = lang === 'es' ? (faq.question_es || faq.question) : lang === 'pt' ? (faq.question_pt || faq.question) : (faq.question_en || faq.question);
                  const fAnswer = lang === 'es' ? (faq.answer_es || faq.answer) : lang === 'pt' ? (faq.answer_pt || faq.answer) : (faq.answer_en || faq.answer);

                  return (
                    <div 
                      key={faq.id} 
                      className="bg-dark-gray border border-white/5 rounded-xl overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setActiveFaqId(isOpen ? null : faq.id)}
                        className="w-full p-5 text-left flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <span className="text-xs md:text-sm font-semibold text-white/90">{fQuestion}</span>
                        <ChevronDown 
                          size={16} 
                          className={`text-gold-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-5 pt-0 text-xs text-white/60 leading-relaxed font-sans border-t border-white/5 bg-dark/20">
                              {fAnswer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </section>
            </div>
          )}

          {/* ======================================================= */}
          {/* CONTACT SCREEN */}
          {/* ======================================================= */}
          {currentView === 'contact' && (
            <div className="space-y-12">
              <section className="text-center max-w-md mx-auto space-y-3">
                <span className="text-[10px] font-mono text-gold-400 tracking-widest uppercase block">GET IN TOUCH</span>
                <h2 className="font-serif text-3xl text-white tracking-wide">{t.contactTitle}</h2>
                <p className="text-xs text-white/55">{t.contactSubtitle}</p>
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-4xl mx-auto">
                {/* Contact form (Cols 7) */}
                <div className="lg:col-span-7 bg-dark-gray border border-white/5 rounded-2xl p-6 md:p-8">
                  <AnimatePresence mode="wait">
                    {!contactSuccess ? (
                      <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t.clientName}</label>
                            <input
                              type="text"
                              required
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              className="w-full bg-dark/60 border border-white/15 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400 font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t.clientEmail}</label>
                            <input
                              type="email"
                              required
                              value={contactEmail}
                              onChange={(e) => setContactEmail(e.target.value)}
                              className="w-full bg-dark/60 border border-white/15 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400 font-sans"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Subject</label>
                          <input
                            type="text"
                            required
                            value={contactSubject}
                            onChange={(e) => setContactSubject(e.target.value)}
                            className="w-full bg-dark/60 border border-white/15 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400 font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Message</label>
                          <textarea
                            rows={4}
                            required
                            value={contactMsg}
                            onChange={(e) => setContactMsg(e.target.value)}
                            className="w-full bg-dark/60 border border-white/15 rounded p-3 text-xs text-white focus:outline-none focus:border-gold-400 font-sans resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-white hover:bg-gold-400 text-dark font-mono text-[10px] tracking-widest uppercase font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-xl"
                        >
                          <MessageSquare size={13} />
                          <span>{t.sendMessage}</span>
                        </button>
                      </form>
                    ) : (
                      <motion.div
                        className="py-12 text-center space-y-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="inline-flex p-3 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 mx-auto">
                          <ShieldCheck size={36} />
                        </div>
                        <h4 className="font-serif text-lg text-white font-semibold">Message Dispatched</h4>
                        <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
                          Your creative request has been filed directly to Helena Jenkins (Studio Manager). We will reply to your registered email in under 24 business hours.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Contact Coordinates (Cols 5) */}
                <div className="lg:col-span-5 bg-dark-gray border border-white/5 rounded-2xl p-6 md:p-8 text-left flex flex-col justify-between space-y-6">
                  <div className="space-y-5">
                    <h4 className="text-xs font-mono tracking-widest text-gold-400 uppercase font-semibold">Studio Coordinates</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 text-xs">
                        <MapPin size={14} className="text-gold-400 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white/90">Main Studio Office</span>
                          <span className="text-white/50 block">Via della Moscova 24, Milan, Italy</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 text-xs">
                        <Mail size={14} className="text-gold-400 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white/90">E-mail Inquiries</span>
                          <span className="text-white/50 block hover:text-gold-300 transition-colors cursor-pointer">studio@aureastudio.com</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 text-xs">
                        <Phone size={14} className="text-gold-400 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white/90">Studio Telephone</span>
                          <span className="text-white/50 block">+39 02 1234 5678</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-dark/40 border border-white/5 rounded-xl p-4 space-y-2">
                    <span className="text-[9px] font-mono text-white/40 uppercase">LIVE CALENDAR ASSISTANCE</span>
                    <p className="text-[11px] text-white/70 leading-normal">
                      For immediate booking validations or priority destination weddings, coordinate directly with our support desk via our linked WhatsApp.
                    </p>
                    <a
                      href="https://wa.me/390212345678"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-1 text-[10px] font-mono text-gold-400 hover:text-gold-300 uppercase tracking-widest"
                    >
                      Open WhatsApp Chat &rarr;
                    </a>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ======================================================= */}
          {/* ADMINISTRATIVE SUITE (CMS BACKOFFICE) */}
          {/* ======================================================= */}
          {currentView === 'admin' && isAdminLoggedIn && (
            <AdminCMS
              photographs={photographs}
              services={services}
              testimonials={testimonials}
              blogPosts={blogPosts}
              faqs={faqs}
              bookings={bookings}
              messages={messages}
              clientAccounts={clientAccounts}
              seo={seo}
              profile={profile}
              bookingConfig={bookingConfig}
              emailConfig={emailConfig}
              stats={seoAnalytics}
              lang={lang}
              onUpdatePhotographs={handleUpdatePhotographs}
              onUpdateServices={handleUpdateServices}
              onUpdateTestimonials={handleUpdateTestimonials}
              onUpdateBlogPosts={handleUpdateBlogPosts}
              onUpdateFaqs={handleUpdateFaqs}
              onUpdateBookings={handleUpdateBookings}
              onUpdateMessages={handleUpdateMessages}
              onUpdateClientAccounts={handleUpdateClientAccounts}
              onUpdateSeo={handleUpdateSeo}
              onUpdateProfile={handleUpdateProfile}
              onUpdateBookingConfig={handleUpdateBookingConfig}
              onUpdateEmailConfig={handleUpdateEmailConfig}
              packages={packages}
              onUpdatePackages={handleUpdatePackages}
              onLogout={handleAdminLogout}
            />
          )}

          {/* ======================================================= */}
          {/* LEGAL VIEWS: PRIVACY POLICY & TERMS OF SERVICE */}
          {/* ======================================================= */}
          {(currentView === 'privacy' || currentView === 'terms') && (
            <LegalViews
              type={currentView}
              lang={lang}
              onBack={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </motion.main>
      </AnimatePresence>

      {/* FOOTER */}
      <Footer
        onSetView={setCurrentView}
        lang={lang}
      />

      {/* ======================================================= */}
      {/* DETAILED DIALOG MODALS OVERLAYS */}
      {/* ======================================================= */}

      {/* Premium Lightbox Overlay */}
      {selectedPhotoForLightbox && (
        <Lightbox
          photo={selectedPhotoForLightbox}
          onClose={() => setSelectedPhotoForLightbox(null)}
          onNext={handleLightboxNext}
          onPrev={handleLightboxPrev}
          isFavorite={favorites.includes(selectedPhotoForLightbox.id)}
          onToggleFavorite={() => handleToggleFavorite(selectedPhotoForLightbox.id)}
          lang={lang}
        />
      )}

      {/* Secure Admin CMS Access login Dialog */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/90 backdrop-blur-sm">
            <motion.div
              className="bg-charcoal border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-6 shadow-2xl relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <button 
                onClick={() => setShowAdminLogin(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X size={16} />
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gold-400/10 border border-gold-400/30 rounded-full flex items-center justify-center mx-auto text-gold-400">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="font-serif text-xl text-white font-semibold">CMS Authenticator</h4>
                <p className="text-[10px] font-mono text-white/45 uppercase tracking-widest">AUREA SECURITY GATE</p>
              </div>

              <form onSubmit={handleAdminAuthSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-white/50 uppercase">Username</label>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full bg-dark/60 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                    placeholder="Username"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-white/50 uppercase">Security Passcode</label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-dark/60 border border-white/10 rounded p-2.5 pr-10 text-xs text-white focus:outline-none focus:border-gold-400 font-sans"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1"
                      title={showAdminPassword ? 'Hide Passcode' : 'Show Passcode'}
                    >
                      {showAdminPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {adminLoginError && (
                  <p className="text-[9px] font-mono text-red-400 uppercase tracking-widest font-semibold flex items-center space-x-1">
                    <AlertCircle size={10} />
                    <span>{adminLoginError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gold-500 hover:bg-gold-400 text-dark font-mono text-[10px] tracking-widest uppercase font-bold rounded-lg transition-all"
                >
                  Verify Credentials
                </button>
              </form>

              <div className="text-center">
                <span className="text-[9px] font-mono text-white/35">
                  Contact the studio administrator for credentials.
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secure Stripe Checkout Popup overlay */}
      <StripeCheckout
        isOpen={checkoutOpen}
        amount={checkoutAmount}
        description={checkoutDesc}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => {
          // Success triggered
        }}
      />
    </div>
  );
}


