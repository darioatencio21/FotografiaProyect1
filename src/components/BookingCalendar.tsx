/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { Service, ActiveLanguage, Booking, BookingConfig, EmailConfig, PhotographyPackage } from '../types';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '../lib/sanitize';

interface BookingCalendarProps {
  services: Service[];
  lang: ActiveLanguage;
  config?: BookingConfig;
  emailConfig?: EmailConfig;
  preSelectedPackage?: PhotographyPackage | null;
  onClearPackage?: () => void;
  onAddBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => void;
}

const LOCAL_TRANSLATIONS = {
  es: {
    title: 'DISEÑA TU SESIÓN FOTOGRÁFICA',
    subtitle: 'Responde este breve cuestionario y te enviaremos una propuesta artística adaptada a tus deseos.',
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
    successTitle: '¡Cuestionario Recibido!',
    successDesc: 'Hemos registrado tus preferencias correctamente. En las próximas horas Miriam se pondrá en contacto contigo con un diseño de sesión y cotización final personalizada.',
    submit: 'Enviar Cuestionario Creativo',
    submitting: 'PROCESANDO TU PROPUESTA...',
    backToGallery: 'Diseñar Otra Sesión',
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
    subtitle: 'Answer this brief questionnaire and we will craft a bespoke artistic proposal tailored to your vision.',
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
    successTitle: 'Questionnaire Received!',
    successDesc: 'We have received your creative preferences. Miriam will get in touch shortly with a customized shoot concept and formal proposal.',
    submit: 'Submit Creative Questionnaire',
    submitting: 'PROCESSING YOUR PROPOSAL...',
    backToGallery: 'Design Another Session',
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

export default function BookingCalendar({ services, lang, config, emailConfig, preSelectedPackage, onClearPackage, onAddBooking }: BookingCalendarProps) {
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
  
  // Flow State
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

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
    const safeName = sanitizeString(clientName);
    const safeEmail = sanitizeEmail(clientEmail);
    const safePhone = sanitizePhone(clientPhone);
    const safeNotes = sanitizeString(creativeNotes);
    const safeCustomService = sanitizeString(customServiceText);
    const safeCustomTime = sanitizeString(customTimeframeText);

    if (!safeName || !safeEmail || !safePhone || !dateValue) return;

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
           `\n\n[Respuestas del Cuestionario Creativo]` +
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
    setIsSubmitted(true);

    onAddBooking({
      clientName: safeName,
      clientEmail: safeEmail,
      clientPhone: safePhone,
      date: formattedDate,
      timeSlot: finalSchedule,
      serviceId: selectedServiceId,
      peopleCount,
      notes: notesText,
      amount: totalPrice
    });
  };

  return (
    <div className="glass-premium rounded-2xl border border-white/5 p-6 md:p-8 max-w-4xl mx-auto shadow-2xl">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* INTRO SPEECH */}
            <div className="text-center pb-2 border-b border-white/5 max-w-2xl mx-auto space-y-1.5">
              <h3 className="font-serif text-xl md:text-2xl text-white/80">
                {t.title}
              </h3>
              <p className="text-[11px] md:text-xs text-white/50 leading-relaxed font-sans">
                {t.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              
              {/* QUESTION 1: CHOOSE PACKAGE / SESSION TYPE — OR SHOW PRE-SELECTED */}
              {!preSelectedPackage ? (
                <div className="space-y-3">
                  <label className="block text-xs font-mono tracking-widest text-gold-300 uppercase">
                    {t.step1}
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {services.map((service) => {
                      const isSelected = selectedServiceId === service.id;
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => setSelectedServiceId(service.id)}
                          className={`text-left p-4 rounded-xl border transition-all duration-300 relative group flex flex-col justify-between h-36 ${
                            isSelected 
                              ? 'bg-gold-500/10 border-gold-400 text-white shadow-lg' 
                              : 'bg-dark/40 border-white/5 text-white/70 hover:border-white/20'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono tracking-wider text-gold-400 uppercase font-semibold">
                                {service.duration || 'Colección'}
                              </span>
                              {isSelected ? (
                                <CheckCircle2 size={14} className="text-gold-400 shrink-0" />
                              ) : (
                                <Camera size={14} className="text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
                              )}
                            </div>
                            <h4 className="text-xs font-semibold tracking-wide text-white group-hover:text-gold-100 transition-colors mt-1 line-clamp-1">
                              {service.title}
                            </h4>
                            <p className="text-[10px] text-white/40 leading-snug line-clamp-2 mt-0.5 font-sans">
                              {service.description || 'Exclusive curated photographic session'}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-white/5 mt-2 flex items-center justify-between">
                            <span className="text-[9px] font-mono text-white/40 uppercase">Base Rate</span>
                            <span className="text-xs font-mono font-bold text-gold-400">
                              ${service.price.toLocaleString()}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {/* CUSTOM SESSION CARD */}
                    <button
                      type="button"
                      onClick={() => setSelectedServiceId('custom')}
                      className={`text-left p-4 rounded-xl border transition-all duration-300 relative group flex flex-col justify-between h-36 ${
                        selectedServiceId === 'custom' 
                          ? 'bg-gold-500/10 border-gold-400 text-white shadow-lg' 
                          : 'bg-dark/40 border-white/5 text-white/70 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono tracking-wider text-gold-400 uppercase font-semibold">
                            Custom Art
                          </span>
                          {selectedServiceId === 'custom' ? (
                            <CheckCircle2 size={14} className="text-gold-400 shrink-0" />
                          ) : (
                            <Sparkles size={14} className="text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
                          )}
                        </div>
                        <h4 className="text-xs font-semibold tracking-wide text-white group-hover:text-gold-100 transition-colors mt-1">
                          {t.customProject}
                        </h4>
                        <p className="text-[10px] text-white/40 leading-snug line-clamp-2 mt-0.5 font-sans">
                          {lang === 'es' ? 'Cualquier otro proyecto editorial, de marca, moda o destino.' : 'Any other editorial, branding, fashion or destination project.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 mt-2 flex items-center justify-between">
                        <span className="text-[9px] font-mono text-white/40 uppercase">Rate</span>
                        <span className="text-xs font-mono font-bold text-gold-400 uppercase">
                          Bespoke
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Show details input if Custom Session is selected */}
                  <AnimatePresence>
                    {selectedServiceId === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pt-1"
                      >
                        <textarea
                          required
                          rows={2}
                          value={customServiceText}
                          onChange={(e) => setCustomServiceText(e.target.value)}
                          placeholder={t.customProjectPlaceholder}
                          className="w-full bg-dark/60 border border-gold-400/20 rounded-lg p-3 text-xs text-white/90 placeholder-white/30 focus:outline-none focus:border-gold-400 font-sans resize-none"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Pre-selected package card — replaces step 1 */
                <div className="bg-gold-500/10 border border-gold-400/30 rounded-xl overflow-hidden">
                  {/* Package image if available */}
                  {preSelectedPackage.image && (
                    <div className="w-full h-36 overflow-hidden">
                      <img src={preSelectedPackage.image} alt={lang === 'es' ? preSelectedPackage.name_es : preSelectedPackage.name_en} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-gold-400 uppercase tracking-widest font-semibold">{t.step1}</span>
                      <CheckCircle2 size={16} className="text-gold-400 shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg text-white">
                        {lang === 'es' ? preSelectedPackage.name_es : preSelectedPackage.name_en}
                      </h4>
                      <p className="text-[10px] text-white/60 leading-relaxed mt-0.5 line-clamp-2">
                        {lang === 'es' ? preSelectedPackage.description_es : preSelectedPackage.description_en}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-[10px] font-mono text-white/45">
                        {lang === 'es' ? preSelectedPackage.duration_es : preSelectedPackage.duration_en}
                      </span>
                      <span className="text-lg font-bold font-mono text-gold-400">
                        ${preSelectedPackage.price.toLocaleString()}
                      </span>
                    </div>
                    {onClearPackage && (
                      <button
                        type="button"
                        onClick={onClearPackage}
                        className="w-full mt-2 py-2 border border-white/10 hover:border-white/30 rounded-lg text-[9px] font-mono text-white/50 hover:text-white uppercase tracking-widest transition-all cursor-pointer"
                      >
                        Cambiar paquete
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TWO COLUMN ROW: DATE AND PREFERRED TIMEFRAME */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* QUESTION 2: PREFERRED DATE */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono tracking-widest text-gold-300 uppercase">
                    {t.step2}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gold-400">
                      <CalendarIcon size={14} />
                    </div>
                    <input
                      type="date"
                      required
                      value={dateValue}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-dark/60 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-xs text-white/95 placeholder-white/20 focus:outline-none focus:border-gold-400 transition-all font-mono"
                    />
                  </div>
                  <span className="text-[9px] text-white/30 block">
                    *Puedes cambiar la fecha libremente más adelante con nuestro equipo.
                  </span>
                </div>

                {/* QUESTION 3: PREFERRED TIMEFRAME */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono tracking-widest text-gold-300 uppercase">
                    {t.step3}
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTimeframe('morning')}
                      className={`py-2 px-3 rounded-lg text-[10px] font-mono text-left border flex items-center space-x-2 transition-all ${
                        selectedTimeframe === 'morning'
                          ? 'bg-gold-500/10 border-gold-400 text-gold-300 font-bold'
                          : 'bg-dark/40 border-white/5 text-white/60 hover:border-white/15'
                      }`}
                    >
                      <Clock size={11} className="text-gold-400" />
                      <span className="truncate">Mañana</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTimeframe('afternoon')}
                      className={`py-2 px-3 rounded-lg text-[10px] font-mono text-left border flex items-center space-x-2 transition-all ${
                        selectedTimeframe === 'afternoon'
                          ? 'bg-gold-500/10 border-gold-400 text-gold-300 font-bold'
                          : 'bg-dark/40 border-white/5 text-white/60 hover:border-white/15'
                      }`}
                    >
                      <Clock size={11} className="text-gold-400" />
                      <span className="truncate">Tarde</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTimeframe('goldenHour')}
                      className={`py-2 px-3 rounded-lg text-[10px] font-mono text-left border flex items-center space-x-2 transition-all col-span-2 ${
                        selectedTimeframe === 'goldenHour'
                          ? 'bg-gold-500/10 border-gold-400 text-gold-300 font-bold shadow-sm'
                          : 'bg-dark/40 border-white/5 text-white/60 hover:border-white/15'
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
                          ? 'bg-gold-500/10 border-gold-400 text-gold-300 font-bold'
                          : 'bg-dark/40 border-white/5 text-white/60 hover:border-white/15'
                      }`}
                    >
                      <Sparkles size={11} className="text-gold-400" />
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
                          className="w-full bg-dark/60 border border-gold-400/20 rounded-lg px-3 py-2 text-xs text-white/90 placeholder-white/30 focus:outline-none focus:border-gold-400 font-sans"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* QUESTION 4: CONTACT DATA AND REGISTRATION FORM */}
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-mono tracking-widest text-gold-300 uppercase">
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
                      className="w-full bg-dark/60 border border-white/10 rounded-lg pl-9 pr-3 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold-400 font-sans"
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
                      className="w-full bg-dark/60 border border-white/10 rounded-lg pl-9 pr-3 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold-400 font-sans"
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
                      placeholder="Número de Teléfono *"
                      className="w-full bg-dark/60 border border-white/10 rounded-lg pl-9 pr-3 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold-400 font-sans"
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
                      className="w-full bg-dark/60 border border-white/10 rounded-lg pl-9 pr-3 py-3 text-xs text-white/90 focus:outline-none focus:border-gold-400 font-sans"
                    />
                  </div>

                  {/* Notes / Ideas */}
                  <div className="md:col-span-3">
                    <textarea
                      rows={2}
                      value={creativeNotes}
                      onChange={(e) => setCreativeNotes(e.target.value)}
                      placeholder={t.notesLabel}
                      className="w-full bg-dark/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white/90 placeholder-white/30 focus:outline-none focus:border-gold-400 font-sans resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* ESTIMATION & QUOTE SUMMARY */}
              <div className="bg-dark-gray/60 border border-gold-400/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
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
                
                <div className="flex items-center space-x-1 font-mono text-xl font-bold text-gold-400">
                  {preSelectedPackage ? (
                    <>
                      <DollarSign size={18} className="-mr-1 text-gold-400" />
                      <span>{totalPrice.toLocaleString()}</span>
                    </>
                  ) : selectedServiceId === 'custom' ? (
                    <span className="text-sm tracking-wider uppercase bg-gold-400/10 px-3 py-1 rounded border border-gold-400/20">Por Definir</span>
                  ) : (
                    <>
                      <DollarSign size={18} className="-mr-1 text-gold-400" />
                      <span>{totalPrice.toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSyncing || !dateValue}
                className="w-full py-3.5 bg-gold-500 hover:bg-gold-400 text-dark font-mono text-xs tracking-widest uppercase font-bold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="inline-flex p-4 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-400 mx-auto">
              <CheckCircle2 size={48} className="animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl text-gold-50 tracking-wide">
                {t.successTitle}
              </h3>
              <p className="text-[10px] font-mono text-gold-400 uppercase tracking-widest">
                ID: AUREA-{Math.floor(Math.random() * 8999 + 1000)}
              </p>
            </div>
            <p className="text-xs text-white/70 font-sans leading-relaxed">
              {t.successDesc}
              {emailConfig?.enableAutoResponse && (
                <> Hemos enviado un acuse de recibo y detalles iniciales de la propuesta a <strong className="text-white">{clientEmail}</strong>.</>
              )}
            </p>
            <div className="border-t border-white/10 pt-5 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setDateValue('');
                  setSelectedDate(null);
                  setClientName('');
                  setClientEmail('');
                  setClientPhone('');
                  setCreativeNotes('');
                  setCustomServiceText('');
                  setCustomTimeframeText('');
                }}
                className="py-2.5 px-6 border border-white/15 hover:border-gold-400/50 hover:text-gold-300 text-white/80 rounded-lg font-mono text-[10px] tracking-widest uppercase transition-all"
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
