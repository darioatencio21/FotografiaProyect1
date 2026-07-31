import { supabase, ensureActiveSession } from './supabase';
import type { AnalyticsStats, Booking } from '../types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EMPTY_DAYS = () => DAYS.map(d => ({ day: d, count: 0 }));

function getLast6Months(monthMap: Record<string, number>) {
  const now = new Date();
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = MONTHS[d.getMonth()];
    result.push({ month, value: monthMap[month] || 0 });
  }
  return result;
}

function computeRevenueByMonth(bookings: Booking[]) {
  const monthMap: Record<string, number> = {};
  for (const b of bookings) {
    if (!b.date) continue;
    const monthIndex = new Date(b.date).getMonth();
    const month = MONTHS[monthIndex];
    monthMap[month] = (monthMap[month] || 0) + (b.amount || 0);
  }
  return getLast6Months(monthMap);
}

function computeSessionsByService(bookings: Booking[]) {
  const serviceMap: Record<string, number> = {};
  for (const b of bookings) {
    const svc = b.serviceId || 'unknown';
    serviceMap[svc] = (serviceMap[svc] || 0) + 1;
  }
  return Object.entries(serviceMap).map(([service, count]) => ({ service, count }));
}

export async function computeAnalytics(): Promise<AnalyticsStats> {
  let bookings: Booking[] = [];
  let services: { id: string; title_en: string; title: string }[] = [];

  try {
    const { data: b } = await supabase.from('bookings').select('*');
    if (b) bookings = b as Booking[];
  } catch { /* table may not exist */ }

  try {
    const { data: s } = await supabase.from('services').select('id, title_en, title');
    if (s) services = s as any[];
  } catch { /* table may not exist */ }

  const confirmed = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
  const totalRevenue = confirmed.reduce((sum, b) => sum + (b.amount || 0), 0);
  const sessionsCount = confirmed.length;
  const bookingConversionRate = bookings.length > 0
    ? Math.round((confirmed.length / bookings.length) * 1000) / 10
    : 0;
  const revenueByMonth = computeRevenueByMonth(confirmed);
  const sessionsByService = computeSessionsByService(confirmed).map(s => {
    const match = services.find(svc => svc.id === s.service);
    return { service: match ? (match.title_en || match.title) : s.service, count: s.count };
  });

  let totalVisits = 0;
  let visitsByDay = EMPTY_DAYS();
  try {
    const { data: existing } = await supabase
      .from('analytics')
      .select('totalVisits, visitsByDay')
      .eq('id', 'stats')
      .single();
    if (existing) {
      totalVisits = existing.totalVisits || 0;
      visitsByDay = (existing.visitsByDay as { day: string; count: number }[]) || EMPTY_DAYS();
    }
  } catch { /* table may not exist */ }

  return { totalVisits, totalRevenue, bookingConversionRate, sessionsCount, revenueByMonth, sessionsByService, visitsByDay };
}

export async function trackPageView(): Promise<void> {
  // Analytics only allows authenticated writes, so skip the write for anonymous
  // visitors instead of firing an upsert that Supabase rejects with 401.
  if (!(await ensureActiveSession())) return;
  try {
    const { data: existing } = await supabase
      .from('analytics')
      .select('totalVisits, visitsByDay')
      .eq('id', 'stats')
      .single();

    const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    let totalVisits = 1;
    let visitsByDay = EMPTY_DAYS();

    if (existing) {
      totalVisits = (existing.totalVisits || 0) + 1;
      visitsByDay = (existing.visitsByDay as { day: string; count: number }[]) || EMPTY_DAYS();
      const idx = visitsByDay.findIndex(d => d.day === today);
      if (idx !== -1) visitsByDay[idx] = { ...visitsByDay[idx], count: visitsByDay[idx].count + 1 };
    } else {
      const idx = visitsByDay.findIndex(d => d.day === today);
      if (idx !== -1) visitsByDay[idx] = { ...visitsByDay[idx], count: 1 };
    }

    await supabase
      .from('analytics')
      .upsert({ id: 'stats', totalVisits, visitsByDay }, { onConflict: 'id' });
  } catch { /* silently fail */ }
}

export async function saveAnalytics(stats: AnalyticsStats): Promise<void> {
  if (!(await ensureActiveSession())) return;
  try {
    await supabase
      .from('analytics')
      .upsert({ id: 'stats', ...stats }, { onConflict: 'id' });
  } catch { /* table may not exist */ }
}
