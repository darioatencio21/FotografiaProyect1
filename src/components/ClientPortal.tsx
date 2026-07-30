import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Heart, ArrowRight, Download, Eye, EyeOff, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ActiveLanguíage, Booking, ProofPhoto, Invoice, GalleryData } from '../types';
import ContractView from './ContractView';
import InvoiceReceipt from './InvoiceReceipt';
import { TRANSLATIONS } from '../data/mockData';
import { sanitizeUrl } from '../lib/sanitize';
import StorageImage from './StorageImage';

interface ClientPortalProps {
  lang: ActiveLanguíage;
  onOpenCheckout: (amount: number, description: string) => void;
  bookings?: Booking[];
  onUpdateBookings?: (bookings: Booking[]) => void;
  invoices?: Invoice[];
  onSubmitTestimonial?: (testimonial: any) => void;
}

export default function ClientPortal({ lang, onOpenCheckout, bookings = [], onUpdateBookings, invoices = [] }: ClientPortalProps) {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [galleryData, setGalleryData] = useState<GalleryData | null>(null);

  const [activePhoto, setActivePhoto] = useState<ProofPhoto | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [showContract, setShowContract] = useState(false);

  const t = TRANSLATIONS[lang];

  const proofPhotos = galleryData?.photos || [];
  const signedContractBookings = galleryData ? bookings.filter(b => b.clientName === galleryData.clientName && b.contractData && b.contractSignature) : [];
  const pendingContractBooking = galleryData ? bookings.find(b => b.clientName === galleryData.clientName && b.contractData && b.isPaid && !b.contractSignature) : undefined;
  const clientInvoices = galleryData ? invoices.filter(invoice => invoice.clientEmail.toLowerCase() === galleryData.clientEmail?.toLowerCase()) : [];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = passcode.trim();
    if (!cleanCode) return;

    setIsAuthenticating(true);
    setErrorMsg('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) throw new Error('Supabase URL not configured');

      const res = await fetch(`${supabaseUrl}/functions/v1/validate-gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: cleanCode }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Invalid passcode');
      }

      const data = await res.json();

      if (!data.client || !data.photos) {
        throw new Error('Invalid response from server');
      }

      const galleryData: GalleryData = {
        clientName: data.client.clientName,
        clientEmail: data.client.clientEmail,
        sessionTitle: data.client.sessionTitle,
        sessionDate: data.client.sessionDate,
        photos: data.photos.map((p: any) => ({
          id: p.id || '',
          url: p.signedUrl || p.url || '',
          title: p.title || '',
          sharpness: p.sharpness ?? 0,
          thirdsAlign: p.thirdsAlign ?? 0,
          emotionScore: p.emotionScore ?? 0,
          isFav: false,
          printSize: '',
          description: p.description,
          location: p.location,
        })),
      };

      setGalleryData(galleryData);
      if (galleryData.photos.length > 0) {
        setActivePhoto(galleryData.photos[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || t.proofError);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleToggleFav = (id: string) => {
    if (!galleryData) return;
    const updatedPhotos = proofPhotos.map(p => p.id === id ? { ...p, isFav: !p.isFav } : p);
    setGalleryData({ ...galleryData, photos: updatedPhotos });
    if (activePhoto && activePhoto.id === id) {
      setActivePhoto(prev => prev ? { ...prev, isFav: !prev.isFav } : null);
    }
  };

  const handlePrintSizeChange = (id: string, size: string) => {
    if (!galleryData) return;
    const updatedPhotos = proofPhotos.map(p => p.id === id ? { ...p, printSize: size } : p);
    setGalleryData({ ...galleryData, photos: updatedPhotos });
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
        {!galleryData ? (
          /* Authentication Screen */
          <motion.div
            key="auth-screen"
            className="glass-premium rounded-lg border border-stone/30 p-8 md:p-12 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Header */}
            <div className="text-center space-y-8 mb-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/5 border border-stone/20 flex items-center justify-center text-white/80">
                <ShieldCheck size={30} />
              </div>
              <div className="space-y-3">
                <h1 className="font-serif text-[clamp(2rem,5vw,3.2rem)] text-white font-semibold leading-tight">
                  {t.proofTitle}
                </h1>
                <p className="font-sans text-sm text-white/60 font-light leading-relaxed max-w-xs mx-auto">
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
                    className={`w-full bg-dark/60 border border-stone rounded-lg pl-4 pr-12 py-3 text-center text-xs text-white/90 focus:outline-none focus:border-white/30 ${
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
                disabled={isAuthenticating}
                className="w-full py-3 bg-white text-dark hover:bg-white/80 font-mono text-xs tracking-widest uppercase font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 shadow-xl cursor-pointer disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <span className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t.proofEnter}</span>
                    <ArrowRight size={14} />
                  </>
                )}
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
            <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-stone pb-6 gap-4 text-left">
              <div>
                <span className="text-[10px] font-mono text-white/70 tracking-widest uppercase">
                  {lang === 'en' ? 'Client Proof Session' : 'Sesión de Pruebas de Cliente'}
                </span>
                <h3 className="font-serif text-3xl text-white font-semibold mt-1">
                  {galleryData.clientName}
                </h3>
                <p className="text-xs text-white/75 mt-1 font-sans">
                  {galleryData.sessionTitle
                    ? `${galleryData.sessionTitle} • ${galleryData.sessionDate}`
                    : 'Sesión Fotográfica'}
                </p>
              </div>

              {/* Contract signing banner — pending */}
              {pendingContractBooking && !showContract && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-mono text-white/70 tracking-widest uppercase">
                      {lang === 'en' ? 'Contract Pending' : 'Contrato Pendiente'}
                    </p>
                    <p className="text-xs text-white/80 mt-1">
                      {lang === 'en' ? 'Your contract is ready for review and signature.' : 'Tu contrato está listo para revisar y firmar.'}
                    </p>
                  </div>
                  <button onClick={() => setShowContract(true)} className="px-4 py-2 bg-white/10 hover:bg-white/10 border border-white/10 text-white/70 rounded-lg text-[10px] font-mono tracking-wider uppercase transition-all shrink-0 cursor-pointer">
                    {lang === 'en' ? 'Sign Contract' : 'Firmar Contrato'}
                  </button>
                </div>
              )}

              {/* Contract view — signed contracts */}
              {signedContractBookings.length > 0 && !showContract && !pendingContractBooking && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-mono text-white/70 tracking-widest uppercase">
                      {lang === 'en' ? 'Contract Signed' : 'Contrato Firmado'}
                    </p>
                    <p className="text-xs text-white/80 mt-1">
                      {lang === 'en' ? 'Your contract has been signed.' : 'Tu contrato ha sido firmado.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowContract(true)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/10 border border-white/10 text-white/70 rounded-lg text-[10px] font-mono tracking-wider uppercase transition-all shrink-0 cursor-pointer"
                  >
                    {lang === 'en' ? 'View Contract' : 'Ver Contrato'}
                  </button>
                </div>
              )}

              {(showContract && pendingContractBooking) ? (
                <div className="relative bg-dark/40 border border-white/10 rounded-lg p-4 md:p-6">
                  <button onClick={() => setShowContract(false)} className="absolute top-3 right-3 text-white/50 hover:text-white text-[10px] font-mono cursor-pointer">
                    {lang === 'en' ? 'Close' : 'Cerrar'}
                  </button>
                  <ContractView
                    booking={pendingContractBooking}
                    mode="client-sign"
                    lang={lang}
                    t={t}
                    onClientSign={(signature) => {
                      if (onUpdateBookings) {
                        onUpdateBookings(bookings.map(b => b.id === pendingContractBooking.id ? { ...b, contractSignature: signature, contractSignedAt: new Date().toISOString() } : b));
                      }
                      setShowContract(false);
                    }}
                  />
                </div>
              ) : showContract && signedContractBookings.length > 0 ? (
                <div className="relative bg-dark/40 border border-white/10 rounded-lg p-4 md:p-6">
                  <button onClick={() => setShowContract(false)} className="absolute top-3 right-3 text-white/50 hover:text-white text-[10px] font-mono cursor-pointer">
                    {lang === 'en' ? 'Close' : 'Cerrar'}
                  </button>
                  <ContractView
                    booking={signedContractBookings[0]}
                    mode="view"
                    lang={lang}
                    t={t}
                  />
                </div>
              ) : null}

              {clientInvoices.length > 0 && (
                <section className="bg-dark-gray/60 border border-white/10 rounded-lg p-4 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono tracking-widest text-white/70 uppercase">{t.invoiceReceipt}</h4>
                    <span className="text-[9px] text-white/40">{clientInvoices.length}</span>
                  </div>
                  {clientInvoices.map(invoice => <InvoiceReceipt key={invoice.id} invoice={invoice} lang={lang} compact />)}
                </section>
              )}

              {/* Filtering tabs */}
              <div className="flex items-center space-x-2 bg-dark/60 border border-stone/30 p-1 rounded-lg">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-md transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-white/10 text-white font-semibold shadow'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  Todas ({proofPhotos.length})
                </button>
                <button
                  onClick={() => setActiveFilter('favorites')}
                  className={`px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activeFilter === 'favorites'
                      ? 'bg-white/10 text-white font-semibold shadow'
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
                  if (activeFilter === 'favorites' && !photo.isFav) return null;

                  return (
                    <div
                      key={photo.id}
                      className="group relative rounded-lg overflow-hidden bg-charcoal/20 border border-stone/30 shadow-md transition-all duration-300 hover:border-white/10 text-left flex flex-col justify-between"
                    >
                      <div 
                        className="relative aspect-[3/2] overflow-hidden bg-dark-gray/60 cursor-zoom-in"
                        onClick={() => setLightboxIndex(index)}
                      >
                        <StorageImage
                          src={sanitizeUrl(photo.url)}
                          alt={photo.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />

                        <div className="absolute top-2 right-2 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFav(photo.id);
                            }}
                            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                              photo.isFav
                                ? 'bg-white/10 text-white shadow-md scale-105'
                                : 'bg-black/40 hover:bg-black/60 text-white border border-stone'
                            }`}
                            title={photo.isFav ? 'Quitar de Favoritas' : 'Marcar como Favorita'}
                          >
                            <Heart size={14} className={photo.isFav ? 'fill-dark' : ''} />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 sm:p-4 flex flex-col border-t border-stone/30 bg-dark-gray/10 gap-1.5 text-left">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[10px] sm:text-xs font-semibold text-white/90 truncate">{photo.title}</h4>
                            {photo.location ? (
                              <span className="text-[11px] sm:text-[9px] font-mono text-white/70 block truncate mt-0.5">{photo.location}</span>
                            ) : (
                              <span className="text-[11px] sm:text-[9px] font-mono text-white/65 block mt-0.5 uppercase tracking-wider">High-Res</span>
                            )}
                          </div>

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
                          <p className="text-[9px] text-white/75 line-clamp-1 border-t border-stone/30 pt-1 mt-0.5">{photo.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center text-white/40 space-y-3 glass-premium border border-stone/30 rounded-lg max-w-lg mx-auto">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/30">
                  <Heart size={20} />
                </div>
                <h4 className="font-serif text-lg text-white/80 font-medium">No hay fotos en esta sección</h4>
                <p className="text-xs text-white/50 max-w-sm mx-auto px-4">
                  Aún no has marcado ninguna fotografía como favorita. Explora el catálogo y pulsa el corazón en tus fotos preferidas!
                </p>
                <button
                  onClick={() => setActiveFilter('all')}
                  className="px-4 py-2 border border-stone hover:border-white/20 text-white/60 text-[10px] font-mono rounded-lg cursor-pointer transition-all uppercase tracking-widest"
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
                  <div className="flex items-start justify-between w-full gap-4">
                    <div className="text-left max-w-xl">
                      <span className="font-mono text-[9px] text-white/70 tracking-widest uppercase">
                        FOTO {lightboxIndex + 1} DE {proofPhotos.length} &middot; PRIVATE PROOFING
                      </span>
                      <h2 className="font-serif text-xl text-white/90 tracking-wide leading-tight mt-0.5">
                        {proofPhotos[lightboxIndex].title}
                      </h2>
                      {proofPhotos[lightboxIndex].location && (
                        <span className="font-mono text-[9px] text-white/50 block mt-1 uppercase">
                          {proofPhotos[lightboxIndex].location}
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
                      className="p-2.5 rounded-full border border-stone bg-dark-gray/60 hover:bg-white/10 hover:text-white transition-all text-white cursor-pointer shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex-1 flex items-center justify-center relative my-4 max-h-[72vh]">
                    <button
                      onClick={() => {
                        setLightboxIndex(prev => {
                          if (prev === null) return null;
                          return prev === 0 ? proofPhotos.length - 1 : prev - 1;
                        });
                      }}
                      className="hidden md:flex absolute left-6 p-3.5 rounded-full bg-dark-gray hover:bg-white/10 hover:text-white border border-stone/30 text-white/80 transition-all z-20 cursor-pointer animate-pulse [animation-duration:3s]"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <StorageImage
                      src={sanitizeUrl(proofPhotos[lightboxIndex].url)}
                      alt={proofPhotos[lightboxIndex].title}
                      className="max-w-full max-h-[65vh] md:max-h-[68vh] object-contain rounded-lg shadow-2xl border border-stone/30"
                    />

                    <button
                      onClick={() => {
                        setLightboxIndex(prev => {
                          if (prev === null) return null;
                          return prev === proofPhotos.length - 1 ? 0 : prev + 1;
                        });
                      }}
                      className="hidden md:flex absolute right-6 p-3.5 rounded-full bg-dark-gray hover:bg-white/10 hover:text-white border border-stone/30 text-white/80 transition-all z-20 cursor-pointer animate-pulse [animation-duration:3s]"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between max-w-sm mx-auto w-full px-4 pb-2 gap-4">
                    <button
                      onClick={() => {
                        setLightboxIndex(prev => {
                          if (prev === null) return null;
                          return prev === 0 ? proofPhotos.length - 1 : prev - 1;
                        });
                      }}
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-stone text-white transition-all cursor-pointer flex items-center justify-center"
                      title="Anterior"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      onClick={() => handleToggleFav(proofPhotos[lightboxIndex!].id)}
                      className={`p-4 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                        proofPhotos[lightboxIndex!].isFav
                          ? 'bg-white/10 border-white/20 text-white font-semibold scale-110'
                          : 'bg-white/5 border-stone text-white hover:bg-white/10'
                      }`}
                      title={proofPhotos[lightboxIndex!].isFav ? 'Quitar de Favoritas' : 'Marcar como Favorita'}
                    >
                      <Heart size={20} className={proofPhotos[lightboxIndex!].isFav ? 'fill-dark' : ''} />
                    </button>

                    <button
                      onClick={() => handleDownload(proofPhotos[lightboxIndex!])}
                      className="p-4 bg-white text-dark hover:bg-white/80 border border-stone rounded-full transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-xl"
                      title="Descargar Foto"
                    >
                      <Download size={20} />
                    </button>

                    <button
                      onClick={() => {
                        setLightboxIndex(prev => {
                          if (prev === null) return null;
                          return prev === proofPhotos.length - 1 ? 0 : prev + 1;
                        });
                      }}
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-stone text-white transition-all cursor-pointer flex items-center justify-center"
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
