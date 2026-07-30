/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { 
    Heart, ArrowRight, MessageSquare, MapPin, 
    Mail, Phone, ShieldCheck, Sparkles, AlertCircle, ChevronDown,
     Eye, EyeOff, X, Camera, Users, Calendar, Clock, PartyPopper,
      CheckCircle2, ShoppingBag, Star, Baby, GraduationCap, Briefcase,
     Gem, Utensils, Package, Award
} from 'lucide-react';
import { Instagram } from './components/BrandIcons';

import { 
  INITIAL_PHOTOGRAPHS, INITIAL_SERVICES, INITIAL_TESTIMONIALS, 
  INITIAL_BLOG_POSTS, INITIAL_FAQS, INITIAL_BOOKINGS, 
  INITIAL_MESSAGES, INITIAL_SEO, TRANSLATIONS,
  INITIAL_PROFILE, INITIAL_BOOKING_CONFIG, INITIAL_EMAIL_CONFIG,
   INITIAL_CLIENT_ACCOUNTS, INITIAL_PHOTOGRAPHY_PACKAGES, INITIAL_SESSION_CATEGORIES, INITIAL_INVOICES
 } from './data/mockData';
import { Photograph, Service, Testimonial, BlogPost, FAQ, Booking, Message, SEOMetadata, PhotographerProfile, BookingConfig, EmailConfig, ClientAccount, AnalyticsStats, SessionCategory, PhotographyPackage, Invoice } from './types';

import StorageImage from './components/StorageImage';

import Lightbox from './components/Lightbox';
import BookingCalendar from './components/BookingCalendar';
import BookingApproval from './components/BookingApproval';
import ClientPortal from './components/ClientPortal';
import StripeCheckout from './components/StripeCheckout';
import { PaymentResult } from './components/StripeCheckout';
import AboutSection from './components/AboutSection';
import PixiesetGallery from './components/PixiesetGallery';
import TestimonialsView from './components/TestimonialsView';

import AdminCMS from './components/AdminCMS';
import Header from './components/Header';
import Footer from './components/Footer';
import LegalViews from './components/LegalViews';
import NotFound from './components/NotFound';

import {
  getCollectionWithFallback,
  getSingleDocument,
  saveDocument,
  deleteDocument,
  loginWithSupabase,
  logoutFromSupabase,
  onAuthChange
} from './lib/db';
import { sanitizeString, sanitizeEmail, sanitizeUrl, unescapeHTMLEntities } from './lib/sanitize';
import { computeAnalytics, trackPageView } from './lib/analytics';

const VALID_VIEWS = new Set([
  'home', 'about', 'portfolio', 'services', 'client-portal',
  'contact', 'admin', 'faq', 'testimonials', 'privacy', 'terms', 'blog',
]);

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

function CountUp({ end, suffix = '', duration = 2000, delay = 0 }: { end: number; suffix?: string; duration?: number; delay?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const timeout = setTimeout(() => {
      let startTime: number | null = null;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isInView, end, duration, delay]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function App() {
  // Navigation & Languíage Context
  const [currentView, setCurrentView] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('approval')) return 'booking-approval';
    const view = params.get('view');
    if (view && VALID_VIEWS.has(view)) return view;
    if (window.location.pathname !== '/' && !view) return '404';
    return 'home';
  });

  const [approvalToken] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('approval') || '';
  });

  const navigationGuardRef = useRef(false);
  const setNavigationGuard = (v: boolean) => { navigationGuardRef.current = v; };

  const navigateTo = (view: string) => {
    if (navigationGuardRef.current) {
      const msg = lang === 'es'
        ? 'Tienes información sin guardar. ¿Seguro que quieres salir?'
        : lang === 'pt'
          ? 'Você tem informações não salvas. Tem certeza que deseja sair?'
          : 'You have unsaved information. Are you sure you want to leave?';
      if (!window.confirm(msg)) return;
      navigationGuardRef.current = false;
    }
    if (view !== 'services') {
      setSelectedCategory(null);
      setSelectedPackageId(null);
    }
    setCurrentView(view);
    const url = view === 'home' ? '/' : '/?view=' + view;
    window.history.pushState({ view }, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const initialView = currentView;
    const initialUrl = initialView === 'home' ? '/' : '/?view=' + initialView;
    window.history.replaceState({ view: initialView }, '', initialUrl);

    const handlePopState = (event: PopStateEvent) => {
      const view = event.state?.view;
      if (view) {
        setCurrentView(view);
      } else {
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view');
        if (viewParam && VALID_VIEWS.has(viewParam)) {
          setCurrentView(viewParam);
        } else if (window.location.pathname !== '/' && !viewParam) {
          setCurrentView('404');
        } else {
          setCurrentView('home');
          window.history.pushState({ view: 'home' }, '', '/');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [lang, setLang] = useState<'es' | 'en'>(() => {
    const savedLanguíage = localStorage.getItem('aorea_lang');
    return savedLanguíage === 'es' || savedLanguíage === 'en' ? savedLanguíage : 'en';
  });

  const [photographs, setPhotographs] = useState<Photograph[]>(() => {
    try { const saved = localStorage.getItem('aorea_photos'); return saved ? JSON.parse(saved) : INITIAL_PHOTOGRAPHS; } catch { return INITIAL_PHOTOGRAPHS; }
  });
  
  const [services, setServices] = useState<Service[]>(() => {
    try { const saved = localStorage.getItem('aorea_services'); return saved ? JSON.parse(saved) : INITIAL_SERVICES; } catch { return INITIAL_SERVICES; }
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    try { const saved = localStorage.getItem('aorea_testimonials'); return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS; } catch { return INITIAL_TESTIMONIALS; }
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    try { const saved = localStorage.getItem('aorea_blog'); return saved ? JSON.parse(saved) : INITIAL_BLOG_POSTS; } catch { return INITIAL_BLOG_POSTS; }
  });

  const [faqs, setFaqs] = useState<FAQ[]>(() => {
    try { const saved = localStorage.getItem('aorea_faqs'); return saved ? JSON.parse(saved) : INITIAL_FAQS; } catch { return INITIAL_FAQS; }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try { const saved = localStorage.getItem('aorea_bookings'); return saved ? JSON.parse(saved) : INITIAL_BOOKINGS; } catch { return INITIAL_BOOKINGS; }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try { const saved = localStorage.getItem('aorea_messages'); return saved ? JSON.parse(saved) : INITIAL_MESSAGES; } catch { return INITIAL_MESSAGES; }
  });

  const [seo, setSeo] = useState<SEOMetadata>(() => {
    try { const saved = localStorage.getItem('aorea_seo'); return saved ? JSON.parse(saved) : INITIAL_SEO; } catch { return INITIAL_SEO; }
  });

  const [profile, setProfile] = useState<PhotographerProfile>(() => {
    try { const saved = localStorage.getItem('aorea_profile'); return saved ? JSON.parse(saved) : INITIAL_PROFILE; } catch { return INITIAL_PROFILE; }
  });

  const [bookingConfig, setBookingConfig] = useState<BookingConfig>(() => {
    try { const saved = localStorage.getItem('aorea_booking_config'); return saved ? JSON.parse(saved) : INITIAL_BOOKING_CONFIG; } catch { return INITIAL_BOOKING_CONFIG; }
  });

  const [emailConfig, setEmailConfig] = useState<EmailConfig>(() => {
    try { const saved = localStorage.getItem('aorea_email_config'); return saved ? JSON.parse(saved) : INITIAL_EMAIL_CONFIG; } catch { return INITIAL_EMAIL_CONFIG; }
  });

  const [sessionCategories, setSessionCategories] = useState<SessionCategory[]>(() => {
    try { const saved = localStorage.getItem('aorea_session_categories'); return saved ? JSON.parse(saved) : INITIAL_SESSION_CATEGORIES; } catch { return INITIAL_SESSION_CATEGORIES; }
  });

  const [packages, setPackages] = useState<PhotographyPackage[]>(() => {
    try { const saved = localStorage.getItem('aorea_packages'); return saved ? JSON.parse(saved) : INITIAL_PHOTOGRAPHY_PACKAGES; } catch { return INITIAL_PHOTOGRAPHY_PACKAGES; }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try { const saved = localStorage.getItem('aorea_invoices'); return saved ? JSON.parse(saved) : INITIAL_INVOICES; } catch { return INITIAL_INVOICES; }
  });

  const [clientAccounts, setClientAccounts] = useState<ClientAccount[]>(INITIAL_CLIENT_ACCOUNTS);

  // UI Interactive States('galeria');
  const [selectedPhotoForLightbox, setSelectedPhotoForLightbox] = useState<Photograph | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { const saved = localStorage.getItem('aorea_favorites'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);

  // Administrative Workspace credentials
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUseráname, setAdminUseráname] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  // Stripe Checkout Integrations
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [checkoutDesc, setCheckoutDesc] = useState('');

  // Contact form state
  const [contactName, setContactName] = useState(() => sessionStorage.getItem('contact_draft_name') || '');
  const [contactEmail, setContactEmail] = useState(() => sessionStorage.getItem('contact_draft_email') || '');
  const [contactSubject, setContactSubject] = useState(() => sessionStorage.getItem('contact_draft_subject') || '');
  const [contactMsg, setContactMsg] = useState(() => sessionStorage.getItem('contact_draft_msg') || '');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactHoneypot, setContactHoneypot] = useState('');

  useEffect(() => {
    sessionStorage.setItem('contact_draft_name', contactName);
    sessionStorage.setItem('contact_draft_email', contactEmail);
    sessionStorage.setItem('contact_draft_subject', contactSubject);
    sessionStorage.setItem('contact_draft_msg', contactMsg);
  }, [contactName, contactEmail, contactSubject, contactMsg]);

  // Search filter
  const [activeFilter] = useState<string>('all');
  const [approvalBooking, setApprovalBooking] = useState<Booking | null | 'loading'>('loading');

  useEffect(() => {
    if (!approvalToken) {
      setApprovalBooking(null);
      return;
    }
    let cancelled = false;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      setApprovalBooking(null);
      return;
    }
    fetch(`${supabaseUrl}/functions/v1/verify-approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: approvalToken }),
    })
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setApprovalBooking(data.booking || null);
        }
      })
      .catch(() => {
        if (!cancelled) setApprovalBooking(null);
      });
    return () => { cancelled = true; };
  }, [approvalToken]);

  const t = TRANSLATIONS[lang];

  const [seoAnalytics, setSeoAnalytics] = useState<AnalyticsStats>({
    totalVisits: 0, totalRevenue: 0, bookingConversionRate: 0, sessionsCount: 0,
    revenueByMonth: [], sessionsByService: [], visitsByDay: []
  });
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (user) {
        setIsAdminLoggedIn(true);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Remove client passcodes written by older versions of the application.
    localStorage.removeItem('aorea_client_accounts');
    // Clear old table-missing cache that blocked Supabase reads after RLS fix.
    localStorage.removeItem('aurea_missing_tables');
    // Clear stale bookings cache so initial render doesn't show stale data.
    localStorage.removeItem('aorea_bookings');
    // Clear session-level table-missing cache so Supabase queries are retried.
    sessionStorage.removeItem('aurea_missing_tables');
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function syncFirestore() {
      const [photosRes, servicesRes, testimonialsRes, blogRes, faqsRes,
        bookingsRes, messagesRes, clientAccsRes, invoicesRes] = await Promise.all([
        getCollectionWithFallback<Photograph>('photographs', INITIAL_PHOTOGRAPHS),
        getCollectionWithFallback<Service>('services', INITIAL_SERVICES),
        getCollectionWithFallback<Testimonial>('testimonials', INITIAL_TESTIMONIALS),
        getCollectionWithFallback<BlogPost>('blogPosts', INITIAL_BLOG_POSTS),
        getCollectionWithFallback<FAQ>('faqs', INITIAL_FAQS),
        getCollectionWithFallback<Booking>('bookings', INITIAL_BOOKINGS),
        getCollectionWithFallback<Message>('messages', INITIAL_MESSAGES),
         getCollectionWithFallback<ClientAccount>('clientAccounts', INITIAL_CLIENT_ACCOUNTS),
         getCollectionWithFallback<Invoice>('invoices', INITIAL_INVOICES),
      ]);

      const packagesRes = await getCollectionWithFallback<PhotographyPackage>('photography_packages', []);
      const [seoRes, profileRes, bookingConfigRes, emailConfigRes] = await Promise.all([
        getSingleDocument<SEOMetadata>('seo', 'config'),
        getSingleDocument<PhotographerProfile>('profile', 'photographer'),
        getSingleDocument<BookingConfig>('bookingConfig', 'config'),
        getSingleDocument<EmailConfig>('emailConfig', 'config'),
      ]);

      if (cancelled) return;

      // One-time migration: repair data corrupted by old sanitizeString HTML escaping
      const MIGRATE_FLAG = 'aorea_html_entities_migrated_v2';
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
         const migratedInvoices = invoicesRes.map(i => migrateStrings(i));
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
          ...(migratedInvoices as Invoice[]).map((i, index) => i !== invoicesRes[index] ? saveDocument('invoices', i.id, i) : Promise.resolve()),
           migratedSeo && migratedSeo !== seoRes ? saveDocument('seo', 'config', migratedSeo) : Promise.resolve(),
           migratedProfile && migratedProfile !== profileRes ? saveDocument('profile', 'photographer', migratedProfile) : Promise.resolve(),
           migratedEmailCfg && migratedEmailCfg !== emailConfigRes ? saveDocument('emailConfig', 'config', migratedEmailCfg) : Promise.resolve(),
         ]).then(() => {
          localStorage.setItem(MIGRATE_FLAG, 'true');
          console.log('Data migration complete: HTML entities unescaped in Firestore');
        }).catch(console.error);
        setPhotographs(migratedPhotos);
        setServices(migratedServices);
        setTestimonials(migratedTestimonials);
        setBlogPosts(migratedBlogs);
        setFaqs(migratedFaqs);
        setBookings(migratedBookings);
         setMessages(migratedMessages);
         setClientAccounts(migratedClients);
          setInvoices(migratedInvoices as Invoice[]);
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
       setInvoices(invoicesRes);
        setSeo(seoRes ?? INITIAL_SEO);
        setProfile(profileRes ?? INITIAL_PROFILE);
      }

      setPackages(packagesRes.length > 0 ? packagesRes : INITIAL_PHOTOGRAPHY_PACKAGES);
      setBookingConfig(bookingConfigRes ?? INITIAL_BOOKING_CONFIG);
      setEmailConfig(emailConfigRes ? { ...INITIAL_EMAIL_CONFIG, ...emailConfigRes } : INITIAL_EMAIL_CONFIG);
      const computedStats = await computeAnalytics();
      setSeoAnalytics(computedStats);

      if (!seoRes) saveDocument('seo', 'config', INITIAL_SEO);
      if (!profileRes) saveDocument('profile', 'photographer', INITIAL_PROFILE);
      if (!bookingConfigRes) saveDocument('bookingConfig', 'config', INITIAL_BOOKING_CONFIG);
      if (!emailConfigRes) saveDocument('emailConfig', 'config', INITIAL_EMAIL_CONFIG);
      if (packagesRes.length === 0) {
        for (const pkg of INITIAL_PHOTOGRAPHY_PACKAGES) {
          await saveDocument('photography_packages', pkg.id, pkg);
        }
      }
    }
    syncFirestore()
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setBootstrapped(true);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    trackPageView();
  }, []);

  // Custom state wrappers that write changes to both local state and sync them to Firestore
  const handleUpdatePhotographs = (newPhotos: Photograph[]) => {
    syncCollection('photographs', photographs, newPhotos);
    setPhotographs(newPhotos);
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
    setBookings(newBookings);
    syncCollection('bookings', bookings, newBookings);
  };

  const handleUpdateMessages = (newMessages: Message[]) => {
    syncCollection('messages', messages, newMessages);
    setMessages(newMessages);
  };

  const handleUpdateClientAccounts = (newAccounts: ClientAccount[]) => {
    syncCollection('clientAccounts', clientAccounts, newAccounts);
    setClientAccounts(newAccounts);
  };

  const handleUpdateInvoices = (newInvoices: Invoice[]) => {
    syncCollection('invoices', invoices, newInvoices);
    setInvoices(newInvoices);
  };

  const handleConfirmBooking = async (bookingId: string, signature?: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      console.error('[handleConfirmBooking] booking not found:', bookingId);
      return;
    }

    console.log('[handleConfirmBooking] CONFIRMING', bookingId, booking.clientName, { signature: !!signature });

    const updatedBooking: Booking = {
      ...booking,
      status: 'confirmed',
      isPaid: true,
      paymentStatus: 'paid',
      contractStatus: 'signed',
      contractSignature: signature || booking.contractSignature,
      contractSignedAt: signature ? new Date().toISOString() : booking.contractSignedAt,
    };

    handleUpdateBookings(bookings.map(b => b.id === bookingId ? updatedBooking : b));

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl && booking.approvalToken) {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/update-booking-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            token: booking.approvalToken,
            updates: {
              status: 'confirmed',
              isPaid: true,
              paymentStatus: 'paid',
              contractStatus: 'signed',
              contractSignature: signature || booking.contractSignature || '',
              contractSignedAt: signature ? new Date().toISOString() : booking.contractSignedAt || new Date().toISOString(),
            },
            sendConfirmation: true,
          }),
        });
        if (!res.ok) console.error('[handleConfirmBooking] Edge Function failed:', bookingId);
      } catch (err) {
        console.error('[handleConfirmBooking] Edge Function error:', bookingId, err);
      }
    }

    // Create invoice for this confirmed booking
    const existingInvoice = invoices.find(inv => inv.bookingId === bookingId);
    if (!existingInvoice) {
      const now = new Date();
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const seq = String(invoices.filter(inv => inv.invoiceNumber?.startsWith(`INV-${yearMonth}`)).length + 1).padStart(4, '0');
      const serviceTitle = services.find(s => s.id === booking.serviceId)?.title || booking.packageName || 'Photography Session';
      const totalAmount = Number(booking.amount) || 0;
      const depositPaid = Number(booking.depositAmount) || 0;
      const travelExpenses = Number(booking.travelExpenses) || 0;
      const total = totalAmount + travelExpenses;

      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        bookingId: booking.id,
        invoiceNumber: `INV-${yearMonth}-${seq}`,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        packageName: serviceTitle,
        items: [
          { description: `${serviceTitle} Package`, amount: totalAmount },
          ...(travelExpenses > 0 ? [{ description: 'Travel Expenses', amount: travelExpenses }] : []),
          ...(depositPaid > 0 ? [{ description: 'Booking Deposit', amount: -depositPaid }] : []),
        ],
        subtotal: total,
        depositPaid,
        total,
        amountPaid: depositPaid,
        balanceDue: Math.max(0, total - depositPaid),
        status: depositPaid >= total ? 'paid' : 'partial',
        paymentMethod: 'Stripe',
        createdAt: now.toISOString(),
        paidAt: depositPaid > 0 ? now.toISOString() : undefined,
      };
      handleInvoiceCreated(newInvoice);
    }
  };

  const handleInvoiceCreated = (invoice: Invoice) => {
    handleUpdateInvoices([invoice, ...invoices.filter(existing => existing.id !== invoice.id)]);
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

  const handleUpdateSessionCategories = async (newCategories: SessionCategory[]) => {
    setSessionCategories(newCategories);
    localStorage.setItem('aorea_session_categories', JSON.stringify(newCategories));
    await syncCollection('session_categories', sessionCategories, newCategories);
  };

  // Sync to LocalStorage whenever DB collections update (for offline-fallback cache layer)
  useEffect(() => {
    if (bootstrapped) localStorage.setItem('aorea_photos', JSON.stringify(photographs));
  }, [photographs, bootstrapped]);

  useEffect(() => {
    if (bootstrapped) localStorage.setItem('aorea_services', JSON.stringify(services));
  }, [services, bootstrapped]);

  useEffect(() => {
    if (bootstrapped) localStorage.setItem('aorea_testimonials', JSON.stringify(testimonials));
  }, [testimonials, bootstrapped]);

  useEffect(() => {
    if (bootstrapped) localStorage.setItem('aorea_blog', JSON.stringify(blogPosts));
  }, [blogPosts, bootstrapped]);

  useEffect(() => {
    if (bootstrapped) localStorage.setItem('aorea_faqs', JSON.stringify(faqs));
  }, [faqs, bootstrapped]);

  useEffect(() => {
    if (bootstrapped) localStorage.setItem('aorea_bookings', JSON.stringify(bookings));
  }, [bookings, bootstrapped]);

  useEffect(() => {
    if (bootstrapped) localStorage.setItem('aorea_invoices', JSON.stringify(invoices));
  }, [invoices, bootstrapped]);

  // SECURITY: messages contain client PII (name, email) — not cached in localStorage

  useEffect(() => {
    if (bootstrapped) localStorage.setItem('aorea_seo', JSON.stringify(seo));
  }, [seo, bootstrapped]);

  useEffect(() => {
    if (bootstrapped) localStorage.setItem('aorea_profile', JSON.stringify(profile));
  }, [profile, bootstrapped]);

  useEffect(() => {
    if (bootstrapped) localStorage.setItem('aorea_booking_config', JSON.stringify(bookingConfig));
  }, [bookingConfig, bootstrapped]);

  // SECURITY: email config contains receiver email — not cached in localStorage

  useEffect(() => {
    localStorage.setItem('aorea_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (bootstrapped) localStorage.setItem('aorea_session_categories', JSON.stringify(sessionCategories));
  }, [sessionCategories, bootstrapped]);

  useEffect(() => {
    if (bootstrapped) localStorage.setItem('aorea_packages', JSON.stringify(packages));
  }, [packages, bootstrapped]);

  useEffect(() => {
    localStorage.setItem('aorea_favorites', JSON.stringify(favorites));
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

    if (contactHoneypot) return;

    const safeName = sanitizeString(contactName);
    const safeEmail = sanitizeEmail(contactEmail);
    const safeSubject = sanitizeString(contactSubject);
    const safeMsg = sanitizeString(contactMsg);

    if (!safeName || !safeEmail || !safeMsg) return;

    setContactSubmitting(true);

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      name: safeName,
      email: safeEmail,
      subject: safeSubject || 'Direct Portfolio Query',
      message: safeMsg,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    try {
      const updated = [newMessage, ...messages];
      setMessages(updated);

      await saveDocument('messages', newMessage.id, newMessage);

      if (emailConfig) {
        const { getAuthHeaders } = await import('./lib/email');
        const sendFn = async (to: string, subject: string, text: string) => {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({
              to,
              subject,
              html: text.replace(/\n/g, '<br>'),
              text,
            }),
          });
        };

        const isEn = lang === 'en';
        const photographerName = sanitizeString(profile.name || 'Miriam Campos');
        const subject = isEn
          ? `New contact message: ${safeSubject || 'Inquiry'}`
          : `Nuevo mensaje de contacto: ${safeSubject || 'Consulta'}`;
        const photographerText = isEn
          ? `You received a new contact message:

From: ${safeName} (${safeEmail})
Subject: ${safeSubject || 'General Inquiry'}
Message:
${safeMsg}`
          : `Recibiste un nuevo mensaje de contacto:

De: ${safeName} (${safeEmail})
Asunto: ${safeSubject || 'Consulta General'}
Mensaje:
${safeMsg}`;

        await sendFn(emailConfig.receiverEmail || safeEmail, subject, photographerText);

        if (emailConfig.enableAutoResponse) {
          const autoSubject = isEn
            ? (emailConfig.autoReplySubject || 'Your message has been received! - Miriam Campos Photography')
            : (emailConfig.autoReplySubject || 'Tu mensaje ha sido recibido! - Miriam Campos Photography');
          const autoMessage = isEn
            ? (emailConfig.autoReplyMessage || 'Thank you for contacting us. We will get back to you shortly.')
            : (emailConfig.autoReplyMessage || 'Gracias por contactarte con nosotros. Responderemos a la brevedad.');
          const greeting = isEn ? 'Hi' : 'Hola';
          const closing = isEn ? 'Best regards,' : 'Saludos,';

          await sendFn(safeEmail, autoSubject, `${greeting} ${safeName},

${autoMessage}

${closing}
${photographerName}`);
        }
      }

      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMsg('');
      setTimeout(() => setContactSuccess(false), 4000);
    } catch (err) {
      console.error('Could not submit contact message:', err);
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');

    const email = sanitizeEmail(adminUseráname);
    const password = adminPassword;

    if (!email || !email.includes('@')) {
      setAdminLoginError('INTRODUCE UN CORREO ELECTRÓNICO VÁLIDO.');
      return;
    }

    // Administrative access is handled exclusively by Supabase Authentication.
    try {
      await loginWithSupabase(email, password);
      setIsAdminLoggedIn(true);
      setShowAdminLogin(false);
      navigateTo('admin');
      return;
    } catch (err: any) {
      const msg = err?.message || err?.error_description || err?.code || '';
      const errorMessages: Record<string, string> = {
        'Invalid login credentials': 'EL CORREO O LA CONTRASEÑA SON INCORRECTOS.',
        'Email not confirmed': 'EL CORREO NO EST CONFIRMADO. REVISA TU BANDEJA DE ENTRADA.',
        'Invalid email': 'EL CORREO ELECTRÓNICO NO ES VÁLIDO.',
        'User not found': 'NO EXISTE UN USUARIO CON ESE CORREO.',
        'Too many requests': 'DEMASIADOS INTENTOS. ESPERA UN MOMENTO Y VUELVE A INTENTARLO.',
        'Signup not allowed': 'EL REGISTRO NO EST HABILITADO.',
      };
      const matched = Object.keys(errorMessages).find(k => msg.includes(k));
      setAdminLoginError(matched ? errorMessages[matched] : 'NO SE PUDO INICIAR SESIÓN EN SUPABASE AUTHENTICATION.');
    } finally {
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    navigateTo('home');
    logoutFromSupabase().catch(console.error);
  };

  const handleBackToSite = () => {
    navigateTo('home');
  };

  // Trigger Stripe print or service booking Checkout overlay
  const pendingPaymentRef = useRef<((result?: PaymentResult) => void) | null>(null);
  const pendingCancelRef = useRef<(() => void) | null>(null);
  const pendingPaymentBookingRef = useRef<{ clientName: string; clientEmail: string; photographerEmail: string; amount: number; packageName: string } | null>(null);

  const handleOpenStripeCheckout = (amount: number, description: string) => {
    setCheckoutAmount(amount);
    setCheckoutDesc(description);
    setCheckoutOpen(true);
  };

  const handleCheckoutWithCallback = (amount: number, description: string, onDone: (result?: PaymentResult) => void, onCancel?: () => void) => {
    pendingPaymentRef.current = onDone;
    pendingCancelRef.current = onCancel ?? null;
    handleOpenStripeCheckout(amount, description);
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

  return (
    <div className="bg-dark text-white min-h-screen relative w-full overflow-x-hidden font-sans select-none selection:bg-white/15">
      {/* CORE HEADER */}
      <Header
        currentView={currentView}
        onSetView={navigateTo}
        lang={lang}
        onSetLang={setLang}
      />

      {/* Full-width hero outside max-w-7xl container */}
      {currentView === 'home' && (
        <section className="relative h-dvh w-full overflow-hidden">
          {/* Mobile: single image */}
          <div className="absolute inset-0 z-0 md:hidden overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: 1,
                scale: [1, 1.08, 1]
              }}
              transition={{
                opacity: { duration: 1.2, ease: 'easeOut' },
                scale: { duration: 18, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }
              }}
              className="w-full h-full"
            >
              <StorageImage
                src={seo.heroImageLeft || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=85&w=1200'}
                alt="Fine Art Photography"
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-b from-overlay/5 via-overlay/40 to-overlay/70 z-10 pointer-events-none" />
          </div>

          {/* Desktop: Left image */}
          <div className="hidden md:block absolute inset-y-0 left-0 w-1/2 z-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: 1,
                scale: [1, 1.08, 1]
              }}
              transition={{
                opacity: { duration: 1.2, ease: 'easeOut' },
                scale: { duration: 18, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }
              }}
              className="w-full h-full"
            >
              <StorageImage
                src={seo.heroImageLeft || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=85&w=1600'}
                alt="Fine Art Wedding"
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-b from-overlay/5 via-overlay/40 to-overlay/70 z-10 pointer-events-none" />
          </div>

          {/* Desktop: Right image */}
          <div className="hidden md:block absolute inset-y-0 right-0 w-1/2 z-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: 1,
                scale: [1, 1.08, 1]
              }}
              transition={{
                opacity: { duration: 1.2, ease: 'easeOut', delay: 0.2 },
                scale: { duration: 18, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }
              }}
              className="w-full h-full"
            >
              <StorageImage
                src={seo.heroImageRight || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=85&w=1600'}
                alt="Editorial Fashion"
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-b from-overlay/5 via-overlay/40 to-overlay/70 z-10 pointer-events-none" />
          </div>

          {/* Subtle divider line */}
          <div className="absolute inset-y-[15%] left-1/2 w-px bg-white/10 z-20 hidden md:block" />

          {/* Central content overlay */}
          <div className="absolute inset-0 z-20 flex flex-col justify-center pointer-events-none">
            <div className="text-center max-w-2xl mx-auto px-4 sm:px-6 pointer-events-auto">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-[clamp(1.5rem,7.5vw,4rem)] sm:text-[clamp(1.75rem,6vw,4.5rem)] md:text-[clamp(2.5rem,5vw,5rem)] lg:text-[clamp(3rem,4.5vw,5.5rem)] leading-[1.15] tracking-wide text-hero drop-shadow-sm"
              >
                {t.heroTitle.includes(',') ? (
                  <>
                    <span className="italic">{t.heroTitle.split(',')[0]},</span>
                    <br />
                    <span className="not-italic font-light">{t.heroTitle.split(',')[1].trim().split('&')[0]?.trim()}</span>
                    {t.heroTitle.includes('&') && (
                      <>
                        <br />
                        <span className="italic font-medium">&</span>{' '}
                        <span className="not-italic font-light">{t.heroTitle.split('&')[1]?.trim()}</span>
                      </>
                    )}
                  </>
                ) : (
                  <span>{t.heroTitle}</span>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="text-[clamp(10px,2.8vw,14px)] text-hero/80 max-w-lg mx-auto leading-relaxed tracking-wider font-light mt-4 md:mt-10 px-2 drop-shadow-sm"
              >
                {t.heroSubtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 mt-5 md:mt-12"
              >
                <button
                  onClick={() => navigateTo('portfolio')}
                  className="px-4 sm:px-6 md:px-7 py-2 md:py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-mono text-[clamp(7px,2vw,10px)] tracking-widest uppercase font-semibold transition-all duration-300 cursor-pointer whitespace-normal sm:whitespace-nowrap"
                >
                  {t.ctaPortfolio}
                </button>
                <button
                  onClick={() => {
                    navigateTo('services');
                    setTimeout(() => {
                      const element = document.getElementById('booking-calendar');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }, 200);
                  }}
                  className="px-4 sm:px-6 md:px-7 py-2 md:py-3 border border-white/30 text-white/80 hover:border-white font-mono text-[clamp(7px,2vw,10px)] tracking-widest uppercase font-semibold transition-all duration-300 cursor-pointer bg-transparent whitespace-normal sm:whitespace-nowrap drop-shadow-sm"
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
            className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex-col items-center space-y-2 flex md:hidden"
          >
            <span className="text-[10px] font-mono tracking-wider text-white/30 uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px h-6 sm:h-8 bg-white/10"
            />
          </motion.div>
        </section>
      )}

      <AnimatePresence mode="wait">
        <motion.main
          key={currentView}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={currentView === 'admin'
            ? "pt-[70px] lg:pt-20 pb-32 space-y-16 md:space-y-32"
            : "pt-[70px] lg:pt-20 pb-32 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-16 md:space-y-32"
          }>

          {/* ======================================================= */}
          {/* HOME SCREEN (content below hero) */}
          {/* ======================================================= */}
          {currentView === 'home' && (
            <div className="space-y-12 md:space-y-24">
              {/* Statistics — Editorial Craft Metrics */}
              <section className="relative py-12 md:py-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent pointer-events-none" />

                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-12 md:mb-16"
                  >
                    <p className="text-[11px] font-mono tracking-[0.35em] text-white/30 uppercase">
                      {t.statsTitle}
                    </p>
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mt-3" />
                  </motion.div>

                  <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
                    <div className="hidden md:block absolute top-[18%] bottom-[18%] left-1/3 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
                    <div className="hidden md:block absolute top-[18%] bottom-[18%] right-1/3 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

                    {/* 15+ Years */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                      className="text-center md:px-6 lg:px-10 group"
                    >
                      <Camera size={18} strokeWidth={1.5} className="text-white/40 mx-auto mb-4" />
                      <p className="font-serif text-3xl md:text-4xl text-white font-light leading-none group-hover:scale-[1.03] transition-transform duration-500">
                        <CountUp end={15} suffix="+" duration={2000} />
                      </p>
                      <p className="text-[10px] font-mono tracking-[0.3em] text-white/20 uppercase mt-3">
                        {t.yearsExp}
                      </p>
                      <p className="text-[10px] text-white/15 mt-1.5 leading-relaxed max-w-[160px] mx-auto">
                        {t.yearsExpSub}
                      </p>
                    </motion.div>

                    {/* 2000+ Sessions — Center hero metric, 40% larger */}
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                      className="text-center md:px-6 lg:px-10 group"
                    >
                      <Award size={20} strokeWidth={1.5} className="text-white/50 mx-auto mb-5" />
                      <p className="font-serif text-[clamp(2.5rem,8vw,5rem)] text-white font-light leading-none group-hover:scale-[1.03] transition-transform duration-500">
                        <CountUp end={2000} suffix="+" duration={2500} />
                      </p>
                      <p className="text-[11px] font-mono tracking-[0.35em] text-white/25 uppercase mt-3">
                        {t.sessions}
                      </p>
                      <p className="text-[10px] text-white/15 mt-1.5 leading-relaxed max-w-[180px] mx-auto">
                        {t.sessionsSub}
                      </p>
                    </motion.div>

                    {/* 98% Satisfied */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                      className="text-center md:px-6 lg:px-10 group"
                    >
                      <Star size={18} strokeWidth={1.5} className="text-white/40 mx-auto mb-4" />
                      <p className="font-serif text-3xl md:text-4xl text-white font-light leading-none group-hover:scale-[1.03] transition-transform duration-500">
                        <CountUp end={98} suffix="%" duration={2000} />
                      </p>
                      <p className="text-[10px] font-mono tracking-[0.3em] text-white/20 uppercase mt-3">
                        {t.satisfied}
                      </p>
                      <p className="text-[10px] text-white/15 mt-1.5 leading-relaxed max-w-[160px] mx-auto">
                        {t.satisfiedSub}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* Featured packages */}
              <section className="space-y-7 text-left">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-white/70 tracking-widest uppercase block">
                      {lang === 'es' ? 'Colecciones seleccionadas' : 'Selected collections'}
                    </span>
                    <h2 className="font-serif text-3xl text-white tracking-wide mt-1">
                      {lang === 'es' ? 'Paquetes destacados' : 'Featured packages'}
                    </h2>
                    <p className="text-xs text-white/45 mt-2 max-w-xl">
                      {lang === 'es' ? 'Experiencias diseñadas para convertir tus momentos en recuerdos que permanecen.' : 'Experiences designed to turn your moments into memories that last.'}
                    </p>
                  </div>
                  <button onClick={() => navigateTo('services')} className="text-xs font-mono text-white/70 hover:text-white/60 flex items-center gap-1 transition-colors">
                    <span>{lang === 'es' ? 'Ver todos los paquetes' : 'View all packages'}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {packages.filter(pkg => pkg.active && pkg.featured).slice(0, 3).map(pkg => (
                    <article key={pkg.id} className="group bg-dark-gray border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-all duration-500 shadow-sm">
                      {pkg.image && <div className="h-32 sm:h-36 lg:h-40 overflow-hidden"><StorageImage src={sanitizeUrl(pkg.image)} alt={lang === 'es' ? pkg.name_es : pkg.name_en} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /></div>}
                      <div className="p-4 sm:p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/70/70">{t[pkg.category as keyof typeof t] || pkg.category}</p>
                            <h3 className="font-serif text-xl text-white mt-1">{lang === 'es' ? pkg.name_es : pkg.name_en}</h3>
                          </div>
                          <span className="font-mono text-sm text-white/70 whitespace-nowrap">${pkg.price.toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">{lang === 'es' ? pkg.description_es : pkg.description_en}</p>
                        <button onClick={() => { setSelectedCategory(pkg.category); setSelectedPackageId(pkg.id); navigateTo('services'); }} className="w-full py-2.5 border border-white/15 hover:border-white/30 text-white/70 hover:text-white/60 rounded-lg font-mono text-[9px] tracking-widest uppercase transition-all">
                          {lang === 'es' ? 'Elegir paquete' : 'Choose package'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {/* Instagram Follow */}
              <section className="text-center py-8 md:py-12">
                <a
                  href="https://www.instagram.com/miriamtellezphotography/"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] rounded-xl text-white font-mono text-sm tracking-widest uppercase font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  <Instagram size={22} />
                  <span>{lang === 'es' ? 'Seguir en Instagram' : 'Follow on Instagram'}</span>
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <p className="text-[10px] text-white/40 mt-3 font-mono tracking-wider">
                  @miriamtellezphotography
                </p>
              </section>

              {/* Booking process */}
              <section className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-dark-gray to-charcoal p-6 md:p-10 text-left shadow-md">
                <div className="max-w-2xl">
                  <span className="text-[10px] font-mono text-white/70 tracking-widest uppercase">{lang === 'es' ? 'Tu experiencia' : 'Your experience'}</span>
                  <h2 className="font-serif text-3xl text-white tracking-wide mt-1">{lang === 'es' ? 'Reservar es sencillo' : 'Booking made simple'}</h2>
                  <p className="text-xs text-white/45 mt-2">{lang === 'es' ? 'Un proceso claro, seguro y acompañado de principio a fin.' : 'A clear, secure process with guidance from beginning to end.'}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-9">
                  {[
                    { number: '01', title: lang === 'es' ? 'Elige tu colección' : 'Choose your collection', text: lang === 'es' ? 'Encuentra el paquete que encaja con tu historia.' : 'Find the package that fits your story.', icon: ShoppingBag },
                    { number: '02', title: lang === 'es' ? 'Reserva tu fecha' : 'Reserve your date', text: lang === 'es' ? 'Completa tus datos y selecciona una fecha.' : 'Share your details and select a date.', icon: Calendar },
                    { number: '03', title: lang === 'es' ? 'Confirma con seguridad' : 'Confirm securely', text: lang === 'es' ? 'Paga el depósito y firma tu contrato digital.' : 'Pay the deposit and sign digitally.', icon: ShieldCheck },
                    { number: '04', title: lang === 'es' ? 'Vive la experiencia' : 'Live the experience', text: lang === 'es' ? 'Disfruta la sesión y recibe tu galería privada.' : 'Enjoy the session and receive your private gallery.', icon: CheckCircle2 },
                  ].map(stepItem => {
                    const Icon = stepItem.icon;
                    return <div key={stepItem.number} className="relative space-y-3">
                      <div className="flex items-center gap-3"><span className="font-mono text-[10px] text-white/70">{stepItem.number}</span><Icon size={16} className="text-white/70" /></div>
                      <h3 className="font-serif text-lg text-white/90">{stepItem.title}</h3>
                      <p className="text-[10px] text-white/45 leading-relaxed">{stepItem.text}</p>
                    </div>;
                  })}
                </div>
                <button onClick={() => { navigateTo('services'); setTimeout(() => document.getElementById('booking-calendar')?.scrollIntoView({ behavior: 'smooth' }), 200); }} className="mt-8 px-5 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/10 font-mono text-[10px] tracking-widest uppercase font-bold rounded-lg transition-all">
                  {lang === 'es' ? 'Comenzar reserva' : 'Start booking'}
                </button>
              </section>

            </div>
          )}

          {/* ======================================================= */}
          {/* ABOUT SCREEN */}
          {/* ======================================================= */}
          {currentView === 'about' && (
            <AboutSection profile={profile} lang={lang} t={t} />
          )}

          {/* ======================================================= */}
          {/* PORTFOLIO SCREEN */}
          {/* ======================================================= */}
          {currentView === 'portfolio' && (
            <div className="space-y-8">
              <div className="border-b border-white/10 pb-6">
                <h2 className="font-serif text-3xl text-white/90 tracking-wide">{t.portfolioTitle}</h2>
              </div>

              <PixiesetGallery lang={lang} t={t} />
            </div>
          )}

          {/* ======================================================= */}
          {/* SERVICES SCREEN — PHOTOGRAPHY PACKAGES */}
          {/* ======================================================= */}
          {currentView === 'services' && (
            <div className="space-y-12">
              {/* Step 1: Category Grid OR Step 2: Packages by Category */}
              <AnimatePresence mode="wait">
                {selectedCategory === null ? (
                  /* ——— STEP 1: SESSION CATEGORY GRID ——— */
                  <motion.section
                    key="category-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="space-y-6"
                  >
                    {/* Single header for Step 1 */}
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                      <span className="text-[10px] font-mono text-white/70 tracking-widest uppercase block">SERVICES</span>
                      <h2 className="font-serif text-3xl md:text-4xl text-white tracking-wide">{t.servicesTitle}</h2>
                      <p className="text-xs text-white/55 leading-relaxed">{t.servicesSubtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                      {sessionCategories.filter(c => c.active).sort((a, b) => a.sortOrder - b.sortOrder).map((cat, idx) => {
                        const cName = lang === 'es' ? cat.name_es : cat.name_en;
                        const cDesc = lang === 'es' ? cat.description_es : cat.description_en;

                        const categoryIconMap: Record<string, React.ReactNode> = {
                          Heart: <Heart size={22} className="text-white" />,
                          Gem: <Gem size={22} className="text-white" />,
                          Camera: <Camera size={22} className="text-white" />,
                          Users: <Users size={22} className="text-white" />,
                          Baby: <Baby size={22} className="text-white" />,
                          Sparkles: <Sparkles size={22} className="text-white" />,
                          PartyPopper: <PartyPopper size={22} className="text-white" />,
                          GraduationCap: <GraduationCap size={22} className="text-white" />,
                          Briefcase: <Briefcase size={22} className="text-white" />,
                          Utensils: <Utensils size={22} className="text-white" />,
                          Package: <Package size={22} className="text-white" />,
                          Calendar: <Calendar size={22} className="text-white" />,
                        };

                        const activePkgCount = packages.filter(p => p.category === cat.id && p.active).length;

                        return (
                          <motion.button
                            key={cat.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-30px" }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            onClick={() => setSelectedCategory(cat.id)}
                            className="group relative overflow-hidden rounded-lg aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                          >
                            {/* Background image */}
                            <div className="absolute inset-0">
                              <StorageImage
                                src={cat.image}
                                alt={cName}
                                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
                              />
                            </div>

                            {/* Overlay fade at top, solid panel at bottom */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                            {/* Content with solid dark base */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 space-y-2.5 z-10 bg-black/70 backdrop-blur-sm rounded-b-2xl">
                              <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:bg-white/10/30 group-hover:border-white/30">
                                {categoryIconMap[cat.icon] || <Camera size={22} className="text-white" />}
                              </div>
                              <div>
                                <h3 className="font-serif text-lg text-white font-medium leading-tight">{cName}</h3>
                                <p className="text-[11px] text-white/90 leading-relaxed mt-0.5 line-clamp-2">{cDesc}</p>
                              </div>
                              <div className="flex items-center space-x-1.5 text-[9px] font-mono text-white/80 uppercase tracking-wider">
                                <span>{activePkgCount} {lang === 'es' ? 'paquetes' : 'packages'}</span>
                                <ArrowRight size={9} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.section>
                ) : (
                  /* ——— STEP 2: PACKAGES FOR SELECTED CATEGORY ——— */
                  <motion.section
                    key={selectedCategory}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    {(() => {
                      const cat = sessionCategories.find(c => c.id === selectedCategory);
                      if (!cat) return null;
                      const cName = lang === 'es' ? cat.name_es : cat.name_en;
                      const cDesc = lang === 'es' ? cat.description_es : cat.description_en;
                      const cEyebrow = lang === 'es' ? 'SERVICIOS' : 'SERVICES';
                      const categoryPkgs = packages
                        .filter(p => p.category === selectedCategory && p.active)
                        .sort((a, b) => a.sortOrder - b.sortOrder);

                      return (
                        <div className="space-y-6">
                          {/* Hero header */}
                          <div className="space-y-6 py-6 md:py-10">
                            {/* Back button */}
                            <button
                              onClick={() => {
                                setSelectedCategory(null);
                                setSelectedPackageId(null);
                              }}
                              className="group inline-flex items-center space-x-2 text-[11px] font-mono text-white/60 hover:text-white border border-white/10 hover:border-white/25 px-3.5 py-2 rounded-md tracking-wider transition-all duration-300 cursor-pointer bg-white/[0.03] hover:bg-white/[0.06]"
                            >
                              <ArrowRight size={11} className="rotate-180 transition-transform duration-300 group-hover:-translate-x-0.5" />
                              <span>{t.backToCategories}</span>
                            </button>

                            <div className="text-center space-y-6">
                              <span className="text-[9px] font-mono text-white/70/40 tracking-[0.25em] uppercase block">{cEyebrow}</span>
                              <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white/90 font-light tracking-wide">{cName}</h2>
                              <p className="text-sm text-white/50 max-w-xl mx-auto font-light leading-relaxed">{cDesc}</p>
                              <div className="w-12 h-px bg-white/10/25 mx-auto" />
                            </div>
                          </div>

                          {/* Package cards grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {categoryPkgs.map((pkg, idx) => {
                              const pName = lang === 'es' ? pkg.name_es : pkg.name_en;
                              const pDesc = lang === 'es' ? pkg.description_es : pkg.description_en;
                              const pDuration = lang === 'es' ? pkg.duration_es : pkg.duration_en;
                              const pPriceFrom = lang === 'es' ? pkg.priceFromText_es : pkg.priceFromText_en;
                              const pButton = lang === 'es' ? pkg.buttonText_es : pkg.buttonText_en;

                              return (
                                <motion.div
                                  key={pkg.id}
                                  initial={{ opacity: 0, y: 30 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true, margin: "-40px" }}
                                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                                    className={`group bg-dark-gray border rounded-lg p-4 sm:p-6 lg:p-8 flex flex-col justify-between space-y-5 sm:space-y-6 text-left transition-all duration-500 hover:-translate-y-1 ${
                                     pkg.featured
                                       ? 'border-white/10 ring-1 ring-white/10 shadow-lg shadow-white/5'
                                       : 'border-white/[0.07] hover:border-white/10 hover:shadow-xl hover:shadow-white/5'
                                   }`}
                                >
                                  <div className="space-y-5">
                                    {pkg.image && (
                                      <div className="rounded-lg overflow-hidden sm:-mx-2 sm:-mt-2">
                                        <StorageImage src={pkg.image} alt={pName} className="w-full h-36 sm:h-40 object-cover transition-all duration-700 group-hover:scale-105" />
                                      </div>
                                    )}

                                    {/* Featured badge + Name */}
                                    <div className="space-y-2">
                                      {pkg.featured && (
                                        <span className="inline-block text-[11px] font-mono text-white/70/70 border border-white/10 bg-white/10/5 px-2 py-0.5 rounded-full uppercase tracking-[0.15em]">
                                          {t.recommended}
                                        </span>
                                      )}
                                      <h3 className="font-serif text-xl sm:text-2xl text-white/90 font-light">{pName}</h3>
                                    </div>

                                    {/* Duration + Price */}
                                    <div className="flex items-baseline justify-between border-b border-white/10 pb-3 sm:pb-4">
                                      <span className="text-[10px] font-mono text-white/50 tracking-wide">{pDuration}</span>
                                      <div className="text-right">
                                        <span className="text-[11px] text-white/40 block font-mono tracking-wider">{pPriceFrom}</span>
                                        <span className="text-xl sm:text-2xl lg:text-3xl font-light text-white/70 font-mono">${pkg.price.toLocaleString()}</span>
                                      </div>
                                    </div>

                                    <p className="text-xs text-white/60 leading-relaxed font-light">{pDesc}</p>

                                    {/* Benefits */}
                                    <div className="space-y-3">
                                      <h5 className="text-[11px] font-mono tracking-[0.2em] text-white/40 uppercase">{t.includesLabel}</h5>
                                      <ul className="space-y-2">
                                        {(lang === 'es' ? (pkg.benefits_es || pkg.benefits) : (pkg.benefits_en || pkg.benefits)).map((benefit, i) => (
                                          <li key={i} className="flex items-start space-x-2.5 text-[11px] sm:text-xs text-white/60 font-light">
                                            <CheckCircle2 size={9} className="text-white/30 mt-0.5 shrink-0" />
                                            <span>{benefit}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {(lang === 'es' ? pkg.travelNote_es : pkg.travelNote_en) && (
                                      <div className="flex items-start space-x-2 text-[9px] text-white/40 font-light">
                                        <MapPin size={9} className="text-white/30 mt-0.5 shrink-0" />
                                        <span>{lang === 'es' ? pkg.travelNote_es : pkg.travelNote_en}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* CTA button - outline style */}
                                  <button
                                    onClick={() => {
                                      setSelectedPackageId(pkg.id);
                                      const targetCalendar = document.getElementById('booking-calendar');
                                      if (targetCalendar) {
                                        targetCalendar.scrollIntoView({ behavior: 'smooth' });
                                      }
                                    }}
                                    className="w-full py-3 bg-transparent border border-white/20 hover:border-white/30 text-white/70 hover:text-white/60 font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-light rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer group/btn"
                                  >
                                    <span>{pButton}</span>
                                    <ArrowRight size={9} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                                  </button>
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Booking Calendar — only inside Step 2 */}
                          <section id="booking-calendar" className="pt-12 border-t border-white/10 space-y-8">
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
                              onClearPackage={() => setSelectedPackageId(null)}
                              setNavigationGuard={setNavigationGuard}
                              onAddBooking={(newBook) => {
                                setSelectedPackageId(null);
                                const savedBook: Booking = {
                                  ...newBook,
                                  id: `book-${Date.now()}`,
                                  status: 'pending',
                                  isRead: false,
                                  createdAt: new Date().toISOString(),
                                };
                                handleUpdateBookings([savedBook, ...bookings]);
                              }}
                            />
                          </section>
                        </div>
                      );
                    })()}
                  </motion.section>
                )}
              </AnimatePresence>
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
               bookings={bookings}
                onUpdateBookings={handleUpdateBookings}
                invoices={invoices}
                onSubmitTestimonial={(testimonial) => handleUpdateTestimonials([testimonial, ...testimonials])}
               />
            </div>
          )}

          {/* ======================================================= */}
          {/* BOOKING APPROVAL SCREEN (from approval link) */}
          {/* ======================================================= */}
          {currentView === 'booking-approval' && approvalToken && (
            <div className="w-full max-w-4xl mx-auto px-4 py-8">
              {(() => {
                if (approvalBooking === 'loading') {
                  return (
                    <div className="glass-premium rounded-lg border border-white/10 p-8 md:p-12 max-w-lg mx-auto text-center space-y-4">
                      <div className="inline-flex p-4 rounded-full bg-white/10 border border-white/10 text-white/30 mx-auto">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                      </div>
                      <p className="text-sm text-white/50">
                        {lang === 'en' ? 'Loading...' : 'Cargando...'}
                      </p>
                    </div>
                  );
                }
                const booking = approvalBooking;
                if (!booking) {
                  return (
                    <div className="glass-premium rounded-lg border border-white/10 p-8 md:p-12 max-w-lg mx-auto text-center space-y-4">
                      <div className="inline-flex p-4 rounded-full bg-white/10 border border-white/10 text-white/50 mx-auto">
                        <AlertCircle size={40} />
                      </div>
                      <h3 className="font-serif text-2xl text-white/80">
                        {lang === 'en' ? 'Invalid Link' : 'Link Inválido'}
                      </h3>
                      <p className="text-sm text-white/60">
                        {lang === 'en'
                          ? 'This approval link is not valid or has already been used.'
                          : 'Este enlace de aprobación no es válido o ya fue utilizado.'}
                      </p>
                    </div>
                  );
                }
                if (booking.status === 'expired') {
                  return (
                    <div className="glass-premium rounded-lg border border-white/10 p-8 md:p-12 max-w-lg mx-auto text-center space-y-4">
                      <div className="inline-flex p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto">
                        <AlertCircle size={40} />
                      </div>
                      <h3 className="font-serif text-2xl text-white/90">
                        {lang === 'en' ? 'Link Expired' : 'Enlace Expirado'}
                      </h3>
                      <p className="text-sm text-white/60">
                        {lang === 'en'
                          ? 'The time to complete this booking has expired. Please contact the photographer.'
                          : 'El tiempo para completar esta reserva ha expirado. Contactá a la fotógrafa.'}
                      </p>
                    </div>
                  );
                }
                if (booking.status === 'rejected') {
                  return (
                    <div className="glass-premium rounded-lg border border-white/10 p-8 md:p-12 max-w-lg mx-auto text-center space-y-4">
                      <div className="inline-flex p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto">
                        <X size={40} />
                      </div>
                      <h3 className="font-serif text-2xl text-white/90">
                        {lang === 'en' ? 'Request Rejected' : 'Solicitud Rechazada'}
                      </h3>
                      <p className="text-sm text-white/60">
                        {booking.rejectionReason
                          ? (lang === 'en' ? `Reason: ${booking.rejectionReason}` : `Motivo: ${booking.rejectionReason}`)
                          : (lang === 'en'
                              ? 'Unfortunately, the photographer cannot accommodate your request for this date.'
                              : 'Lamentablemente, la fotógrafa no puede atender tu solicitud para esta fecha.')}
                      </p>
                    </div>
                  );
                }
                if (booking.status === 'pending') {
                  return (
                    <div className="glass-premium rounded-lg border border-white/10 p-8 md:p-12 max-w-lg mx-auto text-center space-y-4">
                      <div className="inline-flex p-4 rounded-full bg-gold-950/40 border border-white/10 text-white/70 mx-auto">
                        <Clock size={40} />
                      </div>
                      <h3 className="font-serif text-2xl text-white/80">
                        {lang === 'en' ? 'Awaiting Approval' : 'Esperando Aprobación'}
                      </h3>
                      <p className="text-sm text-white/60">
                        {lang === 'en'
                          ? 'Your request is still pending. The photographer will review it shortly.'
                          : 'Tu solicitud aún está pendiente. La fotógrafa la revisará en breve.'}
                      </p>
                    </div>
                  );
                }
                return (
                  <BookingApproval
                    booking={booking}
                    lang={lang}
                    onConfirm={handleConfirmBooking}
                    onCheckout={(amount, desc, onDone, onCancel) => {
                      pendingPaymentBookingRef.current = {
                        clientName: booking.clientName,
                        clientEmail: booking.clientEmail,
                        photographerEmail: emailConfig.receiverEmail || booking.clientEmail,
                        amount,
                        packageName: booking.packageName || 'Photography Session',
                      };
                      handleCheckoutWithCallback(amount, desc, onDone, onCancel);
                    }}
                  />
                );
              })()}
            </div>
          )}

          {/* ======================================================= */}
          {/* FAQ ACCORDION SCREEN */}
          {/* ======================================================= */}
          {currentView === 'faq' && (
            <div className="space-y-12 max-w-3xl mx-auto text-left">
              <section className="space-y-3 border-b border-white/10 pb-6">
                <span className="text-[10px] font-mono text-white/70 tracking-widest uppercase block">QUESTIONS</span>
                <h2 className="font-serif text-3xl text-white tracking-wide">{t.faqTitle}</h2>
                <p className="text-xs text-white/55">{t.faqSubtitle}</p>
              </section>

              {/* Accordion list */}
              <section className="space-y-3">
                {faqs.map(faq => {
                  const isOpen = activeFaqId === faq.id;
                  const fQuestion = lang === 'es' ? (faq.question_es || faq.question) : (faq.question_en || faq.question);
                  const fAnswer = lang === 'es' ? (faq.answer_es || faq.answer) : (faq.answer_en || faq.answer);

                  return (
                    <div 
                      key={faq.id} 
                      className="bg-dark-gray border border-white/10 rounded-lg overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setActiveFaqId(isOpen ? null : faq.id)}
                        className="w-full p-5 text-left flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <span className="text-xs md:text-sm font-semibold text-white/90">{fQuestion}</span>
                        <ChevronDown 
                          size={16} 
                          className={`text-white/70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
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
                            <div className="p-5 pt-0 text-xs text-white/60 leading-relaxed font-sans border-t border-white/10 bg-charcoal">
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
          {/* TESTIMONIALS SCREEN */}
          {/* ======================================================= */}
          {currentView === 'testimonials' && (
            <TestimonialsView
              testimonials={testimonials}
              lang={lang}
              onSubmitTestimonial={(testimonial) => handleUpdateTestimonials([testimonial, ...testimonials])}
            />
          )}

          {/* ======================================================= */}
          {/* CONTACT SCREEN */}
          {/* ======================================================= */}
          {currentView === 'contact' && (
            <div className="space-y-12 pt-12 md:pt-20">
              <section className="text-center max-w-md mx-auto space-y-3">
                <span className="text-[10px] font-mono text-white/70 tracking-widest uppercase block">GET IN TOUCH</span>
                <h2 className="font-serif text-3xl text-white tracking-wide">{t.contactTitle}</h2>
                <p className="text-xs text-white/55">{t.contactSubtitle}</p>
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-4xl mx-auto">
                {/* Contact form (Cols 7) */}
                <div className="lg:col-span-7 bg-dark-gray border border-white/10 rounded-lg p-6 md:p-8 shadow-md">
                  <AnimatePresence mode="wait">
                    {!contactSuccess ? (
                      <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                        <div aria-hidden="true" className="absolute opacity-0 pointer-events-none" style={{ height: 0, overflow: 'hidden' }}>
                          <input
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={contactHoneypot}
                            onChange={(e) => setContactHoneypot(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t.clientName}</label>
                            <input
                              type="text"
                              required
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              className="w-full bg-charcoal border-stone rounded p-2.5 text-xs text-white focus:outline-none focus:border-white/30 font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">{t.clientEmail}</label>
                            <input
                              type="email"
                              required
                              value={contactEmail}
                              onChange={(e) => setContactEmail(e.target.value)}
                              className="w-full bg-charcoal border-stone rounded p-2.5 text-xs text-white focus:outline-none focus:border-white/30 font-sans"
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
                              className="w-full bg-charcoal border-stone rounded p-2.5 text-xs text-white focus:outline-none focus:border-white/30 font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Message</label>
                          <textarea
                            rows={4}
                            required
                              value={contactMsg}
                              onChange={(e) => setContactMsg(e.target.value)}
                              className="w-full bg-charcoal border-stone rounded p-3 text-xs text-white focus:outline-none focus:border-white/30 font-sans resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={contactSubmitting}
                          className="w-full py-3 bg-white/10 hover:bg-white/15 text-white border border-white/10 font-mono text-[10px] tracking-widest uppercase font-bold rounded-lg transition-all flex items-center justify-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <MessageSquare size={13} />
                          <span>{contactSubmitting ? (lang === 'en' ? 'Sending...' : 'Enviando...') : t.sendMessage}</span>
                        </button>
                      </form>
                    ) : (
                      <motion.div
                        className="py-12 text-center space-y-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="inline-flex p-3 rounded-full bg-white/10/10 border border-white/10 text-white/70 mx-auto">
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
                <div className="lg:col-span-5 bg-dark-gray border border-white/10 rounded-lg p-6 md:p-8 text-left flex flex-col justify-between space-y-6 shadow-md">
                  <div className="space-y-5">
                    <h4 className="text-xs font-mono tracking-widest text-white/70 uppercase font-semibold">Studio Coordinates</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 text-xs">
                        <MapPin size={14} className="text-white/70 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white/90">Main Studio Office</span>
                          <span className="text-white/50 block">Via della Moscova 24, Milan, Italy</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 text-xs">
                        <Mail size={14} className="text-white/70 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white/90">E-mail Inquiries</span>
                          <span className="text-white/50 block hover:text-white/60 transition-colors cursor-pointer">studio@áureastudio.com</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 text-xs">
                        <Phone size={14} className="text-white/70 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white/90">Studio Telephone</span>
                          <span className="text-white/50 block">+39 02 1234 5678</span>
                        </div>
                      </div>
                    </div>
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
               invoices={invoices}
              messages={messages}
              clientAccounts={clientAccounts}
              seo={seo}
              profile={profile}
              bookingConfig={bookingConfig}
              emailConfig={emailConfig}
              stats={seoAnalytics}
              lang={lang}
              onUpdatePhotographs={handleUpdatePhotographs}
              onUpdateTestimonials={handleUpdateTestimonials}
              onUpdateBlogPosts={handleUpdateBlogPosts}
              onUpdateFaqs={handleUpdateFaqs}
               onUpdateBookings={handleUpdateBookings}
               onUpdateInvoices={handleUpdateInvoices}
              onUpdateMessages={handleUpdateMessages}
              onUpdateClientAccounts={handleUpdateClientAccounts}
              onUpdateSeo={handleUpdateSeo}
              onUpdateProfile={handleUpdateProfile}
              onUpdateBookingConfig={handleUpdateBookingConfig}
              onUpdateEmailConfig={handleUpdateEmailConfig}
              sessionCategories={sessionCategories}
              onUpdateSessionCategories={handleUpdateSessionCategories}
              packages={packages}
              onUpdatePackages={handleUpdatePackages}
              onLogout={handleAdminLogout}
              onBackToSite={handleBackToSite}
            />
          )}

          {/* ======================================================= */}
          {/* LEGAL VIEWS: PRIVACY POLICY & TERMS OF SERVICE */}
          {/* ======================================================= */}
          {(currentView === 'privacy' || currentView === 'terms') && (
            <LegalViews
              type={currentView}
              lang={lang}
              onBack={() => navigateTo('home')}
            />
          )}

          {/* ======================================================= */}
          {/* 404 NOT FOUND */}
          {/* ======================================================= */}
          {currentView === '404' && (
            <NotFound
              lang={lang}
              onNavigateHome={() => navigateTo('home')}
              onNavigatePortfolio={() => navigateTo('portfolio')}
            />
          )}
        </motion.main>
      </AnimatePresence>

      {/* FOOTER */}
      <Footer
        onSetView={navigateTo}
        lang={lang}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setShowAdminLogin(true)}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/80 backdrop-blur-sm">
            <motion.div
              className="bg-charcoal border border-white/10 rounded-lg p-6 max-w-sm w-full space-y-6 shadow-lg relative"
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
                <div className="w-12 h-12 bg-white/10/10 border border-white/10 rounded-full flex items-center justify-center mx-auto text-white/70">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="font-serif text-xl text-white font-semibold">CMS Authenticator</h4>
                <p className="text-[10px] font-mono text-white/45 uppercase tracking-widest">AUREA SECURITY GATE</p>
              </div>

              <form onSubmit={handleAdminAuthSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-white/50 uppercase">Email</label>
                  <input
                    type="text"
                    required
                    value={adminUseráname}
                    onChange={(e) => setAdminUseráname(e.target.value)}
                    className="w-full bg-charcoal border-stone rounded p-2.5 text-xs text-white focus:outline-none focus:border-white/30"
                    placeholder="admin@tudominio.com"
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
                    className="w-full bg-charcoal border-stone rounded p-2.5 pr-10 text-xs text-white focus:outline-none focus:border-white/30 font-sans"
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
                  className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 font-mono text-[10px] tracking-widest uppercase font-bold rounded-lg transition-all"
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
        onClose={() => {
          setCheckoutOpen(false);
          pendingCancelRef.current?.();
          pendingCancelRef.current = null;
        }}
        onSuccess={(result) => {
          pendingPaymentRef.current?.(result);
          if (pendingPaymentBookingRef.current) {
            const info = pendingPaymentBookingRef.current;
            import('./lib/email').then(({ sendDepositReceivedEmail }) => {
              sendDepositReceivedEmail(
                emailConfig,
                info.clientName,
                info.clientEmail,
                info.photographerEmail,
                info.amount,
                info.packageName,
                lang,
              );
            });
            pendingPaymentBookingRef.current = null;
          }
          pendingPaymentRef.current = null;
          pendingCancelRef.current = null;
        }}
      />
    </div>
  );
}


