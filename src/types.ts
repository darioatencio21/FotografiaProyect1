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
  category: string; // 'retrato' | 'boda' | 'moda' | 'drone' | 'viajes' | 'producto' | 'evento' | 'naturaleza'
  description: string;
  description_es?: string;
  description_en?: string;
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
  approved?: boolean;
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
  question_en?: string;
  answer_en?: string;
}

export interface ContractData {
  brideName: string;
  groomName: string;
  brideEmail: string;
  groomPhone: string;
  brideAddress: string;
  ceremonyLocation: string;
  ceremonyAddress: string;
  ceremonyStart: string;
  ceremonyEnd: string;
  receptionLocation: string;
  receptionAddress: string;
  receptionStart: string;
  receptionEnd: string;
}

export interface Invoice {
  id: string;
  bookingId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  packageName: string;
  items: { description: string; amount: number }[];
  subtotal: number;
  depositPaid: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: 'paid' | 'partial' | 'unpaid' | 'cancelled';
  paymentMethod: string;
  stripePaymentIntentId?: string;
  stripeTxHash?: string;
  createdAt: string;
  paidAt?: string;
  notes?: string;
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
  status: 'pending' | 'approved' | 'rejected' | 'confirmed' | 'completed' | 'expired';
  createdAt: string;
  amount?: number;
  isRead?: boolean;
  isPaid?: boolean;
  contractData?: ContractData;
  contractAccepted?: boolean;
  contractSignature?: string;
  contractSignedAt?: string;
  contractPhotographerSignature?: string;
  contractPhotographerSignedAt?: string;
  packageName?: string;
  packageDetails?: string;
  contractType?: 'wedding' | 'session';
  depositAmount?: number;
  amountDue?: number;
  travelExpenses?: number;
  invoiceId?: string;
  reminderSent?: boolean;
  reminderSentAt?: string;
  approvalToken?: string;
  approvedAt?: string;
  approvalExpiresAt?: string;
  paymentStatus?: 'pending' | 'paid';
  contractStatus?: 'pending' | 'signed';
  rejectionReason?: string;
  paymentTxHash?: string;
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
  aboutText1_es: string;
  aboutText2_es: string;
  aboutText1_en: string;
  aboutText2_en: string;
}

export interface BookingConfig {
  timeSlots: string[];
  availableDays: number[]; // e.g. [1, 2, 3, 4, 5, 6] (0 is Sunday, 1 is Monday, etc.)
  blockedDates: string[]; // e.g. ["2026-07-15"]
  approvalExpirationHours?: number; // hours until approval link expires (default 48)
}

export interface EmailConfig {
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;
  emailjsPrivateKey?: string;
  receiverEmail: string; // The email where admin notifications are sent
  enableAutoResponse?: boolean; // Enable automatic replies to clients
  emailjsAutoTemplateId?: string; // Optional custom EmailJS template ID for client auto-reply
  autoReplySubject?: string; // Auto-reply subject line
  autoReplyMessage?: string; // Auto-reply custom body message
}

export interface SessionCategory {
  id: string;
  icon: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  image: string;
  sortOrder: number;
  active: boolean;
}

export interface PhotographyPackage {
  id: string;
  category: string;
  name_es: string;
  name_en: string;
  image?: string;

  price: number;
  deposit?: number;
  priceFromText_es: string;
  priceFromText_en: string;

  duration_es: string;
  duration_en: string;

  description_es: string;
  description_en: string;
  benefits: string[];
  benefits_es?: string[];
  benefits_en?: string[];

  buttonText_es: string;
  buttonText_en: string;

  travelNote_es?: string;
  travelNote_en?: string;

  sortOrder: number;
  active: boolean;
  featured: boolean;
}

export interface Milestone {
  year: string;
  title_es: string;
  title_en: string;

  description_es: string;
  description_en: string;
}

export type ActiveLanguíage = 'es' | 'en';

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

export interface GalleryData {
  clientName: string;
  clientEmail?: string;
  sessionTitle: string;
  sessionDate: string;
  photos: ProofPhoto[];
}

export interface ClientAccount {
  id: string;
  clientName: string;
  clientEmail: string;
  passcode: string;
  sessionDate: string;
  sessionTitle: string;
  photos: ProofPhoto[];
  createdAt: string;
}

export interface InstagramPost {
  id: string;
  imageUrl: string;
  postUrl: string;
  caption?: string;
  timestamp: string;
  sortOrder: number;
}
