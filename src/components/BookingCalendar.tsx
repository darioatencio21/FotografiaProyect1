/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  CheckCircle2, 
  Sparkles,
  Phone,
  Mail,
  User,
  Heart,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { Service, ActiveLanguage, Booking, BookingConfig, EmailConfig, PhotographyPackage, ContractData } from '../types';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '../lib/sanitize';
import { formatPrice } from '../config/site';
interface BookingCalendarProps {
  services: Service[];
  lang: ActiveLanguage;
  config?: BookingConfig;
  emailConfig?: EmailConfig;
  preSelectedPackage?: PhotographyPackage | null;
  onClearPackage?: () => void;
  onAddBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => void;
  setNavigationGuard?: (v: boolean) => void;
  onEmailError?: (msg: string) => void;
}

const LOCAL_TRANSLATIONS = {
  es: {
    title: 'DISEÑA TU SESIÓN FOTOGRÁFICA',
    subtitle: 'Completa tus datos y te enviaremos una propuesta artística personalizada.',
    step1: '1. ¿Qué tipo de sesión o paquete te gustaría?',
    step2: '2. ¿Qué día te gustaría agendar?',
    step3: '3. ¿En qué horario prefieres la sesión?',
    step4: '4. Tus datos de contacto',
    customProject: 'Sesión Personalizada / Otro proyecto',
    customProjectPlaceholder: 'Describe brevemente qué tipo de sesión te gustaría realizar (ej: editorial de moda, marca personal, boda de destino)...',
    dateLabel: 'Selecciona la fecha tentativa',
    scheduleLabel: 'Horario preferencial',
    morning: 'Mañana (08:00 - 12:00)',
    afternoon: 'Tarde (12:00 - 17:00)',
    goldenHour: 'Atardecer / Golden Hour (17:00 - 19:30) - Altamente recomendado ✨',
    otherSchedule: 'Otro horario (especificar abajo)',
    otherSchedulePlaceholder: 'Ej: 11:30 AM o sesión nocturna...',
    customScheduleLabel: 'Especifica tu horario preferido',
    successTitle: '¡Solicitud Enviada a la Fotógrafa!',
    successDesc: 'Hemos enviado tu solicitud de reserva a Miriam. Ella revisará la disponibilidad y te enviará un enlace seguro para firmar el contrato y realizar el pago.',
    submit: 'Enviar Solicitud de Reserva',
    submitting: 'ENVIANDO TU SOLICITUD...',
    backToGallery: 'Nueva Solicitud',
    peopleLabel: 'Cantidad de Personas',
    notesLabel: 'Ideas, Locación o Notas Creativas',
    extrasTitle: 'Servicios y Adiciones Exclusivas',
    droneLabel: 'Cinematografía 4K con Drone',
    droneSub: 'Tomas aéreas artísticas con perspectiva cenital y de paisaje',
    expressLabel: 'Entrega Express (48 Horas)',
    expressSub: 'Curaduría digital y retoque editorial de prioridad',
    makeupLabel: 'Maquillaje & Estilismo Profesional',
    makeupSub: 'Asistente de estilismo de moda y cosméticos editoriales',
    estimationTitle: 'Estudio de Presupuesto',
    packagePrefix: 'Paquete:',
    includesPackage: (duration: string) => `Incluye el paquete seleccionado (${duration})`,
    customEstimateText: 'Se definirá un presupuesto a medida basado en tus requerimientos.',
    toBeDefined: 'Por Definir',
    durationFallback: '1-2 Horas',
    sessionTypeFallback: 'Sesión Fotográfica',
    customLabel: 'Personalizado:'
  },
  en: {
    title: 'DESIGN YOUR PHOTOGRAPHIC SESSION',
    subtitle: 'Fill in your details and we will send you a customized artistic proposal.',
    step1: '1. What type of session or package would you like?',
    step2: '2. What day would you like to schedule?',
    step3: '3. What time of day do you prefer?',
    step4: '4. Your contact details',
    customProject: 'Custom Session / Other project',
    customProjectPlaceholder: 'Briefly describe the kind of shoot you have in mind (e.g. fashion editorial, personal branding, destination wedding)...',
    dateLabel: 'Select tentative date',
    scheduleLabel: 'Preferred timeframe',
    morning: 'Morning (08:00 - 12:00)',
    afternoon: 'Afternoon (12:00 - 17:00)',
    goldenHour: 'Sunset / Golden Hour (17:00 - 19:30) - Highly recommended ✨',
    otherSchedule: 'Other timeframe (specify below)',
    otherSchedulePlaceholder: 'E.g. 11:30 AM or night shoot...',
    customScheduleLabel: 'Specify your preferred time',
    successTitle: 'Request Sent to Photographer!',
    successDesc: 'Your booking request has been sent to Miriam. She will review availability and send you a secure link to sign the contract and make the payment.',
    submit: 'Send Booking Request',
    submitting: 'SENDING YOUR REQUEST...',
    backToGallery: 'New Request',
    peopleLabel: 'Number of People',
    notesLabel: 'Ideas, Location or Creative Notes',
    extrasTitle: 'Bespoke Add-ons & Curated Services',
    droneLabel: '4K Drone Cinematography',
    droneSub: 'Bespoke aerial composition and orthogonal landscape mapping',
    expressLabel: 'Priority Delivery (48 Hours)',
    expressSub: 'Priority editorial curation and fast high-end digital delivery',
    makeupLabel: 'Professional Makeup & Styling',
    makeupSub: 'On-set luxury stylist and professional editorial cosmetics',
    estimationTitle: 'Budget Estimate',
    packagePrefix: 'Package:',
    includesPackage: (duration: string) => `Includes the selected package (${duration})`,
    customEstimateText: 'A custom budget will be defined based on your requirements.',
    toBeDefined: 'To Be Defined',
    durationFallback: '1-2 Hours',
    sessionTypeFallback: 'Photography Session',
    customLabel: 'Custom:'
  },
};

export default function BookingCalendar({ services, lang, config: _config, emailConfig, preSelectedPackage, onClearPackage: _onClearPackage, onAddBooking, setNavigationGuard, onEmailError }: BookingCalendarProps) {
  const t = LOCAL_TRANSLATIONS[lang] || LOCAL_TRANSLATIONS.es;

  const BOOKING_DRAFT_KEY = 'booking_draft';

  // Form State
  const [selectedServiceId] = useState<string>(() => sessionStorage.getItem(`${BOOKING_DRAFT_KEY}_service`) || services[0]?.id || 'custom');
  const [customServiceText, setCustomServiceText] = useState<string>(() => sessionStorage.getItem(`${BOOKING_DRAFT_KEY}_customService`) || '');
  const [dateValue, setDateValue] = useState<string>(() => sessionStorage.getItem(`${BOOKING_DRAFT_KEY}_date`) || '');
  const [, setSelectedDate] = useState<Date | null>(null);

  // Timeframe choice
  const [selectedTimeframe, setSelectedTimeframe] = useState<'morning' | 'afternoon' | 'goldenHour' | 'other'>(() => (sessionStorage.getItem(`${BOOKING_DRAFT_KEY}_timeframe`) as any) || 'goldenHour');
  const [customTimeframeText, setCustomTimeframeText] = useState<string>(() => sessionStorage.getItem(`${BOOKING_DRAFT_KEY}_customTime`) || '');

  // Client Details
  const [clientName, setClientName] = useState<string>(() => sessionStorage.getItem(`${BOOKING_DRAFT_KEY}_name`) || '');
  const [clientEmail, setClientEmail] = useState<string>(() => sessionStorage.getItem(`${BOOKING_DRAFT_KEY}_email`) || '');
  const [clientPhone, setClientPhone] = useState<string>(() => sessionStorage.getItem(`${BOOKING_DRAFT_KEY}_phone`) || '');
  const [peopleCount, setPeopleCount] = useState<number>(() => {
    const saved = sessionStorage.getItem(`${BOOKING_DRAFT_KEY}_people`);
    return saved ? parseInt(saved, 10) : 1;
  });
  const [creativeNotes, setCreativeNotes] = useState<string>(() => sessionStorage.getItem(`${BOOKING_DRAFT_KEY}_notes`) || '');
  
  // Wedding-specific fields (only shown for boda packages)
  const isWedding = preSelectedPackage?.category === 'boda';
  const [weddingData, setWeddingData] = useState<ContractData>({
    brideName: '', groomName: '', brideEmail: '', groomPhone: '', brideAddress: '',
    ceremonyLocation: '', ceremonyAddress: '', ceremonyStart: '', ceremonyEnd: '',
    receptionLocation: '', receptionAddress: '', receptionStart: '', receptionEnd: '',
  });

  // Honeypot for anti-spam
  const [bookingHoneypot, setBookingHoneypot] = useState<string>('');

  // Flow State
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [weddingError, setWeddingError] = useState<string>('');

  // Warn before leaving if form has data
  const formHasData = clientName || clientEmail || clientPhone || dateValue || creativeNotes || customServiceText || customTimeframeText;
  const shouldWarn = Boolean(formHasData);
  useEffect(() => {
    setNavigationGuard?.(shouldWarn);
    if (!shouldWarn) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
      setNavigationGuard?.(false);
    };
  }, [shouldWarn, setNavigationGuard]);

  useEffect(() => {
    if (step === 'success') return;
    sessionStorage.setItem(`${BOOKING_DRAFT_KEY}_service`, selectedServiceId);
    sessionStorage.setItem(`${BOOKING_DRAFT_KEY}_customService`, customServiceText);
    sessionStorage.setItem(`${BOOKING_DRAFT_KEY}_date`, dateValue);
    sessionStorage.setItem(`${BOOKING_DRAFT_KEY}_timeframe`, selectedTimeframe);
    sessionStorage.setItem(`${BOOKING_DRAFT_KEY}_customTime`, customTimeframeText);
    sessionStorage.setItem(`${BOOKING_DRAFT_KEY}_name`, clientName);
    sessionStorage.setItem(`${BOOKING_DRAFT_KEY}_email`, clientEmail);
    sessionStorage.setItem(`${BOOKING_DRAFT_KEY}_phone`, clientPhone);
    sessionStorage.setItem(`${BOOKING_DRAFT_KEY}_people`, String(peopleCount));
    sessionStorage.setItem(`${BOOKING_DRAFT_KEY}_notes`, creativeNotes);
  }, [selectedServiceId, customServiceText, dateValue, selectedTimeframe, customTimeframeText, clientName, clientEmail, clientPhone, peopleCount, creativeNotes, step]);

  // Pricing Calculation
  const selectedService = services.find(s => s.id === selectedServiceId);
  const basePrice = preSelectedPackage ? preSelectedPackage.price : (selectedService ? selectedService.price : 0);
  const totalPrice = basePrice;
  // Handle Date Selection Input
  const handleDateChange = (val: string) => {
    setDateValue(val);
    if (val) {
      const [year, month, day] = val.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
    } else {
      setSelectedDate(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bookingHoneypot) return;

    const safeName = sanitizeString(clientName);
    const safeEmail = sanitizeEmail(clientEmail);
    const safePhone = sanitizePhone(clientPhone);
    const safeNotes = sanitizeString(creativeNotes);
    const safeCustomService = sanitizeString(customServiceText);
    const safeCustomTime = sanitizeString(customTimeframeText);

    if (!safeName || !safeEmail || !safePhone || !dateValue) return;

    if (isWedding) {
      const campos: (keyof ContractData)[] = [
        'brideName','groomName','brideEmail','groomPhone','brideAddress',
        'ceremonyLocation','ceremonyAddress','ceremonyStart','ceremonyEnd',
        'receptionLocation','receptionAddress','receptionStart','receptionEnd'
      ];
      const faltan = campos.filter(k => !weddingData[k]?.trim());
      if (faltan.length > 0) {
        setWeddingError(lang === 'en' ? 'Please fill in all wedding details' : 'Completa todos los campos de la boda');
        return;
      }
    }
    setWeddingError('');
    setIsSyncing(true);

    let finalSchedule = '';
    if (selectedTimeframe === 'morning') finalSchedule = t.morning;
    else if (selectedTimeframe === 'afternoon') finalSchedule = t.afternoon;
    else if (selectedTimeframe === 'goldenHour') finalSchedule = t.goldenHour;
    else finalSchedule = safeCustomTime ? `${t.customLabel} ${safeCustomTime}` : t.otherSchedule;

    const serviceName = preSelectedPackage
      ? (lang === 'es' ? preSelectedPackage.name_es : preSelectedPackage.name_en)
      : selectedServiceId === 'custom' 
        ? `${t.customLabel} ${safeCustomService || 'General'}` 
        : (selectedService?.title || t.sessionTypeFallback);

    const formattedDate = dateValue;
    const notesText = safeNotes + 
           `\n\n[Solicitud de Reserva]` +
           `\n- Paquete elegido: ${serviceName}` +
           `\n- Fecha solicitada: ${formattedDate}` +
           `\n- Horario preferido: ${finalSchedule}`;

    let emailFailed = false;
    if (emailConfig) {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const { getAuthHeaders } = await import('../lib/email');
        const sendFn = async (to: string, subject: string, text: string) => {
          if (!supabaseUrl) return;
          const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({ to, subject, html: text.replace(/\n/g, '<br>'), text }),
          });
          if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`send-email ${res.status}: ${errBody}`);
          }
        };

        const isEn = lang === 'en';
        const photographerSubject = isEn
          ? `New booking request — ${serviceName}`
          : `Nueva solicitud de reserva — ${serviceName}`;
        const photographerText = isEn
          ? `New booking request received:

Client: ${safeName}
Email: ${safeEmail}
Phone: ${safePhone}
Package: ${serviceName}
Date: ${formattedDate}
Time: ${finalSchedule}
Guests: ${peopleCount}
Estimated Total: ${totalPrice > 0 ? formatPrice(totalPrice, lang) : 'TBD'}

Client notes:
${safeNotes || 'No notes'}`
          : `Nueva solicitud de reserva recibida:

Cliente: ${safeName}
Email: ${safeEmail}
Teléfono: ${safePhone}
Paquete: ${serviceName}
Fecha: ${formattedDate}
Horario: ${finalSchedule}
Personas: ${peopleCount}
Total Estimado: ${totalPrice > 0 ? formatPrice(totalPrice, lang) : 'A Definir'}

Notas del cliente:
${safeNotes || 'Sin notas'}`;

        await sendFn(emailConfig.receiverEmail || safeEmail, photographerSubject, photographerText);

        if (emailConfig.enableAutoResponse) {
          const autoSubject = isEn
            ? (emailConfig.autoReplySubject || 'Your request has been received! - Miriam Tellez Photography')
            : (emailConfig.autoReplySubject || '¡Tu solicitud ha sido recibida con éxito! - Miriam Tellez Photography');
          const autoMessage = isEn
            ? (emailConfig.autoReplyMessage || 'Thank you for your preference. We will contact you soon.')
            : (emailConfig.autoReplyMessage || 'Gracias por tu preferencia. Te contactaremos pronto.');

          const greeting = isEn ? 'Hi' : 'Hola';
          const summaryTitle = isEn ? 'Summary of your request:' : 'Resumen de tu solicitud:';
          const packageLabel = isEn ? 'Package' : 'Paquete';
          const dateLabel = isEn ? 'Tentative date' : 'Fecha tentativa';
          const timeLabel = isEn ? 'Preferred time' : 'Horario preferido';
          const guestsLabel = isEn ? 'Guests' : 'Personas';
          const totalLabel = isEn ? 'Estimated total' : 'Total estimado';
          const totalVal = totalPrice > 0 ? formatPrice(totalPrice, lang) : (isEn ? 'To be defined' : 'A Definir');
          const closing = isEn ? 'Best regards,\nMiriam Tellez' : 'Saludos,\nMiriam Tellez';

          await sendFn(safeEmail, autoSubject, `${greeting} ${safeName},

${autoMessage}

${summaryTitle}
- ${packageLabel}: ${serviceName}
- ${dateLabel}: ${formattedDate}
- ${timeLabel}: ${finalSchedule}
- ${guestsLabel}: ${peopleCount}
- ${totalLabel}: ${totalVal}

${closing}`);
        }
      } catch (err) {
        console.error('[booking] email notification failed:', err);
        emailFailed = true;
      }
    }

    if (emailFailed) {
      onEmailError?.(lang === 'en'
        ? 'Booking saved but email notification failed. Please try again later or contact us directly.'
        : 'Reserva guardada pero la notificación por email falló. Intentá de nuevo o contactanos directamente.');
    }

    setIsSyncing(false);

    const contractData: ContractData = isWedding
      ? weddingData
      : { brideName: safeName, brideEmail: safeEmail, groomPhone: safePhone, groomName: '', brideAddress: '', ceremonyLocation: '', ceremonyAddress: '', ceremonyStart: '', ceremonyEnd: '', receptionLocation: '', receptionAddress: '', receptionStart: '', receptionEnd: '' };
    const contractType = isWedding ? 'wedding' : 'session';
    const depositAmt = Math.round(totalPrice * 0.3);

    onAddBooking({
      clientName: safeName,
      clientEmail: safeEmail,
      clientPhone: safePhone,
      date: formattedDate,
      timeSlot: finalSchedule,
      serviceId: selectedServiceId,
      peopleCount,
      notes: notesText,
      amount: totalPrice,
      packageName: preSelectedPackage
        ? (lang === 'es' ? preSelectedPackage.name_es : preSelectedPackage.name_en)
        : undefined,
      packageDetails: preSelectedPackage
        ? (lang === 'es' ? preSelectedPackage.description_es : preSelectedPackage.description_en)
        : undefined,
      contractData,
      contractType,
      depositAmount: depositAmt,
      amountDue: Math.max(0, totalPrice - depositAmt),
    });

    sessionStorage.removeItem(BOOKING_DRAFT_KEY + '_service');
    sessionStorage.removeItem(BOOKING_DRAFT_KEY + '_customService');
    sessionStorage.removeItem(BOOKING_DRAFT_KEY + '_date');
    sessionStorage.removeItem(BOOKING_DRAFT_KEY + '_timeframe');
    sessionStorage.removeItem(BOOKING_DRAFT_KEY + '_customTime');
    sessionStorage.removeItem(BOOKING_DRAFT_KEY + '_name');
    sessionStorage.removeItem(BOOKING_DRAFT_KEY + '_email');
    sessionStorage.removeItem(BOOKING_DRAFT_KEY + '_phone');
    sessionStorage.removeItem(BOOKING_DRAFT_KEY + '_people');
    sessionStorage.removeItem(BOOKING_DRAFT_KEY + '_notes');

    setStep('success');
  };

  return (
    <div className="glass-premium rounded-lg border border-white/10 p-6 md:p-8 max-w-4xl mx-auto shadow-2xl">
      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Honeypot — invisible to humans, catches bots */}
            <div aria-hidden="true" className="absolute opacity-0 pointer-events-none" style={{ height: 0, overflow: 'hidden' }}>
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={bookingHoneypot}
                onChange={(e) => setBookingHoneypot(e.target.value)}
              />
            </div>

            {/* INTRO SPEECH */}
            <div className="text-center pb-2 border-b border-white/10 max-w-2xl mx-auto space-y-1.5">
              <h3 className="font-serif text-xl md:text-2xl text-white/80">
                {t.title}
              </h3>
              <p className="text-[11px] md:text-xs text-white/50 leading-relaxed font-sans">
                {t.subtitle}
              </p>
            </div>



            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              
              {/* TWO COLUMN ROW: DATE AND PREFERRED TIMEFRAME */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* QUESTION 2: PREFERRED DATE */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono tracking-widest text-white/60 uppercase">
                    {t.step2}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/70">
                      <CalendarIcon size={14} />
                    </div>
                    <input
                      type="date"
                      required
                      value={dateValue}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-dark/60 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-xs text-white/95 placeholder-white/20 focus:outline-none focus:border-white/30 transition-all font-mono"
                    />
                  </div>
                  <span className="text-[9px] text-white/30 block">
                    *Puedes cambiar la fecha libremente más adelante con nuestro equipo.
                  </span>
                </div>

                {/* QUESTION 3: PREFERRED TIMEFRAME */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono tracking-widest text-white/60 uppercase">
                    {t.step3}
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTimeframe('morning')}
                      className={`py-2 px-3 rounded-lg text-[10px] font-mono text-left border flex items-center space-x-2 transition-all ${
                        selectedTimeframe === 'morning'
                          ? 'bg-white/5 border-white/20 text-white/60 font-bold'
                          : 'bg-dark/40 border-white/10 text-white/60 hover:border-white/15'
                      }`}
                    >
                      <Clock size={11} className="text-white/70" />
                      <span className="truncate">Mañana</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTimeframe('afternoon')}
                      className={`py-2 px-3 rounded-lg text-[10px] font-mono text-left border flex items-center space-x-2 transition-all ${
                        selectedTimeframe === 'afternoon'
                          ? 'bg-white/5 border-white/20 text-white/60 font-bold'
                          : 'bg-dark/40 border-white/10 text-white/60 hover:border-white/15'
                      }`}
                    >
                      <Clock size={11} className="text-white/70" />
                      <span className="truncate">Tarde</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTimeframe('goldenHour')}
                      className={`py-2 px-3 rounded-lg text-[10px] font-mono text-left border flex items-center space-x-2 transition-all col-span-2 ${
                        selectedTimeframe === 'goldenHour'
                          ? 'bg-white/5 border-white/20 text-white/60 font-bold shadow-sm'
                          : 'bg-dark/40 border-white/10 text-white/60 hover:border-white/15'
                      }`}
                    >
                      <Heart size={11} className="text-red-400 fill-red-400/10 animate-pulse shrink-0" />
                      <span className="truncate">Atardecer / Golden Hour (Recomendado ✨)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTimeframe('other')}
                      className={`py-2 px-3 rounded-lg text-[10px] font-mono text-left border flex items-center space-x-2 transition-all col-span-2 ${
                        selectedTimeframe === 'other'
                          ? 'bg-white/5 border-white/20 text-white/60 font-bold'
                          : 'bg-dark/40 border-white/10 text-white/60 hover:border-white/15'
                      }`}
                    >
                      <Sparkles size={11} className="text-white/70" />
                      <span>Elegir horario personalizado / exacto</span>
                    </button>
                  </div>

                  {/* Custom Schedule Input */}
                  <AnimatePresence>
                    {selectedTimeframe === 'other' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pt-1"
                      >
                        <input
                          type="text"
                          required
                          value={customTimeframeText}
                          onChange={(e) => setCustomTimeframeText(e.target.value)}
                          placeholder={t.otherSchedulePlaceholder}
                          className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30 font-sans"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* QUESTION 4: CONTACT DATA AND REGISTRATION FORM */}
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-mono tracking-widest text-white/60 uppercase">
                  {t.step4}
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/40">
                      <User size={12} />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Nombre Completo *"
                      className="w-full bg-dark/60 border border-white/10 rounded-lg pl-9 pr-3 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/40">
                      <Mail size={12} />
                    </div>
                    <input
                      type="email"
                      required
                      maxLength={50}
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="Correo Electrónico *"
                      className="w-full bg-dark/60 border border-white/10 rounded-lg pl-9 pr-3 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans"
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/40">
                      <Phone size={12} />
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={20}
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder={lang === 'es' ? 'Número de Teléfono *' : 'Phone Number *'}
                      className="w-full bg-dark/60 border border-white/10 rounded-lg pl-9 pr-3 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* People Count */}
                  <div className="md:col-span-1 relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/40">
                      <Users size={12} />
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="150"
                      required
                      value={peopleCount}
                      onChange={(e) => setPeopleCount(Number(e.target.value))}
                      placeholder={t.peopleLabel}
                      className="w-full bg-dark/60 border border-white/10 rounded-lg pl-9 pr-3 py-3 text-xs text-white/90 focus:outline-none focus:border-white/30 font-sans"
                    />
                  </div>

                  {/* Notes / Ideas */}
                  <div className="md:col-span-3">
                    <textarea
                      rows={2}
                      maxLength={150}
                      value={creativeNotes}
                      onChange={(e) => setCreativeNotes(e.target.value)}
                      placeholder={t.notesLabel}
                      className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30 font-sans resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* WEDDING DETAILS (only for boda packages) */}
              {isWedding && (
                <div className="space-y-4 pt-2 border-t border-white/10">
                  <label className="block text-xs font-mono tracking-widest text-white/60 uppercase">
                    {lang === 'es' ? 'Detalles de la Boda' : 'Wedding Details'}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 p-4 border border-white/10 rounded-lg">
                      <p className="text-[10px] font-mono tracking-widest text-white/70 uppercase">
                        {lang === 'es' ? 'Novia' : 'Bride'}
                      </p>
                      <input type="text" required maxLength={15} placeholder={lang === 'es' ? 'Nombre de la Novia' : 'Bride Name'} value={weddingData.brideName} onChange={(e) => setWeddingData({...weddingData, brideName: e.target.value})} className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                      <input type="email" required maxLength={50} placeholder={lang === 'es' ? 'Correo de la Novia' : 'Bride Email'} value={weddingData.brideEmail} onChange={(e) => setWeddingData({...weddingData, brideEmail: e.target.value})} className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                      <input type="text" required maxLength={100} placeholder={lang === 'es' ? 'Dirección de la Novia' : 'Bride Address'} value={weddingData.brideAddress} onChange={(e) => setWeddingData({...weddingData, brideAddress: e.target.value})} className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                    </div>
                    <div className="space-y-3 p-4 border border-white/10 rounded-lg">
                      <p className="text-[10px] font-mono tracking-widest text-white/70 uppercase">
                        {lang === 'es' ? 'Novio' : 'Groom'}
                      </p>
                      <input type="text" required placeholder={lang === 'es' ? 'Nombre del Novio' : 'Groom Name'} value={weddingData.groomName} onChange={(e) => setWeddingData({...weddingData, groomName: e.target.value})} className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                      <input type="tel" required placeholder={lang === 'es' ? 'Teléfono del Novio' : 'Groom Phone'} value={weddingData.groomPhone} onChange={(e) => setWeddingData({...weddingData, groomPhone: e.target.value})} className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 p-4 border border-white/10 rounded-lg">
                      <p className="text-[10px] font-mono tracking-widest text-white/70 uppercase">
                        {lang === 'es' ? 'Ceremonia' : 'Ceremony'}
                      </p>
                      <input type="text" required placeholder={lang === 'es' ? 'Lugar' : 'Location'} value={weddingData.ceremonyLocation} onChange={(e) => setWeddingData({...weddingData, ceremonyLocation: e.target.value})} className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                      <input type="text" required placeholder={lang === 'es' ? 'Dirección' : 'Address'} value={weddingData.ceremonyAddress} onChange={(e) => setWeddingData({...weddingData, ceremonyAddress: e.target.value})} className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                      <div className="flex gap-2">
                        <input type="time" required placeholder={lang === 'es' ? 'Inicio' : 'Start'} value={weddingData.ceremonyStart} onChange={(e) => setWeddingData({...weddingData, ceremonyStart: e.target.value})} className="w-1/2 bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                        <input type="time" required placeholder={lang === 'es' ? 'Fin' : 'End'} value={weddingData.ceremonyEnd} onChange={(e) => setWeddingData({...weddingData, ceremonyEnd: e.target.value})} className="w-1/2 bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                      </div>
                    </div>
                    <div className="space-y-3 p-4 border border-white/10 rounded-lg">
                      <p className="text-[10px] font-mono tracking-widest text-white/70 uppercase">
                        {lang === 'es' ? 'Recepción' : 'Reception'}
                      </p>
                      <input type="text" required placeholder={lang === 'es' ? 'Lugar' : 'Location'} value={weddingData.receptionLocation} onChange={(e) => setWeddingData({...weddingData, receptionLocation: e.target.value})} className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                      <input type="text" required placeholder={lang === 'es' ? 'Dirección' : 'Address'} value={weddingData.receptionAddress} onChange={(e) => setWeddingData({...weddingData, receptionAddress: e.target.value})} className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                      <div className="flex gap-2">
                        <input type="time" required placeholder={lang === 'es' ? 'Inicio' : 'Start'} value={weddingData.receptionStart} onChange={(e) => setWeddingData({...weddingData, receptionStart: e.target.value})} className="w-1/2 bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                        <input type="time" required placeholder={lang === 'es' ? 'Fin' : 'End'} value={weddingData.receptionEnd} onChange={(e) => setWeddingData({...weddingData, receptionEnd: e.target.value})} className="w-1/2 bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {weddingError && (
                <p className="text-[10px] text-red-400 font-mono text-center">{weddingError}</p>
              )}

              {/* ESTIMATION & QUOTE SUMMARY */}
              <div className="bg-dark-gray/60 border border-white/10 rounded-lg p-4 space-y-2 mt-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider block">{t.estimationTitle}</span>
                    <span className="text-xs text-white/80 font-sans font-medium mt-0.5 block">
                      {preSelectedPackage
                        ? `${t.packagePrefix} ${lang === 'es' ? preSelectedPackage.name_es : preSelectedPackage.name_en}`
                        : selectedServiceId === 'custom' 
                          ? t.customEstimateText
                          : t.includesPackage((lang === 'es' ? selectedService?.duration_es : selectedService?.duration_en) || t.durationFallback)
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center font-mono text-xl font-semibold text-white/70">
                    {selectedServiceId === 'custom' && !preSelectedPackage ? (
                      <span className="text-sm tracking-wider uppercase bg-white/10 px-3 py-1 rounded border border-white/10">{t.toBeDefined}</span>
                    ) : (
                      <span>{formatPrice(totalPrice, lang)}</span>
                    )}
                  </div>
                </div>
                {preSelectedPackage && (lang === 'es' ? preSelectedPackage.travelNote_es : preSelectedPackage.travelNote_en) && (
                  <div className="flex items-start space-x-2 text-[10px] text-white/40 border-t border-white/10 pt-2">
                    <MapPin size={11} className="text-white/30 mt-0.5 shrink-0" />
                    <span className="font-sans">{lang === 'es' ? preSelectedPackage.travelNote_es : preSelectedPackage.travelNote_en}</span>
                  </div>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSyncing || !dateValue}
                className="w-full py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 font-mono text-xs tracking-widest uppercase font-bold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                    <span>{t.submitting}</span>
                  </>
                ) : (
                  <>
                    <ChevronRight size={14} className="animate-pulse" />
                    <span>{t.submit}</span>
                  </>
                )}
              </button>

            </div>
          </form>
          ) : (
          /* SUCCESS STATE */
          <motion.div
            className="py-12 px-6 text-center max-w-md mx-auto space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="inline-flex p-4 rounded-full bg-white/10 border border-white/10 text-white/70 mx-auto">
              <CheckCircle2 size={48} className="animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl text-white/90 tracking-wide">
                {t.successTitle}
              </h3>
            </div>
            <p className="text-xs text-white/70 font-sans leading-relaxed">
              {t.successDesc}
              {emailConfig?.enableAutoResponse && (
                <> Hemos enviado un acuse de recibo a <strong className="text-white">{clientEmail}</strong>.</>
              )}
            </p>

            <div className="border-t border-white/10 pt-5 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setWeddingError('');
                  setDateValue('');
                  setSelectedDate(null);
                  setClientName('');
                  setClientEmail('');
                  setClientPhone('');
                  setCreativeNotes('');
                  setCustomServiceText('');
                  setCustomTimeframeText('');
                }}
                className="py-2.5 px-6 border border-white/15 hover:border-white/30 hover:text-white text-white/80 rounded-lg font-mono text-[10px] tracking-widest uppercase transition-all"
              >
                {t.backToGallery}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
