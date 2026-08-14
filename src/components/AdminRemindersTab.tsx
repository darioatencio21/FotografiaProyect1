import { useState, useMemo } from 'react';
import { Bell, BellOff, Send, Check, X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Booking, PhotographerProfile, ActiveLanguage } from '../types';

interface AdminRemindersTabProps {
  bookings: Booking[];
  profile: PhotographerProfile;
  onUpdateBookings: (bookings: Booking[]) => void;
  triggerAlert: (msg: string) => void;
  lang: ActiveLanguage;
}

export default function AdminRemindersTab({
  bookings, profile,
  onUpdateBookings, triggerAlert, lang,
}: AdminRemindersTabProps) {
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const t = (es: string, en: string) => (lang === 'en' ? en : es);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter(b => (b.status === 'confirmed' || b.status === 'approved') && b.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot));
  }, [bookings, today]);

  const todayBookings = upcomingBookings.filter(b => b.date === today);
  const tomorrowBookings = upcomingBookings.filter(b => b.date === tomorrow);
  const laterBookings = upcomingBookings.filter(b => b.date > tomorrow);

  const needsReminder = (b: Booking) => !b.reminderSent;
  const isRecent = (b: Booking) => {
    if (!b.reminderSentAt) return false;
    return Date.now() - new Date(b.reminderSentAt).getTime() < 86400000;
  };

  const sendReminder = async (booking: Booking) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      triggerAlert(t('VITE_SUPABASE_URL no configurado', 'VITE_SUPABASE_URL not configured'));
      return;
    }

    setSendingIds(prev => new Set(prev).add(booking.id));
    try {
      const { getAuthHeaders } = await import('../lib/email');
      const dayLabel = booking.date === today
        ? t('HOY', 'TODAY')
        : booking.date === tomorrow
          ? t('MAÑANA', 'TOMORROW')
          : booking.date;

      const subject = t('Recordatorio: Tu sesión fotográfica', 'Reminder: Your Photo Session');
      const text = `Hola ${booking.clientName},\n\nTe recordamos que tu sesión fotográfica es ${dayLabel} a las ${booking.timeSlot}.\n\nPaquete: ${booking.packageName || 'Fotografía'}\n\nSaludos,\n${profile.name || 'Miriam Campos'}`;

      const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ to: booking.clientEmail, subject, html: text.replace(/\n/g, '<br>'), text }),
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || res.statusText);
      }

      onUpdateBookings(bookings.map(b => b.id === booking.id ? {
        ...b,
        reminderSent: true,
        reminderSentAt: new Date().toISOString()
      } : b));

      triggerAlert(t('Recordatorio enviado a ' + booking.clientName, 'Reminder sent to ' + booking.clientName));
    } catch (err: any) {
      triggerAlert(t('Error al enviar recordatorio', 'Error sending reminder') + ': ' + (err?.message || ''));
    } finally {
      setSendingIds(prev => {
        const next = new Set(prev);
        next.delete(booking.id);
        return next;
      });
    }
  };

  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL;

  const renderBookingRow = (booking: Booking) => {
    const isSending = sendingIds.has(booking.id);
    const isExpanded = expandedId === booking.id;
    const pName = booking.packageName || t('Sesión', 'Session');
    return (
      <div key={booking.id} className={`rounded-lg border transition-all ${booking.reminderSent ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/10 bg-white/5'}`}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {booking.reminderSent ? (
              <BellOff size={14} className="text-emerald-400 shrink-0" />
            ) : (
              <Bell size={14} className="text-white/90 shrink-0 animate-pulse" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-serif text-white truncate">{booking.clientName}</span>
                {booking.reminderSent && (
                  <span className="text-[10px] font-mono text-emerald-400 shrink-0">Enviado</span>
                )}
                {!booking.reminderSent && booking.date === today && (
                  <span className="text-[10px] font-mono text-red-400 shrink-0">{t('URGENTE', 'URGENT')}</span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-mono text-white/40 mt-0.5">
                <span>{booking.date}</span>
                <span>{booking.timeSlot}</span>
                <span>{pName}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0">
            {!booking.reminderSent ? (
              <button
                onClick={() => sendReminder(booking)}
                disabled={isSending || !isConfigured}
                className="py-1.5 px-3 bg-white/10 text-white border border-white/10 hover:bg-white/15 text-white rounded-lg text-[10px] font-mono tracking-wider uppercase font-semibold flex items-center space-x-1 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={10} />
                )}
                <span>{t('Enviar', 'Send')}</span>
              </button>
            ) : (
              <span className="text-[10px] font-mono text-emerald-400/60">
                {isRecent(booking) ? t('Hoy', 'Today') : booking.reminderSentAt?.split('T')[0]}
              </span>
            )}
            <button
              onClick={() => setExpandedId(isExpanded ? null : booking.id)}
              className="p-1 text-white/30 hover:text-white cursor-pointer transition-colors"
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
        {isExpanded && (
          <div className="px-3 pb-3 pt-0 border-t border-white/10 mx-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-white/50 mt-2">
              <div><span className="text-white/30">{t('Email:', 'Email:')}</span> {booking.clientEmail}</div>
              <div><span className="text-white/30">{t('Teléfono:', 'Phone:')}</span> {booking.clientPhone}</div>
              <div className="col-span-2"><span className="text-white/30">{t('Notas:', 'Notes:')}</span> {booking.notes || '—'}</div>
              {booking.reminderSentAt && (
                <div className="col-span-2"><span className="text-white/30">{t('Enviado el:', 'Sent at:')}</span> {new Date(booking.reminderSentAt).toLocaleString()}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title: string, items: Booking[], emptyMsg: string) => (
    <div className="space-y-2">
      <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-wider border-b border-white/10 pb-2">{title} ({items.length})</h3>
      {items.length === 0 ? (
        <p className="text-xs text-white/30 py-3 text-center">{emptyMsg}</p>
      ) : (
        <div className="space-y-2">{items.map(renderBookingRow)}</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-white">{t('Recordatorios de Sesiones', 'Session Reminders')}</h2>
          <p className="text-xs text-white/50">
            {t('Revisa las sesiones próximas y envía recordatorios automáticos.', 'Review upcoming sessions and send automatic reminders.')}
          </p>
        </div>
      </div>

      {/* Integration status card */}
      <div className={`rounded-lg border p-4 ${isConfigured ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isConfigured ? (
              <Check size={16} className="text-emerald-400" />
            ) : (
              <X size={16} className="text-red-400" />
            )}
            <span className="text-xs font-mono text-white/70">
              {isConfigured
                ? t('Sistema de correo configurado (Supabase + Resend)', 'Email system configured (Supabase + Resend)')
                : t('Edge Function no configurada. Verificá que las secrets estén en Supabase', 'Edge Function not configured. Check secrets in Supabase Dashboard')}
            </span>
          </div>
          {isConfigured && (
            <span className="text-[9px] font-mono text-emerald-400/60">
              {t('Recordatorios automáticos vía Edge Function + cron-job.org activos', 'Auto reminders via Edge Function + cron-job.org active')}
            </span>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {renderSection(
          t('HOY — Sin recordatorio enviado', 'TODAY — No reminder sent'),
          todayBookings.filter(needsReminder),
          t('No hay sesiones hoy sin recordatorio', 'No sessions today without reminder')
        )}

        {renderSection(
          t('HOY — Recordatorio enviado', 'TODAY — Reminder sent'),
          todayBookings.filter(b => b.reminderSent),
          t('No hay sesiones hoy con recordatorio', 'No sessions today with reminder')
        )}

        {renderSection(
          t('MAÑANA', 'TOMORROW'),
          tomorrowBookings,
          t('No hay sesiones mañana', 'No sessions tomorrow')
        )}

        {renderSection(
          t('PRÓXIMOS DÍAS', 'UPCOMING DAYS'),
          laterBookings,
          t('No hay más sesiones próximas', 'No more upcoming sessions')
        )}
      </div>

      {/* Setup guide */}
      <div className="border border-white/10 rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-mono text-white/90 uppercase tracking-wider">
          {t('Configuración de recordatorios automáticos', 'Automatic reminders setup')}
        </h3>
        <div className="text-[10px] text-white/50 space-y-1 leading-relaxed">
          <p>1. {t('Ejecuta la migración SQL', 'Run the SQL migration')}: <code className="text-white/90">supabase/migrations/007_add_reminder.sql</code></p>
          <p>2. {t('Despliega la Edge Function', 'Deploy the Edge Function')}: <code className="text-white/90">supabase functions deploy send-reminders --no-verify-jwt</code></p>
          <p>3. {t('Crea una variable de entorno', 'Create an env variable')}: <code className="text-white/90">supabase secrets set CRON_SECRET=tu_clave_secreta</code></p>
          <p>4. {t('En cron-job.org, crea un cron que haga GET a', 'In cron-job.org, create a cron that GETs')}:</p>
          <p className="pl-4 text-[9px] break-all text-white/70 bg-dark-gray p-2 rounded">
            https://[ref].supabase.co/functions/v1/send-reminders<br />
            {t('Header: Authorization: Bearer tu_clave_secreta', 'Header: Authorization: Bearer your_secret_key')}
          </p>
          <p>5. {t('Configura el horario a las 8:00 AM cada día.', 'Set the schedule to 8:00 AM every day.')}</p>
        </div>
        <div className="flex items-center space-x-2 pt-1">
          <ExternalLink size={10} className="text-white/90" />
          <a href="https://cron-job.org" target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/90 underline hover:text-white">
            cron-job.org
          </a>
        </div>
      </div>
    </div>
  );
}
