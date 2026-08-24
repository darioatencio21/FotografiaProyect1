/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';
import { X, Globe, ChevronLeft } from 'lucide-react';
import { ActiveLanguage } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { Logo } from './Logo';

interface HeaderProps {
  currentView: string;
  onSetView: (view: string) => void;
  lang: ActiveLanguage;
  onSetLang: (lang: ActiveLanguage) => void;
}

const DRAWER_WIDTH_VW = 85;
const CLOSE_VELOCITY = 400;
const HANDLE_OPEN_THRESHOLD_PX = 40;

function Header({
  currentView,
  onSetView,
  lang,
  onSetLang,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const t = TRANSLATIONS[lang];

  const menuItems = [
    { id: 'home', label: t.navHome },
    { id: 'about', label: t.navAbout },
    { id: 'portfolio', label: t.navPortfolio },
    { id: 'services', label: t.navServices },
    { id: 'client-portal', label: t.navClientPortal },
    { id: 'contact', label: t.navContact }
  ];

  const handleNav = (viewId: string) => {
    onSetView(viewId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookNow = () => {
    onSetView('services');
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bookNowLabel = lang === 'es' ? 'Reservar' : 'Book Now';

  const languages: { code: ActiveLanguage; name: string }[] = [
    { code: 'es', name: 'ESP' },
    { code: 'en', name: 'ENG' },

  ];

  const drawerX = useMotionValue(0);
  const isDragging = useMotionValue(0);

  const overlayOpacity = useTransform(drawerX, [0, window.innerWidth * (DRAWER_WIDTH_VW / 100)], [1, 0]);

  const closeDrawer = () => {
    setIsMobileMenuOpen(false);
  };

  const openDrawer = () => {
    setIsMobileMenuOpen(true);
    animate(drawerX, 0, { type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] });
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      drawerX.set(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleHandleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const shouldOpen = info.offset.x < -HANDLE_OPEN_THRESHOLD_PX || info.velocity.x < -CLOSE_VELOCITY;
    if (shouldOpen) {
      openDrawer();
    } else {
      animate(drawerX, 0, { type: 'spring', stiffness: 500, damping: 40 });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full max-h-[70px] lg:max-h-none bg-dark border-b border-white/10 py-2 lg:py-4 px-4 lg:px-12 flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-x-24 z-50">
      {/* Desktop navigation link array - Left split (Home, About, Portfolio) */}
      <nav className="hidden lg:flex items-center space-x-8 z-10 justify-start">
        {menuItems.slice(0, 3).map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`text-xs font-mono tracking-widest uppercase transition-all relative pb-1 cursor-pointer ${
                isActive ? 'text-white font-bold' : 'text-white/70 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-px bg-white"
                  layoutId="activeNavLine"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Brand logo (Centered on desktop, naturally left-aligned on mobile) */}
      <div
        onClick={() => handleNav('home')}
        className="flex items-center cursor-pointer group z-20 lg:flex lg:justify-center lg:items-center gap-2 lg:gap-3 py-0.5 lg:py-1"
      >
        <Logo size="xs" />
        <span id="header-logo" className="font-serif text-[9px] sm:text-[11px] lg:text-[13px] font-semibold tracking-[0.15em] sm:tracking-[0.2em] lg:tracking-[0.25em] text-white group-hover:text-white transition-colors duration-500 whitespace-nowrap uppercase truncate max-w-[120px] sm:max-w-none">
          Miriam Tellez
        </span>
      </div>

      {/* Desktop Actions bar & Right split (Services, Client Portal, Contact) */}
      <div className="hidden lg:flex items-center justify-end space-x-8 z-10">
        <nav className="flex items-center space-x-8">
          {menuItems.slice(3).map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`text-[10px] font-mono tracking-widest uppercase transition-all relative pb-1 cursor-pointer ${
                  isActive ? 'text-white font-bold' : 'text-white/70 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-px bg-white"
                    layoutId="activeNavLine"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="h-4 w-px bg-white/10" />

        <div className="flex items-center space-x-5">
          {/* Languíage selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              aria-haspopup="true"
              aria-expanded={showLanguageDropdown}
              aria-label={lang === 'es' ? 'Cambiar idioma' : 'Change language'}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-1.5 rounded-md text-white/90 hover:text-white text-xs font-mono tracking-widest uppercase cursor-pointer transition-all"
            >
              <Globe size={12} className="text-white" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <AnimatePresence>
              {showLanguageDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLanguageDropdown(false)} />
                  <motion.div
                    className="absolute right-0 mt-2.5 w-24 bg-[#2D2A28] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-20 text-left"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    {languages.map(item => (
                      <button
                        key={item.code}
                        aria-current={lang === item.code}
                        onClick={() => {
                          onSetLang(item.code);
                          setShowLanguageDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-mono transition-all ${
                          lang === item.code
                            ? 'bg-white/15 text-white font-bold'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Book Now CTA */}
          <button
            onClick={handleBookNow}
            aria-label={bookNowLabel}
            className="flex items-center space-x-1.5 bg-white hover:bg-white/85 border border-white px-4 py-1.5 rounded-md text-dark text-xs font-mono tracking-widest uppercase font-bold cursor-pointer transition-all shadow-[0_0_16px_rgba(255,255,255,0.15)]"
          >
            {bookNowLabel}
          </button>

        </div>
      </div>

      {/* Drag handle — visible only on mobile, only when menu is closed.
          Outer button is an extended hit-target (44px+ tall for accessibility);
          inner span is the visible gold pill. */}
      <AnimatePresence>
        {currentView !== 'admin' && !isMobileMenuOpen && (
          <motion.button
            key="drag-handle"
            type="button"
            aria-label="Open menu"
            drag="x"
            dragConstraints={{ left: -240, right: 0 }}
            dragElastic={0.15}
            dragMomentum={false}
            onDragStart={() => isDragging.set(1)}
            onDragEnd={handleHandleDragEnd}
            style={{ x: drawerX, touchAction: 'pan-y' }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-1/2 -translate-y-1/2 right-0.5 z-30 lg:hidden
                       w-12 h-40 sm:w-14 sm:h-44
                       flex items-center justify-end pr-1
                       cursor-grab active:cursor-grabbing
                       touch-none select-none
                       bg-transparent"
          >
            {/* Hint animation on first load of the session */}
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={{ x: [-1, -8, -1, -5, -1] }}
              transition={{ duration: 2.4, repeat: 2, ease: 'easeInOut' }}
              className="block w-3.5 h-28 sm:w-4 sm:h-32
                          bg-white hover:bg-white active:bg-white
                          rounded-l-full border-l border-white/40
                          shadow-[-3px_0_12px_rgba(0,0,0,0.5)]
                          transition-colors
                          flex items-center justify-center"
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center justify-center"
              >
                <ChevronLeft size={12} className="text-dark" strokeWidth={3} />
              </motion.span>
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile drawer overlay (dark backdrop) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="drawer-overlay"
            className="fixed inset-0 z-30 lg:hidden bg-black/60 backdrop-blur-sm"
            style={{ opacity: overlayOpacity }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer (draggable) */}
      <AnimatePresence>
        {currentView !== 'admin' && isMobileMenuOpen && (
          <motion.aside
            key="mobile-drawer"
            className="fixed inset-y-0 right-0 w-[85vw] max-w-sm bg-dark z-40 lg:hidden
                        flex flex-col justify-between p-6 pt-4 text-left overflow-y-auto
                        border-l border-stone shadow-[-8px_0_24px_rgba(0,0,0,0.5)]
                        touch-pan-y"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Drawer header with drag affordance + close button */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-1.5 bg-white/25 rounded-full mx-auto opacity-70" aria-hidden="true" />
              <button
                onClick={closeDrawer}
                className="text-white/60 hover:text-white p-1 -mr-1 cursor-pointer transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 pt-2">
              {menuItems.map(item => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`block w-full text-left font-serif text-xl sm:text-2xl tracking-wide border-b border-white/10 pb-2 ${
                      isActive ? 'text-white font-bold' : 'text-white/95'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 pb-8">
              <button
                onClick={handleBookNow}
                className="w-full py-3 bg-white hover:bg-white/85 text-dark rounded-md font-mono text-xs tracking-widest uppercase font-bold cursor-pointer transition-all"
              >
                {bookNowLabel}
              </button>
              <div className="flex items-center justify-center space-x-3 pb-4">
                {languages.map(item => (
                  <button
                    key={item.code}
                    onClick={() => onSetLang(item.code)}
                    className={`text-[10px] font-mono px-2 py-1 rounded ${
                      lang === item.code ? 'text-white font-bold underline' : 'text-white/40'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <div className="text-center flex flex-col items-center justify-center pt-2">
                <Logo size="xs" className="mb-2 opacity-60 [&>img]:h-10 [&>img]:w-10" />
                <span className="font-serif text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
                  Miriam Tellez Photography
                </span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
}

export default memo(Header);
