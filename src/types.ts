/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExifData {
  camera: string;
  lens: string;
  focalLength: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
  location?: string;
}

export interface Photograph {
  id: string;
  url: string;
  title: string;
  title_es?: string;
  title_en?: string;
  title_pt?: string;
  category: string; // 'retrato' | 'boda' | 'moda' | 'drone' | 'viajes' | 'producto' | 'evento' | 'naturaleza'
  description: string;
  description_es?: string;
  description_en?: string;
  description_pt?: string;
  exif: ExifData;
  tags: string[];
  colors: string[]; // dominant hex colors (e.g. ['#0B0B0B', '#C7A962'])
  isFavorite: boolean;
  isFeatured: boolean;
  rating?: number;
  downloads?: number;
  size?: string;
  resolution?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  duration: string;
  includes: string[];
  price: number;
  slug: string;
  image: string;
  title_es?: string;
  description_es?: string;
  duration_es?: string;
  includes_es?: string[];
  title_pt?: string;
  description_pt?: string;
  duration_pt?: string;
  includes_pt?: string[];
  title_en?: string;
  description_en?: string;
  duration_en?: string;
  includes_en?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  image: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string; // markdown content
  excerpt: string;
  category: string;
  tags: string[];
  image: string;
  date: string;
  readTime: string;
  seoKeywords: string;
  status: 'draft' | 'published';
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  question_es?: string;
  answer_es?: string;
  question_pt?: string;
  answer_pt?: string;
  question_en?: string;
  answer_en?: string;
}

export interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 - 12:00"
  serviceId: string;
  peopleCount: number;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  amount?: number;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  replyText?: string;
  replyAt?: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: 'summary' | 'summary_large_image';
  keywords: string;
  robotsText: string;
  heroImageLeft?: string;
  heroImageRight?: string;
}

export interface AnalyticsStats {
  totalVisits: number;
  totalRevenue: number;
  bookingConversionRate: number; // e.g. 4.2%
  sessionsCount: number;
  revenueByMonth: { month: string; value: number }[];
  sessionsByService: { service: string; count: number }[];
  visitsByDay: { day: string; count: number }[];
}

export interface PhotographerProfile {
  name: string;
  avatarUrl: string;
  title: string; // e.g. "AUREA STUDIO HEAD PHOTOGRAPHER"
  preferredCamera: string;
  preferredLens: string;
  aboutTitle_es: string;
  aboutTitle_en: string;
  aboutTitle_pt: string;
  aboutText1_es: string;
  aboutText2_es: string;
  aboutText1_en: string;
  aboutText2_en: string;
  aboutText1_pt: string;
  aboutText2_pt: string;
}

export interface BookingConfig {
  timeSlots: string[];
  availableDays: number[]; // e.g. [1, 2, 3, 4, 5, 6] (0 is Sunday, 1 is Monday, etc.)
  blockedDates: string[]; // e.g. ["2026-07-15"]
}

export interface EmailConfig {
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;
  receiverEmail: string; // The email where admin notifications are sent
  enableAutoResponse?: boolean; // Enable automatic replies to clients
  emailjsAutoTemplateId?: string; // Optional custom EmailJS template ID for client auto-reply
  autoReplySubject?: string; // Auto-reply subject line
  autoReplyMessage?: string; // Auto-reply custom body message
}

export interface PhotographyPackage {
  id: string;
  icon: string;
  image?: string;
  name_es: string;
  name_en: string;
  name_pt: string;
  price: number;
  priceFromText_es: string;
  priceFromText_en: string;
  priceFromText_pt: string;
  duration_es: string;
  duration_en: string;
  duration_pt: string;
  description_es: string;
  description_en: string;
  description_pt: string;
  benefits: string[];
  buttonText_es: string;
  buttonText_en: string;
  buttonText_pt: string;
  cardColor?: string;
  sortOrder: number;
  active: boolean;
  featured: boolean;
}

export interface Milestone {
  year: string;
  title_es: string;
  title_en: string;
  title_pt: string;
  description_es: string;
  description_en: string;
  description_pt: string;
}

export type ActiveLanguage = 'es' | 'en' | 'pt';

export interface ProofPhoto {
  id: string;
  url: string;
  title: string;
  sharpness: number; // 0-100
  thirdsAlign: number; // 0-100
  emotionScore: number; // 0-100
  isFav: boolean;
  printSize: string;
  description?: string;
  location?: string;
}

export interface ClientAccount {
  id: string;
  clientName: string;
  clientEmail: string;
  passcode: string; // login access code
  sessionDate: string;
  sessionTitle: string;
  photos: ProofPhoto[];
  createdAt: string;
}

