/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, ArrowRight, MessageSquare, MapPin, 
  Mail, Phone, ShieldCheck, Sparkles, AlertCircle, ChevronDown,
  Eye, EyeOff
} from 'lucide-react';

import { 
  INITIAL_PHOTOGRAPHS, INITIAL_SERVICES, INITIAL_TESTIMONIALS, 
  INITIAL_BLOG_POSTS, INITIAL_FAQS, INITIAL_BOOKINGS, 
  INITIAL_MESSAGES, INITIAL_SEO, INITIAL_ANALYTICS, TRANSLATIONS,
  INITIAL_PROFILE, INITIAL_BOOKING_CONFIG, INITIAL_EMAIL_CONFIG,
  INITIAL_CLIENT_ACCOUNTS
} from './data/mockData';
import { Photograph, Service, Testimonial, BlogPost, FAQ, Booking, Message, SEOMetadata, PhotographerProfile, BookingConfig, EmailConfig, ClientAccount, AnalyticsStats } from './types';

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
  deleteDocument 
} from './lib/firebase';
import { sanitizeString, sanitizeEmail } from './lib/sanitize';

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
    return saved ? JSON.parse(saved) : [];
  });
  
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('aurea_services');
    return saved ? JSON.parse(saved) : [];
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('aurea_testimonials');
    return saved ? JSON.parse(saved) : [];
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('aurea_blog');
    return saved ? JSON.parse(saved) : [];
  });

  const [faqs, setFaqs] = useState<FAQ[]>(() => {
    const saved = localStorage.getItem('aurea_faqs');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('aurea_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('aurea_messages');
    return saved ? JSON.parse(saved) : [];
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

  const [clientAccounts, setClientAccounts] = useState<ClientAccount[]>(() => {
    const saved = localStorage.getItem('aurea_client_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  // UI Interactive States
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedPhotoForLightbox, setSelectedPhotoForLightbox] = useState<Photograph | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('aurea_favorites');
    return saved ? JSON.parse(saved) : [];
  });

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
  const [dbStatusMsg, setDbStatusMsg] = useState<string>('CONECTANDO...');

  useEffect(() => {
    async function initFirestoreData() {
      try {
        setDbStatusMsg('SINCRONIZANDO...');
        const fetchedPhotos = await getCollectionWithFallback<Photograph>('photographs', INITIAL_PHOTOGRAPHS);
        const fetchedServices = await getCollectionWithFallback<Service>('services', INITIAL_SERVICES);
        const fetchedTestimonials = await getCollectionWithFallback<Testimonial>('testimonials', INITIAL_TESTIMONIALS);
        const fetchedBlogPosts = await getCollectionWithFallback<BlogPost>('blogPosts', INITIAL_BLOG_POSTS);
        const fetchedFaqs = await getCollectionWithFallback<FAQ>('faqs', INITIAL_FAQS);
        const fetchedBookings = await getCollectionWithFallback<Booking>('bookings', INITIAL_BOOKINGS);
        const fetchedMessages = await getCollectionWithFallback<Message>('messages', INITIAL_MESSAGES);
        const fetchedClientAccounts = await getCollectionWithFallback<ClientAccount>('clientAccounts', INITIAL_CLIENT_ACCOUNTS);
        
        let fetchedSeo = await getSingleDocument<SEOMetadata>('seo', 'config');
        if (!fetchedSeo) {
          fetchedSeo = INITIAL_SEO;
          await saveDocument('seo', 'config', INITIAL_SEO);
        }

        let fetchedProfile = await getSingleDocument<PhotographerProfile>('profile', 'photographer');
        if (!fetchedProfile) {
          fetchedProfile = INITIAL_PROFILE;
          await saveDocument('profile', 'photographer', INITIAL_PROFILE);
        }

        let fetchedBookingConfig = await getSingleDocument<BookingConfig>('bookingConfig', 'config');
        if (!fetchedBookingConfig) {
          fetchedBookingConfig = INITIAL_BOOKING_CONFIG;
          await saveDocument('bookingConfig', 'config', INITIAL_BOOKING_CONFIG);
        }

        let fetchedEmailConfig = await getSingleDocument<EmailConfig>('emailConfig', 'config');
        if (!fetchedEmailConfig) {
          fetchedEmailConfig = INITIAL_EMAIL_CONFIG;
          await saveDocument('emailConfig', 'config', INITIAL_EMAIL_CONFIG);
        } else {
          fetchedEmailConfig = {
            ...INITIAL_EMAIL_CONFIG,
            ...fetchedEmailConfig
          };
        }

        setPhotographs(fetchedPhotos);
        setServices(fetchedServices);
        setTestimonials(fetchedTestimonials);
        setBlogPosts(fetchedBlogPosts);
        setFaqs(fetchedFaqs);
        setBookings(fetchedBookings);
        setMessages(fetchedMessages);
        setClientAccounts(fetchedClientAccounts);
        setSeo(fetchedSeo);
        setProfile(fetchedProfile);
        setBookingConfig(fetchedBookingConfig);
        setEmailConfig(fetchedEmailConfig);

        let fetchedAnalytics = await getSingleDocument<AnalyticsStats>('analytics', 'stats');
        if (!fetchedAnalytics) {
          fetchedAnalytics = INITIAL_ANALYTICS;
          await saveDocument('analytics', 'stats', INITIAL_ANALYTICS);
        }
        setSeoAnalytics(fetchedAnalytics);

        const adminDoc = await getSingleDocument<{ username: string }>('admin', 'config');
        if (!adminDoc) {
          await saveDocument('admin', 'config', { username: 'admin', password: 'admin123' });
          console.log('Admin document created with default credentials (admin/admin123). Change the password in Firestore.');
        }

        setDbStatusMsg('CONECTADO');
        localStorage.setItem('aurea_client_accounts', JSON.stringify(fetchedClientAccounts));
      } catch (err) {
        console.error('Error fetching database:', err);
        setDbStatusMsg('ERROR DE CONEXIÓN');
      }
    }
    initFirestoreData();
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
    localStorage.setItem('aurea_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Update Dynamic Document Meta tags according to active SEO settings
  useEffect(() => {
    document.title = seo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', seo.description);
    }
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

    try {
      const adminDoc = await getSingleDocument<{ username: string; password: string }>('admin', 'config');
      if (adminDoc && sanitizeString(adminUsername).toLowerCase() === adminDoc.username.toLowerCase() && adminPassword === adminDoc.password) {
        setIsAdminLoggedIn(true);
        localStorage.setItem('aurea_admin_logged', 'true');
        setAdminLoginError('');
        setShowAdminLogin(false);
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setAdminLoginError(adminDoc ? 'CREDENTIAL DECLINED. ACCESS PROTECTED.' : 'ADMIN ACCOUNT NOT FOUND. RUN THE SEED SCRIPT.');
      }
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
              {/* Fullscreen Cinematic Hero Banner */}
              <section className="relative min-h-[85vh] rounded-3xl overflow-hidden border border-white/5 flex flex-col justify-between p-8 md:p-12 lg:p-16">
                
                {/* Hero underlay photography backdrop with parallax simulation */}
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/45 to-transparent z-10" />
                  <img
                    src={seo.ogImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=90&w=1600"}
                    alt="Hero Fine Art"
                    className={`w-full h-full object-cover filter brightness-[0.7] animate-pulse [animation-duration:12s] transition-all duration-500 ${getHeroPositionClass(seo.heroPosition)} ${getHeroScaleClass(seo.heroScale)}`}
                  />
                </div>



                {/* Main center header content */}
                <div className="z-10 text-center max-w-4xl mx-auto space-y-8 my-auto pt-20">
                  <span className="text-[11px] font-mono tracking-[0.4em] text-gold-500 uppercase font-semibold block animate-pulse">
                    MUSEUM-GRADE FINE ART PHOTOGRAPHY
                  </span>
                  <h1 className="font-serif text-5xl md:text-6xl lg:text-8xl italic font-normal tracking-normal text-white leading-[1.1] mix-blend-difference">
                    {t.heroTitle}
                  </h1>
                  <p className="text-[10px] md:text-xs text-white/85 max-w-xl mx-auto leading-relaxed uppercase tracking-[0.2em] font-light">
                    {t.heroSubtitle}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                    <button
                      onClick={() => setCurrentView('portfolio')}
                      className="px-8 py-4 bg-white text-dark hover:bg-gold-500 hover:text-white font-mono text-[11px] tracking-widest uppercase font-bold transition-all duration-300 rounded-none flex items-center space-x-1.5 shadow-2xl cursor-pointer"
                    >
                      <span>{t.ctaPortfolio}</span>
                      <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('services');
                        setTimeout(() => {
                          const element = document.getElementById('booking-calendar');
                          if (element) element.scrollIntoView({ behavior: 'smooth' });
                        }, 200);
                      }}
                      className="px-8 py-4 border border-white/30 hover:border-gold-500 text-white font-mono text-[11px] tracking-widest uppercase font-bold transition-all duration-300 rounded-none cursor-pointer hover:text-gold-300 bg-transparent"
                    >
                      {t.ctaBook}
                    </button>
                  </div>
                </div>


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
          {/* SERVICES SCREEN */}
          {/* ======================================================= */}
          {currentView === 'services' && (
            <div className="space-y-24">
              <section className="space-y-4 text-center max-w-2xl mx-auto">
                <span className="text-[10px] font-mono text-gold-400 tracking-widest uppercase block">COMMISSIONED WORK</span>
                <h2 className="font-serif text-3xl md:text-4xl text-white tracking-wide">{t.servicesTitle}</h2>
                <p className="text-xs text-white/55 leading-relaxed">{t.servicesSubtitle}</p>
              </section>

              {/* Commissioned Rate cards */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {services.map(service => {
                  const sTitle = lang === 'es' ? (service.title_es || service.title) : lang === 'pt' ? (service.title_pt || service.title) : (service.title_en || service.title);
                  const sDuration = lang === 'es' ? (service.duration_es || service.duration) : lang === 'pt' ? (service.duration_pt || service.duration) : (service.duration_en || service.duration);
                  const sDesc = lang === 'es' ? (service.description_es || service.description) : lang === 'pt' ? (service.description_pt || service.description) : (service.description_en || service.description);
                  const sIncludes = lang === 'es' ? (service.includes_es || service.includes) : lang === 'pt' ? (service.includes_pt || service.includes) : (service.includes_en || service.includes);

                  return (
                    <div key={service.id} className="bg-dark-gray border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6 text-left hover:border-white/10 transition-all">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start border-b border-white/5 pb-4">
                          <div className="space-y-1">
                            <h3 className="font-serif text-xl text-white font-medium">{sTitle}</h3>
                            <span className="text-[9px] font-mono text-gold-400 uppercase tracking-widest">{sDuration}</span>
                          </div>
                          <div className="text-right flex flex-col font-mono">
                            <span className="text-[8px] text-white/35 uppercase">{t.priceFrom}</span>
                            <span className="text-2xl font-bold text-gold-400">${service.price}</span>
                          </div>
                        </div>

                        <p className="text-xs text-white/60 leading-relaxed font-sans">{sDesc}</p>

                        <div className="space-y-2.5">
                          <h5 className="text-[9px] font-mono tracking-widest text-white/40 uppercase font-bold">{t.includesLabel}:</h5>
                          <ul className="space-y-2 text-xs">
                            {sIncludes.map((incl, idx) => (
                              <li key={idx} className="flex items-start space-x-2 text-white/70">
                                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5 shrink-0" />
                                <span>{incl}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                    <button
                      onClick={() => {
                        const targetCalendar = document.getElementById('booking-calendar');
                        if (targetCalendar) {
                          targetCalendar.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full py-3 bg-white hover:bg-gold-400 text-dark font-mono text-[10px] tracking-widest uppercase font-bold rounded transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <span>{t.bookNow}</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>
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
                  onAddBooking={(newBook) => {
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

function X({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}
