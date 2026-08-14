/**
 * Central site configuration.
 *
 * All global brand, contact, social and pricing settings live here so they are
 * resolved in one place instead of being patched page by page. Keep it in sync
 * with the AGENTS.md brand rules (never introduce a different studio name).
 */

import type { ActiveLanguage } from '../types';

export const BRAND_NAME = 'Miriam Campos Photography';
/** Short mark used in the logo / navbar wordmark (kept consistent with existing UI). */
export const LOGO_MARK = 'Miriam Campos';

/** Single visible currency for every price on the site. */
export const CURRENCY = 'USD';

/** Formatting for prices across the whole site: en uses comma thousands, es uses dot. */
export function formatPrice(amount: number, lang: ActiveLanguage): string {
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  const formatted = Number(amount || 0).toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `$${formatted} ${CURRENCY}`;
}

export const CONTACT = {
  email: 'studio@miriamcamposphotography.com',
  /** Real phone / public address can be added here when provided by the owner. */
  phone: null as string | null,
  address: null as string | null,
  locationLine_en: 'Worldwide — available for destination sessions.',
  locationLine_es: 'En todo el mundo — disponible para sesiones de destino.',
};

/**
 * Social profiles point at the Miriam Campos handles.
 */
export const SOCIAL = {
  instagram: 'https://www.instagram.com/miriamcamposphotography/',
  instagramHandle: '@miriamcamposphotography',
  instagramUser: 'miriamcamposphotography',
  /** Empty until the owner confirms the official Facebook URL. */
  facebook: '',
  pinterest: '',
};

/**
 * Home "Metrics of Excellence" counters. Values are internal-consistent with the
 * About timeline (e.g. sessions count matches the 2020 "500 Sessions" milestone).
 * Edit these when the owner confirms real figures — but never ship a zero counter.
 */
export const METRICS = {
  years: 15,
  sessions: 500,
  satisfaction: 98,
};