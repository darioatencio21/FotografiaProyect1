/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Heart, ArrowRight, Download, Eye, EyeOff, ChevronLeft, ChevronRight, X, Copy, Check as CheckIcon, Mail, MapPin } from 'lucide-react';
import { ActiveLanguage, Booking, ClientAccount, ProofPhoto, Invoice } from '../types';
import ContractView from './ContractView';
import InvoiceReceipt from './InvoiceReceipt';
import { TRANSLATIONS } from '../data/mockData';
import { sanitizeString, sanitizeUrl } from '../lib/sanitize';

interface ClientPortalProps {
  lang: ActiveLanguage;
  onOpenCheckout: (amount: number, description: string) => void;
  clientAccounts?: ClientAccount[];
  onUpdateClientAccounts?: (accounts: ClientAccount[]) => void;
  autoPasscode?: string;
  bookings?: Booking[];
  onUpdateBookings?: (bookings: Booking[]) => void;
  invoices?: Invoice[];
}

export default function ClientPortal({ lang, onOpenCheckout, clientAccounts = [], onUpdateClientAccounts, autoPasscode, bookings = [], onUpdateBookings, invoices = [] }: ClientPortalProps) {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authenticatedClientId, setAuthenticatedClientId] = useState<string | null>(null);
  
  const [activePhoto, setActivePhoto] = useState<ProofPhoto | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [showContract, setShowContract] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (autoPasscode) {
      const cleanCode = sanitizeString(autoPasscode).toUpperCase();
      const matchedAccount = clientAccounts.find(c => sanitizeString(c.passcode).toUpperCase() === cleanCode);
      if (matchedAccount) {
        setAuthenticatedClientId(matchedAccount.id);
        setIsAuthenticated(true);
        setErrorMsg('');
        if (matchedAccount.photos && matchedAccount.photos.length > 0) {
          setActivePhoto(matchedAccount.photos[0]);
        } else {
          setActivePhoto(null);
        }
      }
    }
  }, [autoPasscode, clientAccounts]);

  const currentAccount = clientAccounts.find(c => c.id === authenticatedClientId);
  const proofPhotos = currentAccount ? (currentAccount.photos || []) : [];
  const contractBooking = currentAccount ? bookings.find(b => b.clientName === currentAccount.clientName && b.contractData && b.isPaid && !b.contractSignature) : undefined;
  const clientInvoices = currentAccount ? invoices.filter(invoice => invoice.clientEmail.toLowerCase() === currentAccount.clientEmail.toLowerCase()) : [];

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = sanitizeString(passcode).toUpperCase();

    const matchedAccount = clientAccounts.find(c => sanitizeString(c.passcode).toUpperCase() === cleanCode);

    if (matchedAccount) {
      setAuthenticatedClientId(matchedAccount.id);
      setIsAuthenticated(true);
      setErrorMsg('');
      if (matchedAccount.photos && matchedAccount.photos.length > 0) {
        setActivePhoto(matchedAccount.photos[0]);
      } else {
        setActivePhoto(null);
      }
    } else {
      setErrorMsg(t.proofError);
    }
  };

  const handleToggleFav = (id: string) => {
    if (authenticatedClientId && currentAccount && onUpdateClientAccounts) {
      const updatedPhotos = proofPhotos.map(p => p.id === id ? { ...p, isFav: !p.isFav } : p);
      const updatedAccounts = clientAccounts.map(c => c.id === authenticatedClientId ? {
        ...c,
        photos: updatedPhotos
      } : c);
      onUpdateClientAccounts(updatedAccounts);
    }

    if (activePhoto && activePhoto.id === id) {
      setActivePhoto(prev => prev ? { ...prev, isFav: !prev.isFav } : null);
    }
  };

  const handlePrintSizeChange = (id: string, size: string) => {
    if (authenticatedClientId && currentAccount && onUpdateClientAccounts) {
      const updatedPhotos = proofPhotos.map(p => p.id === id ? { ...p, printSize: size } : p);
      const updatedAccounts = clientAccounts.map(c => c.id === authenticatedClientId ? {
        ...c,
        photos: updatedPhotos
      } : c);
      onUpdateClientAccounts(updatedAccounts);
    }

    if (activePhoto && activePhoto.id === id) {
      setActivePhoto(prev => prev ? { ...prev, printSize: size } : null);
    }
  };

  // Pricing for prints
  const printPrices: Record<string, number> = {
    '12x18': 45,
    '24x36': 95,
    'canvas': 160
  };

  const selectedPrints = proofPhotos.filter(p => p.printSize !== '');
  const printTotal = selectedPrints.reduce((sum, current) => {
    return sum + (printPrices[current.printSize] || 0);
  }, 0);

  const handleDownload = async (photo: ProofPhoto) => {
    const safeUrl = sanitizeUrl(photo.url);
    if (!safeUrl) return;

    try {
      const fileName = `${photo.title.toLowerCase().replace(/\s+/g, '-')}-master.webp`;
      if (safeUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = safeUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      const response = await fetch(safeUrl, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      console.warn('CORS or fetch error, falling back to direct tab open:', err);
      const link = document.createElement('a');
      link.href = safeUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = `${photo.title.toLowerCase().replace(/\s+/g, '-')}-master.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePurchasePrints = () => {
    if (printTotal === 0) return;
    onOpenCheckout(printTotal, `Luxury Archival Prints - Client Proof Compilation (${selectedPrints.length} Prints)`);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          /* Authentication Screen */
          <motion.div
            key="auth-screen"
            className="glass-premium rounded-2xl border border-[#D8C0A8]/30 p-8 md:p-12 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Header — editorial focal point */}
            <div className="text-center space-y-8 mb-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-gold-500/5 border border-[#D8C0A8]/20 flex items-center justify-center text-[#8B5E3C]">
                <ShieldCheck size={30} />
              </div>
              <div className="space-y-3">
                <h1 className="font-serif text-[clamp(2rem,5vw,3.2rem)] text-[#2B211A] font-semibold leading-tight">
                  {t.proofTitle}
                </h1>
                <p className="font-sans text-sm text-[#6A5645] font-light leading-relaxed max-w-xs mx-auto">
                  {t.proofSubtitle}
                </p>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-1">
                <div className="relative">
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder={t.proofPassPlaceholder}
                    className={`w-full bg-dark/60 border border-[#D8C0A8] rounded-lg pl-4 pr-12 py-3 text-center text-xs text-white/90 focus:outline-none focus:border-gold-400 ${
                      showPasscode ? 'font-sans font-medium tracking-normal' : 'font-mono tracking-widest'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/65 hover:text-white transition-colors p-1"
                    title={showPasscode ? 'Hide Passcode' : 'Show Passcode'}
                  >
                    {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errorMsg && (
                  <p className="text-[10px] font-mono text-red-400 mt-1 uppercase tracking-wider">
                    {errorMsg}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-white text-dark hover:bg-gold-400 font-mono text-xs tracking-widest uppercase font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 shadow-xl cursor-pointer"
              >
                <span>{t.proofEnter}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            <p className="text-[10px] font-mono text-white/65">
              Your photographer will provide you with a personalized access code.
            </p>
          </motion.div>
        ) : (
          /* Client Workspace */
          <motion.div
            key="client-workspace"
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Header info bar */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-[#D8C0A8] pb-6 gap-4 text-left">
              <div>
                <span className="text-[10px] font-mono text-gold-400 tracking-widest uppercase">
                  {lang === 'en' ? 'Client Proof Session' : 'Sesión de Pruebas de Cliente'}
                </span>
                <h3 className="font-serif text-3xl text-white font-semibold mt-1">
                  {currentAccount ? currentAccount.clientName : 'Cliente Verificado'}
                </h3>
                <p className="text-xs text-white/75 mt-1 font-sans">
                  {currentAccount 
                    ? `${currentAccount.sessionTitle} • ${currentAccount.sessionDate}`
                    : 'Sesión Fotográfica'}
                </p>
              </div>

              {/* Shareable Link Banner */}
              {currentAccount && (
                <div className="bg-dark-gray/40 border border-gold-400/15 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-left">
                    <MapPin size={12} className="text-gold-400 shrink-0" />
                    <span className="text-[10px] text-white/60 font-sans">
                      {lang === 'en' ? 'Share your gallery:' : 'Compartí tu galería:'}
                    </span>
                    <code className="text-[9px] font-mono text-gold-300/80 bg-dark/40 px-2 py-0.5 rounded border border-white/5 truncate max-w-[200px] sm:max-w-xs">
                      {window.location.origin + window.location.pathname + '?gallery=' + currentAccount.passcode}
                    </code>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => {
                        const link = window.location.origin + window.location.pathname + '?gallery=' + currentAccount.passcode;
                        navigator.clipboard.writeText(link).then(() => {
                          alert(lang === 'en' ? 'Link copied!' : '¡Link copiado!');
                        }).catch(() => {
                          const textArea = document.createElement('textarea');
                          textArea.value = link;
                          document.body.appendChild(textArea);
                          textArea.select();
                          document.execCommand('copy');
                          document.body.removeChild(textArea);
                          alert(lang === 'en' ? 'Link copied!' : '¡Link copiado!');
                        });
                      }}
                      className="py-1.5 px-3 bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/30 rounded-lg text-[9px] font-mono tracking-widest uppercase font-semibold flex items-center space-x-1 cursor-pointer transition-all"
                    >
                      <Copy size={11} />
                      <span>{lang === 'en' ? 'Copy Link' : 'Copiar Link'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Contract signing banner */}
              {contractBooking && !showContract && (
                <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-mono text-gold-400 tracking-widest uppercase">
                      {lang === 'en' ? 'Contract Pending' : 'Contrato Pendiente'}
                    </p>
                    <p className="text-xs text-white/80 mt-1">
                      {lang === 'en' ? 'Your contract is ready for review and signature.' : 'Tu contrato está listo para revisar y firmar.'}
                    </p>
                  </div>
                  <button onClick={() => setShowContract(true)} className="px-4 py-2 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/30 text-gold-400 rounded-lg text-[10px] font-mono tracking-wider uppercase transition-all shrink-0 cursor-pointer">
                    {lang === 'en' ? 'Sign Contract' : 'Firmar Contrato'}
                  </button>
                </div>
              )}

              {showContract && contractBooking && (
                <div className="relative bg-dark/40 border border-gold-500/20 rounded-xl p-4 md:p-6">
                  <button onClick={() => setShowContract(false)} className="absolute top-3 right-3 text-white/50 hover:text-white text-[10px] font-mono cursor-pointer">
                    {lang === 'en' ? 'Close' : 'Cerrar'}
                  </button>
                  <ContractView
                    booking={contractBooking}
                    mode="client-sign"
                    lang={lang}
                    t={t}
                    onClientSign={(signature) => {
                      if (onUpdateBookings) {
                        onUpdateBookings(bookings.map(b => b.id === contractBooking.id ? { ...b, contractSignature: signature, contractSignedAt: new Date().toISOString() } : b));
                      }
                      setShowContract(false);
                    }}
                  />
                </div>
              )}

              {clientInvoices.length > 0 && (
                <section className="bg-dark-gray/60 border border-gold-400/20 rounded-xl p-4 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono tracking-widest text-gold-400 uppercase">{t.invoiceReceipt}</h4>
                    <span className="text-[9px] text-white/40">{clientInvoices.length}</span>
                  </div>
                  {clientInvoices.map(invoice => <InvoiceReceipt key={invoice.id} invoice={invoice} lang={lang} compact />)}
                </section>
              )}

              {/* Filtering tabs */}
              <div className="flex items-center space-x-2 bg-dark/60 border border-[#D8C0A8]/30 p-1 rounded-lg">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-md transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-gold-500 text-dark font-semibold shadow'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  Todas ({proofPhotos.length})
                </button>
                <button
                  onClick={() => setActiveFilter('favorites')}
                  className={`px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activeFilter === 'favorites'
                      ? 'bg-gold-500 text-dark font-semibold shadow'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Heart size={12} className={activeFilter === 'favorites' ? 'fill-dark' : ''} />
                  <span>Favoritas ({proofPhotos.filter(p => p.isFav).length})</span>
                </button>
              </div>
            </div>

            {/* Photos Grid */}
            {proofPhotos.filter(p => activeFilter === 'favorites' ? p.isFav : true).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {proofPhotos.map((photo, index) => {
                  // Skip rendering if filtered out
                  if (activeFilter === 'favorites' && !photo.isFav) return null;

                  return (
                    <div
                      key={photo.id}
                      className="group relative rounded-xl overflow-hidden bg-charcoal/20 border border-[#D8C0A8]/30 shadow-md transition-all duration-300 hover:border-gold-400/40 text-left flex flex-col justify-between"
                    >
                      {/* Photo Container */}
                      <div 
                        className="relative aspect-[3/2] overflow-hidden bg-dark-gray/60 cursor-zoom-in"
                        onClick={() => setLightboxIndex(index)}
                      >
                        <img
                          src={sanitizeUrl(photo.url) || undefined}
                          alt={photo.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />

                        {/* Top corner fav status toggle button - Always Visible with elegant Glassmorphism */}
                        <div className="absolute top-2 right-2 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Avoid triggering lightbox index
                              handleToggleFav(photo.id);
                            }}
                            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                              photo.isFav
                                ? 'bg-gold-500 text-dark shadow-md scale-105'
                                : 'bg-black/40 hover:bg-black/60 text-white border border-[#D8C0A8]'
                            }`}
                            title={photo.isFav ? 'Quitar de Favoritas' : 'Marcar como Favorita'}
                          >
                            <Heart size={14} className={photo.isFav ? 'fill-dark' : ''} />
                          </button>
                        </div>
                      </div>

                      {/* Photo Footer Details */}
                      <div className="p-3 sm:p-4 flex flex-col border-t border-[#D8C0A8]/30 bg-dark-gray/10 gap-1.5 text-left">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[10px] sm:text-xs font-semibold text-white/90 truncate">{photo.title}</h4>
                            {photo.location ? (
                              <span className="text-[8px] sm:text-[9px] font-mono text-gold-400 block truncate mt-0.5">📍 {photo.location}</span>
                            ) : (
                              <span className="text-[8px] sm:text-[9px] font-mono text-white/65 block mt-0.5 uppercase tracking-wider">High-Res</span>
                            )}
                          </div>
                          
                          {/* Direct Download button on the card for quick mobile access */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(photo);
                            }}
                            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer shrink-0"
                            title="Descargar Foto"
                          >
                            <Download size={13} />
                          </button>
                        </div>
                        {photo.description && (
                          <p className="text-[9px] text-white/75 line-clamp-1 border-t border-[#D8C0A8]/30 pt-1 mt-0.5">{photo.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* No items fallback */
              <div className="py-20 text-center text-white/40 space-y-3 glass-premium border border-[#D8C0A8]/30 rounded-2xl max-w-lg mx-auto">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/30">
                  <Heart size={20} />
                </div>
                <h4 className="font-serif text-lg text-white/80 font-medium">No hay fotos en esta sección</h4>
                <p className="text-xs text-white/50 max-w-sm mx-auto px-4">
                  Aún no has marcado ninguna fotografía como favorita. ¡Explora el catálogo y pulsa el corazón en tus fotos preferidas!
                </p>
                <button
                  onClick={() => setActiveFilter('all')}
                  className="px-4 py-2 border border-[#D8C0A8] hover:border-gold-400 text-gold-300 text-[10px] font-mono rounded-lg cursor-pointer transition-all uppercase tracking-widest"
                >
                  Ver Todas las Fotos
                </button>
              </div>
            )}

            {/* Private Built-In Full-Screen Lightbox Modal */}
            <AnimatePresence>
              {lightboxIndex !== null && (
                <motion.div
                  className="fixed inset-0 z-50 bg-dark/95 backdrop-blur-md flex flex-col justify-between p-4 lg:p-8 select-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Lightbox Header */}
                  <div className="flex items-start justify-between w-full gap-4">
                    <div className="text-left max-w-xl">
                      <span className="font-mono text-[9px] text-gold-400 tracking-widest uppercase">
                        FOTO {lightboxIndex + 1} DE {proofPhotos.length} &middot; PRIVATE PROOFING
                      </span>
                      <h2 className="font-serif text-xl text-gold-50 tracking-wide leading-tight mt-0.5">
                        {proofPhotos[lightboxIndex].title}
                      </h2>
                      {proofPhotos[lightboxIndex].location && (
                        <span className="font-mono text-[9px] text-white/50 block mt-1 uppercase">
                          📍 {proofPhotos[lightboxIndex].location}
                        </span>
                      )}
                      {proofPhotos[lightboxIndex].description && (
                        <p className="text-xs text-white/70 mt-2 font-sans leading-relaxed">
                          {proofPhotos[lightboxIndex].description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setLightboxIndex(null)}
                      className="p-2.5 rounded-full border border-[#D8C0A8] bg-dark-gray/60 hover:bg-gold-500 hover:text-dark transition-all text-white cursor-pointer shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Main Image View */}
                  <div className="flex-1 flex items-center justify-center relative my-4 max-h-[72vh]">
                    {/* Navigation arrows (Hidden on mobile touch screens for visual elegance, as thumb bar is available) */}
                    <button
                      onClick={() => {
                        setLightboxIndex(prev => {
                          if (prev === null) return null;
                          return prev === 0 ? proofPhotos.length - 1 : prev - 1;
                        });
                      }}
                      className="hidden md:flex absolute left-6 p-3.5 rounded-full bg-dark-gray hover:bg-gold-500 hover:text-dark border border-[#D8C0A8]/30 text-white/80 transition-all z-20 cursor-pointer animate-pulse [animation-duration:3s]"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <img
                      src={sanitizeUrl(proofPhotos[lightboxIndex].url) || undefined}
                      alt={proofPhotos[lightboxIndex].title}
                      className="max-w-full max-h-[65vh] md:max-h-[68vh] object-contain rounded-lg shadow-2xl border border-[#D8C0A8]/30"
                    />

                    <button
                      onClick={() => {
                        setLightboxIndex(prev => {
                          if (prev === null) return null;
                          return prev === proofPhotos.length - 1 ? 0 : prev + 1;
                        });
                      }}
                      className="hidden md:flex absolute right-6 p-3.5 rounded-full bg-dark-gray hover:bg-gold-500 hover:text-dark border border-[#D8C0A8]/30 text-white/80 transition-all z-20 cursor-pointer animate-pulse [animation-duration:3s]"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Fully mobile-optimized, thumb-friendly navigation & action bottom bar */}
                  <div className="flex items-center justify-between max-w-sm mx-auto w-full px-4 pb-2 gap-4">
                    {/* Anterior */}
                    <button
                      onClick={() => {
                        setLightboxIndex(prev => {
                          if (prev === null) return null;
                          return prev === 0 ? proofPhotos.length - 1 : prev - 1;
                        });
                      }}
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-[#D8C0A8] text-white transition-all cursor-pointer flex items-center justify-center"
                      title="Anterior"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    {/* Favorita Toggle */}
                    <button
                      onClick={() => handleToggleFav(proofPhotos[lightboxIndex!].id)}
                      className={`p-4 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                        proofPhotos[lightboxIndex!].isFav
                          ? 'bg-gold-500 border-gold-500 text-dark font-semibold scale-110'
                          : 'bg-white/5 border-[#D8C0A8] text-white hover:bg-white/10'
                      }`}
                      title={proofPhotos[lightboxIndex!].isFav ? 'Quitar de Favoritas' : 'Marcar como Favorita'}
                    >
                      <Heart size={20} className={proofPhotos[lightboxIndex!].isFav ? 'fill-dark' : ''} />
                    </button>

                    {/* Descargar Foto */}
                    <button
                      onClick={() => handleDownload(proofPhotos[lightboxIndex!])}
                      className="p-4 bg-white text-dark hover:bg-gold-400 border border-[#D8C0A8] rounded-full transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-xl"
                      title="Descargar Foto"
                    >
                      <Download size={20} />
                    </button>

                    {/* Siguiente */}
                    <button
                      onClick={() => {
                        setLightboxIndex(prev => {
                          if (prev === null) return null;
                          return prev === proofPhotos.length - 1 ? 0 : prev + 1;
                        });
                      }}
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-[#D8C0A8] text-white transition-all cursor-pointer flex items-center justify-center"
                      title="Siguiente"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
