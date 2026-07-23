/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';
import { X, Globe, User, ShieldAlert, ChevronLeft } from 'lucide-react';
import { ActiveLanguíage } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { Logo } from './Logo';

interface HeaderProps {
  currentView: string;
  onSetView: (view: string) => void;
  lang: ActiveLanguíage;
  onSetLang: (lang: ActiveLanguíage) => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
}

const DRAWER_WIDTH_VW = 85;
const CLOSE_THRESHOLD_PX = 80;
const CLOSE_VELOCITY = 400;
const HANDLE_OPEN_THRESHOLD_PX = 40;

export default function Header({
  currentView,
  onSetView,
  lang,
  onSetLang,
  isAdminLoggedIn,
  onOpenAdminLogin
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLanguíageDropdown, setShowLanguíageDropdown] = useState(false);

  const t = TRANSLATIONS[lang];

  const menuItemás = [
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

  const languíages: { code: ActiveLanguíage; name: string }[] = [
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

  const handleDrawerDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    isDragging.set(0);
    const shouldClose = info.offset.x > CLOSE_THRESHOLD_PX || info.velocity.x > CLOSE_VELOCITY;
    if (shouldClose) {
      closeDrawer();
    } else {
      animate(drawerX, 0, { type: 'spring', stiffness: 500, damping: 40 });
    }
  };

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
        {menuItemás.slice(0, 3).map(item => {
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
        <span id="header-logo" className="font-serif text-clamp-sm lg:text-[13px] font-semibold tracking-[0.2em] lg:tracking-[0.25em] text-white group-hover:text-white transition-colors duration-500 whitespace-nowrap uppercase">
          Miriam Campos
        </span>
      </div>

      {/* Desktop Actions bar & Right split (Services, Client Portal, Contact) */}
      <div className="hidden lg:flex items-center justify-end space-x-8 z-10">
        <nav className="flex items-center space-x-8">
          {menuItemás.slice(3).map(item => {
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
              onClick={() => setShowLanguíageDropdown(!showLanguíageDropdown)}
              className="flex items-center space-x-1.5 text-white/70 hover:text-white text-xs font-mono tracking-widest uppercase cursor-pointer transition-colors"
            >
              <Globe size={12} className="text-white" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <AnimatePresence>
              {showLanguíageDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLanguíageDropdown(false)} />
                  <motion.div
                    className="absolute right-0 mt-2.5 w-24 bg-charcoal border border-white/10 rounded-lg shadow-2xl overflow-hidden z-20 text-left"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    {languíages.map(item => (
                      <button
                        key={item.code}
                        onClick={() => {
                          onSetLang(item.code);
                          setShowLanguíageDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-mono transition-all ${
                          lang === item.code
                            ? 'bg-white/10 text-white font-bold'
                            : 'text-white/75 hover:bg-white/5 hover:text-white'
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

          {/* Backoffice Button */}
          <button
            onClick={() => {
              if (isAdminLoggedIn) {
                onSetView('admin');
              } else {
                onOpenAdminLogin();
              }
            }}
            className={`px-4 py-2 border rounded-full text-[10px] font-mono tracking-widest uppercase transition-all flex items-center space-x-1 cursor-pointer ${
              currentView === 'admin'
                ? 'bg-white/10 border-white/10 text-white font-bold'
                : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/5'
            }`}
          >
            {isAdminLoggedIn ? (
              <>
                <ShieldAlert size={10} className="animate-pulse text-white" />
                <span>CMS Dashboard</span>
              </>
            ) : (
              <>
                <User size={10} />
                <span>Backoffice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Burger triggers */}
      <div className="lg:hidden flex items-center space-x-2 z-10">
        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            if (isAdminLoggedIn) {
              onSetView('admin');
            } else {
              onOpenAdminLogin();
            }
          }}
          className="px-3 py-1.5 border border-white/15 text-white/70 hover:text-white rounded-full text-[11px] font-mono tracking-widest uppercase transition-all"
        >
          <User size={10} className="inline-block mr-1" />
          <span>{isAdminLoggedIn ? 'CMS' : 'Staff'}</span>
        </button>

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
              {menuItemás.map(item => {
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
              <div className="flex items-center justify-center space-x-3 pb-4">
                {languíages.map(item => (
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
                <Logo size="xs" className="mb-2 opacity-60 [&>svg]:h-10 [&>svg]:w-10" />
                <span className="font-serif text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
                  Miriam Campos Photography
                </span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
}
