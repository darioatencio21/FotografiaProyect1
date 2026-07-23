/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  CheckCircle2, 
  DollarSign, 
  Camera, 
  Sparkles,
  Phone,
  Mail,
  User,
  Heart,
  ChevronRight,
  MapPin,
  Printer
} from 'lucide-react';
import { Service, ActiveLanguíage, Booking, BookingConfig, EmailConfig, PhotographyPackage, ContractData, Invoice } from '../types';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '../lib/sanitize';
import ContractView from './ContractView';
import InvoiceReceipt from './InvoiceReceipt';
import { PaymentResult } from './StripeCheckout';
import { TRANSLATIONS } from '../data/mockData';

interface BookingCalendarProps {
  services: Service[];
  lang: ActiveLanguíage;
  config?: BookingConfig;
  emailConfig?: EmailConfig;
  preSelectedPackage?: PhotographyPackage | null;
  onClearPackage?: () => void;
  onCheckout?: (amount: number, description: string, onDone: (result?: PaymentResult) => void, onCancel?: () => void) => void;
  onAddBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => void;
  onInvoiceCreated?: (invoice: Invoice) => void;
  setNavigationGuard?: (v: boolean) => void;
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
    successDesc: 'Hemos enviado tu solicitud de reserva a Miriam. En las próximas horas se pondrá en contacto contigo para coordinar los detalles finales.',
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
    makeupSub: 'Asistente de estilismo de moda y cosméticos editoriales'
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
    successDesc: 'Your booking request has been sent to Miriam. She will contact you shortly to coordinate the final details.',
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
    makeupSub: 'On-set luxury stylist and professional editorial cosmetics'
  },
};

export default function BookingCalendar({ services, lang, config, emailConfig, preSelectedPackage, onClearPackage, onCheckout, onAddBooking, onInvoiceCreated, setNavigationGuard }: BookingCalendarProps) {
  const t = LOCAL_TRANSLATIONS[lang] || LOCAL_TRANSLATIONS.es;

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || 'custom');
  const [customServiceText, setCustomServiceText] = useState<string>('');
  const [dateValue, setDateValue] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Timeframe choice
  const [selectedTimeframe, setSelectedTimeframe] = useState<'morning' | 'afternoon' | 'goldenHour' | 'other'>('goldenHour');
  const [customTimeframeText, setCustomTimeframeText] = useState<string>('');

  // Client Details
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [creativeNotes, setCreativeNotes] = useState<string>('');
  
  // Wedding-specific fields (only shown for boda packages)
  const isWedding = preSelectedPackage?.category === 'boda';
  const [weddingData, setWeddingData] = useState<ContractData>({
    brideName: '', groomName: '', brideEmail: '', groomPhone: '', brideAddress: '',
    ceremonyLocation: '', ceremonyAddress: '', ceremonyStart: '', ceremonyEnd: '',
    receptionLocation: '', receptionAddress: '', receptionStart: '', receptionEnd: '',
  });

  // Flow State
  const [step, setStep] = useState<'form' | 'payment' | 'contract' | 'success'>('form');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);
  const [weddingError, setWeddingError] = useState<string>('');
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  // Warn before leaving if form has data or invoice is showing
  const formHasData = clientName || clientEmail || clientPhone || dateValue || creativeNotes || customServiceText || customTimeframeText;
  const shouldWarn = formHasData || createdInvoice !== null;
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

  // Pricing Calculation
  const selectedService = services.find(s => s.id === selectedServiceId);
  const basePrice = preSelectedPackage ? preSelectedPackage.price : (selectedService ? selectedService.price : 0);
  const totalPrice = basePrice;
  const depositAmount = totalPrice > 0
    ? Math.min(preSelectedPackage?.deposit || Math.round(totalPrice / 2), totalPrice)
    : 0;
  const bookingId = useMemo(() => `AUREA-${Math.floor(Math.random() * 8999 + 1000)}`, []);

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
    setPaymentCancelled(false);

    setIsSyncing(true);

    let finalSchedule = '';
    if (selectedTimeframe === 'morning') finalSchedule = t.morning;
    else if (selectedTimeframe === 'afternoon') finalSchedule = t.afternoon;
    else if (selectedTimeframe === 'goldenHour') finalSchedule = t.goldenHour;
    else finalSchedule = safeCustomTime ? `Personalizado: ${safeCustomTime}` : t.otherSchedule;

    const serviceName = preSelectedPackage
      ? (lang === 'es' ? preSelectedPackage.name_es : preSelectedPackage.name_en)
      : selectedServiceId === 'custom' 
        ? `Personalizado (${safeCustomService || 'General'})` 
        : (selectedService?.title || 'Sesión Fotográfica');

    const formattedDate = dateValue;
    const notesText = safeNotes + 
           `\n\n[Solicitud de Reserva]` +
           `\n- Paquete elegido: ${serviceName}` +
           `\n- Fecha solicitada: ${formattedDate}` +
           `\n- Horario preferido: ${finalSchedule}`;

    if (emailConfig && emailConfig.emailjsServiceId && emailConfig.emailjsTemplateId && emailConfig.emailjsPublicKey) {
      try {
        const emailjs = await import('@emailjs/browser');

        await emailjs.send(
          emailConfig.emailjsServiceId,
          emailConfig.emailjsTemplateId,
          {
            to_name: 'Miriam Campos',
            to_email: emailConfig.receiverEmail || safeEmail,
            from_name: safeName,
            from_email: safeEmail,
            message: notesText,
            booking_details: `Servicio: ${serviceName} - Fecha: ${formattedDate} - Horario: ${finalSchedule} - Personas: ${peopleCount} - Total Estimado: $${totalPrice > 0 ? totalPrice : 'A Definir'}`
          },
          emailConfig.emailjsPublicKey
        );

        if (emailConfig.enableAutoResponse) {
          const autoTemplateId = emailConfig.emailjsAutoTemplateId || emailConfig.emailjsTemplateId;
          const autoSubject = emailConfig.autoReplySubject || '¡Tu solicitud ha sido recibida con éxito! - Aurea Studio';
          const autoMessage = emailConfig.autoReplyMessage || 'Gracias por tu preferencia.';

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
              from_name: 'Miriam Campos - Aurea Studio',
              from_email: emailConfig.receiverEmail,
              reply_subject: autoSubject,
              subject: autoSubject,
              autoReplySubject: autoSubject,
              reply_message: autoMessage,
              message: autoMessage,
              autoReplyMessage: autoMessage,
              booking_details: `Servicio: ${serviceName} - Fecha: ${formattedDate} - Horario: ${finalSchedule} - Personas: ${peopleCount} - Total Estimado: $${totalPrice > 0 ? totalPrice : 'A Definir'}`
            },
            emailConfig.emailjsPublicKey
          );
        }
      } catch (err) {
        console.error('Could not send email notifications via EmailJS:', err);
      }
    }

    setIsSyncing(false);

    const baseBooking = {
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
    };

    const contractData: ContractData = isWedding
      ? weddingData
      : { brideName: safeName, brideEmail: safeEmail, groomPhone: safePhone, groomName: '', brideAddress: '', ceremonyLocation: '', ceremonyAddress: '', ceremonyStart: '', ceremonyEnd: '', receptionLocation: '', receptionAddress: '', receptionStart: '', receptionEnd: '' };
    const contractType = isWedding ? 'wedding' : 'session';
    const depositAmt = totalPrice > 0
      ? Math.min(preSelectedPackage?.deposit || Math.round(totalPrice / 2), totalPrice)
      : 0;

    // Custom projects need a quote before any payment can be collected.
    if (totalPrice <= 0) {
      onAddBooking({ ...baseBooking, contractData, contractType, depositAmount: 0, amountDue: 0, isPaid: false });
      setStep('success');
      return;
    }

    setPendingBooking({
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...baseBooking,
      contractData,
      contractType,
      depositAmount: depositAmt,
      amountDue: Math.max(0, totalPrice - depositAmt),
    });
    setStep('payment');
  };

  const handleSignContract = (signature: string) => {
    if (!pendingBooking) return;
    const now = new Date().toISOString();
    const invNumber = `INV-${now.substring(0, 7).replace('-', '')}-${String(Math.floor(Math.random() * 8999 + 1000)).padStart(4, '0')}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      bookingId: bookingId,
      invoiceNumber: invNumber,
      clientName: pendingBooking.clientName,
      clientEmail: pendingBooking.clientEmail,
      packageName: pendingBooking.packageName || 'Photography Session',
      items: [
        { description: pendingBooking.packageName || 'Photography Session', amount: pendingBooking.amount || 0 },
      ],
      subtotal: pendingBooking.amount || 0,
      depositPaid: depositAmount,
      total: pendingBooking.amount || 0,
      amountPaid: depositAmount,
       balanceDue: pendingBooking.amountDue ?? Math.max(0, (pendingBooking.amount || 0) - depositAmount),
      status: depositAmount >= (pendingBooking.amount || 0) ? 'paid' : 'partial',
       paymentMethod: paymentResult?.paymentMethod || 'Credit Card (Stripe)',
       stripeTxHash: paymentResult?.txHash || '',
      createdAt: now,
      paidAt: now,
    };
    onInvoiceCreated?.(newInvoice);
    setCreatedInvoice(newInvoice);
    onAddBooking({
      ...pendingBooking,
      contractSignature: signature,
      contractSignedAt: now,
      isPaid: depositAmount > 0,
      amountDue: pendingBooking.amountDue ?? Math.max(0, (pendingBooking.amount || 0) - depositAmount),
      invoiceId: newInvoice.id,
    });
    setStep('success');
  };

  return (
    <div className="glass-premium rounded-lg border border-white/10 p-6 md:p-8 max-w-4xl mx-auto shadow-2xl">
      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* INTRO SPEECH */}
            <div className="text-center pb-2 border-b border-white/10 max-w-2xl mx-auto space-y-1.5">
              <h3 className="font-serif text-xl md:text-2xl text-white/80">
                {t.title}
              </h3>
              <p className="text-[11px] md:text-xs text-white/50 leading-relaxed font-sans">
                {t.subtitle}
              </p>
            </div>

            {paymentCancelled && (
              <div className="text-center py-2 px-4 rounded-lg bg-white/10 border border-white/10">
                <p className="text-[11px] font-mono text-white/60">
                  {lang === 'en'
                    ? 'Payment was cancelled — you can try again below.'
                    : 'Pago cancelado — puedes intentar de nuevo abajo.'}
                </p>
              </div>
            )}

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
                      <input type="text" required placeholder={lang === 'es' ? 'Nombre de la Novia' : 'Bride Name'} value={weddingData.brideName} onChange={(e) => setWeddingData({...weddingData, brideName: e.target.value})} className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                      <input type="email" required placeholder={lang === 'es' ? 'Correo de la Novia' : 'Bride Email'} value={weddingData.brideEmail} onChange={(e) => setWeddingData({...weddingData, brideEmail: e.target.value})} className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
                      <input type="text" required placeholder={lang === 'es' ? 'Dirección de la Novia' : 'Bride Address'} value={weddingData.brideAddress} onChange={(e) => setWeddingData({...weddingData, brideAddress: e.target.value})} className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans" />
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
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider block">Estudio de Presupuesto</span>
                    <span className="text-xs text-white/80 font-sans font-medium mt-0.5 block">
                      {preSelectedPackage
                        ? `Paquete: ${lang === 'es' ? preSelectedPackage.name_es : preSelectedPackage.name_en}`
                        : selectedServiceId === 'custom' 
                          ? 'Se definirá un presupuesto a medida basado en tus requerimientos.' 
                          : `Incluye el paquete seleccionado (${selectedService?.duration || '1-2 Horas'})`
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 font-mono text-xl font-semibold text-white/70">
                    {preSelectedPackage ? (
                      <>
                        <DollarSign size={18} className="-mr-1 text-white/70" />
                        <span>{totalPrice.toLocaleString()}</span>
                      </>
                    ) : selectedServiceId === 'custom' ? (
                      <span className="text-sm tracking-wider uppercase bg-white/10 px-3 py-1 rounded border border-white/10">Por Definir</span>
                    ) : (
                      <>
                        <DollarSign size={18} className="-mr-1 text-white/70" />
                        <span>{totalPrice.toLocaleString()}</span>
                      </>
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
          ) : step === 'payment' && pendingBooking ? (
          <motion.div
            className="py-12 px-6 text-center max-w-md mx-auto space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex p-4 rounded-full bg-white/10 border border-white/10 text-white/70 mx-auto">
              <DollarSign size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl text-white/90 tracking-wide">
                {lang === 'en' ? 'Secure Your Date' : 'Asegura tu Fecha'}
              </h3>
              <p className="text-[11px] text-white/60">
                {lang === 'en'
                  ? 'A deposit is required to confirm your booking. You can pay the remaining balance later.'
                  : 'Se requiere un depósito para confirmar tu reserva. Puedes pagar el resto después.'}
              </p>
            </div>
            <div className="bg-dark/40 border border-white/10 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-xs text-white/70">
                <span>{lang === 'en' ? 'Package' : 'Paquete'}</span>
                <span className="font-semibold text-white">{pendingBooking.packageName || '—'}</span>
              </div>
              <div className="flex justify-between text-xs text-white/70">
                <span>{lang === 'en' ? 'Total' : 'Total'}</span>
                <span className="font-semibold text-white">${pendingBooking.amount || 0}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                <span className="text-white/70 font-semibold">{lang === 'en' ? 'Deposit Required' : 'Depósito Requerido'}</span>
                <span className="font-serif text-xl text-white/90">${depositAmount}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="py-2.5 px-5 border border-white/15 hover:border-white/30 text-white/70 rounded-lg font-mono text-[10px] tracking-widest uppercase transition-all"
              >
                {lang === 'en' ? 'Back' : 'Volver'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onCheckout?.(
                    depositAmount,
                    `${pendingBooking.packageName || 'Photography Session'} — Deposit (${pendingBooking.clientName})`,
                     (result) => { setPaymentResult(result || null); setStep('contract'); },
                    () => { setStep('form'); setPaymentCancelled(true); }
                  );
                }}
                className="py-2.5 px-6 bg-white/10 hover:bg-white/15 text-white border border-white/10 font-mono text-xs tracking-widest uppercase font-semibold rounded-lg transition-all"
              >
                {lang === 'en' ? `Pay $${depositAmount} Deposit` : `Pagar $${depositAmount} de Depósito`}
              </button>
            </div>
          </motion.div>
        ) : step === 'contract' && pendingBooking ? (
          <motion.div
            className="py-6 px-2 md:px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-mono text-white/70 tracking-widest uppercase">
                  {lang === 'en' ? 'Step 2 of 2 — Sign Contract' : 'Paso 2 de 2 — Firma el Contrato'}
                </p>
                <h3 className="font-serif text-xl text-white/90 mt-1">
                  {isWedding
                    ? (lang === 'en' ? 'Wedding Photography Contract' : 'Contrato de Fotografía de Boda')
                    : (lang === 'en' ? 'Photography Services Contract' : 'Contrato de Servicios Fotográficos')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-[10px] font-mono text-white/50 hover:text-white underline"
              >
                {lang === 'en' ? 'Back' : 'Volver'}
              </button>
            </div>
            <ContractView
              booking={pendingBooking}
              mode="client-sign"
              lang={lang}
              t={TRANSLATIONS[lang]}
              onClientSign={handleSignContract}
            />
          </motion.div>
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
              <p className="text-[10px] font-mono text-white/70 uppercase tracking-widest">
                ID: {bookingId}
              </p>
            </div>
            <p className="text-xs text-white/70 font-sans leading-relaxed">
              {t.successDesc}
              {emailConfig?.enableAutoResponse && (
                <> Hemos enviado un acuse de recibo y detalles iniciales de la propuesta a <strong className="text-white">{clientEmail}</strong>.</>
              )}
            </p>

            {createdInvoice && <InvoiceReceipt invoice={createdInvoice} lang={lang} />}

            <div className="border-t border-white/10 pt-5 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  if (createdInvoice && !window.confirm(lang === 'en' ? 'You have an unpaid invoice. Are you sure you want to leave?' : 'Tienes una factura pendiente. ¿Seguro que quieres salir?')) return;
                  setStep('form');
                   setPendingBooking(null);
                   setCreatedInvoice(null);
                   setPaymentResult(null);
                  setWeddingError('');
                  setPaymentCancelled(false);
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
