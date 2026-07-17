/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Globe, User, ShieldAlert } from 'lucide-react';
import { ActiveLanguage } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { Logo } from './Logo';

interface HeaderProps {
  currentView: string;
  onSetView: (view: string) => void;
  lang: ActiveLanguage;
  onSetLang: (lang: ActiveLanguage) => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
}

export default function Header({
  currentView,
  onSetView,
  lang,
  onSetLang,
  isAdminLoggedIn,
  onOpenAdminLogin
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const languages: { code: ActiveLanguage; name: string }[] = [
    { code: 'es', name: 'ESP' },
    { code: 'en', name: 'ENG' },
    { code: 'pt', name: 'POR' }
  ];

  const headerIsSolid = isScrolled || currentView !== 'home';

  return (
    <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${headerIsSolid ? 'bg-dark/85 backdrop-blur-lg border-b border-white/5' : 'bg-transparent border-b border-transparent'} py-4 px-6 lg:px-12 flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-x-24`}>
      {/* Desktop navigation link array - Left split (Home, About, Portfolio) */}
      <nav className="hidden lg:flex items-center space-x-8 z-10 justify-start">
        {menuItems.slice(0, 3).map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`text-[10px] font-mono tracking-widest uppercase transition-all relative pb-1 cursor-pointer ${
                isActive ? 'text-gold-400 font-bold' : 'text-white/70 hover:text-gold-400'
              }`}
            >
              <span>{item.label}</span>
              {isActive && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-px bg-gold-400"
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
        className="flex items-center cursor-pointer group z-20 lg:flex lg:justify-center lg:items-center gap-3 py-1"
      >
        <Logo size="xs" className="scale-110 lg:scale-125" />
        <span id="header-logo" className="font-serif text-[10px] sm:text-[11px] lg:text-[13px] font-semibold tracking-[0.25em] text-white group-hover:text-gold-400 transition-colors duration-500 whitespace-nowrap uppercase">
          Miriam Campos
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
                  isActive ? 'text-gold-400 font-bold' : 'text-white/70 hover:text-gold-400'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-px bg-gold-400"
                    layoutId="activeNavLine"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="h-4 w-px bg-white/10" />

        <div className="flex items-center space-x-5">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center space-x-1.5 text-white/70 hover:text-gold-400 text-[10px] font-mono tracking-widest uppercase cursor-pointer transition-colors"
            >
              <Globe size={12} className="text-gold-400" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <AnimatePresence>
              {showLanguageDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLanguageDropdown(false)} />
                  <motion.div
                    className="absolute right-0 mt-2.5 w-24 bg-charcoal border border-white/10 rounded-lg shadow-2xl overflow-hidden z-20 text-left"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    {languages.map(item => (
                      <button
                        key={item.code}
                        onClick={() => {
                          onSetLang(item.code);
                          setShowLanguageDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-[10px] font-mono transition-all ${
                          lang === item.code 
                            ? 'bg-gold-500 text-dark font-bold' 
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
            className={`px-4 py-2 border rounded-full text-[9px] font-mono tracking-widest uppercase transition-all flex items-center space-x-1 cursor-pointer ${
              currentView === 'admin'
                ? 'bg-gold-500 border-gold-500 text-dark font-bold'
                : 'border-white/15 text-white/70 hover:border-gold-400 hover:text-gold-400 hover:bg-white/5'
            }`}
          >
            {isAdminLoggedIn ? (
              <>
                <ShieldAlert size={10} className="animate-pulse text-dark" />
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
      <div className="lg:hidden flex items-center space-x-4">
        {/* Languages inline selector */}
        <div className="flex space-x-2">
          {languages.map(item => (
            <button
              key={item.code}
              onClick={() => onSetLang(item.code)}
              className={`text-[9px] font-mono p-1 rounded ${
                lang === item.code ? 'text-gold-400 font-bold underline' : 'text-white/40'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white/80 p-1 hover:text-white"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer slider overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 top-[56px] bg-dark/95 backdrop-blur-md z-30 lg:hidden flex flex-col justify-between p-6 text-left"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <div className="space-y-6 pt-4">
              {menuItems.map(item => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`block w-full text-left font-serif text-2xl tracking-wide border-b border-white/5 pb-2 ${
                      isActive ? 'text-gold-400 font-bold' : 'text-white/95'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 pb-12">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (isAdminLoggedIn) {
                    onSetView('admin');
                  } else {
                    onOpenAdminLogin();
                  }
                }}
                className="w-full py-3 border border-white/15 text-white/80 hover:text-gold-300 rounded-lg text-xs font-mono tracking-widest uppercase transition-all flex items-center justify-center space-x-1.5"
              >
                <User size={12} />
                <span>{isAdminLoggedIn ? 'Backoffice CMS' : 'Staff Login'}</span>
              </button>

              <div className="text-center flex flex-col items-center justify-center pt-2">
                <Logo size="xs" className="mb-2 opacity-60" />
                <span className="font-serif text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase">
                  Miriam Campos Photography
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
