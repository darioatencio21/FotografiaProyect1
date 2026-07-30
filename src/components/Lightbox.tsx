/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Eye, Heart, Download, Share2, X, ChevronLeft, ChevronRight, Sliders, Layers } from 'lucide-react';
import { Photograph, ActiveLanguíage } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { sanitizeUrl } from '../lib/sanitize';
import StorageImage from './StorageImage';

interface LightboxProps {
  photo: Photograph;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  lang: ActiveLanguíage;
}

export default function Lightbox({
  photo,
  onClose,
  onNext,
  onPrev,
  isFavorite,
  onToggleFavorite,
  lang
}: LightboxProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'compare'>('info');
  const [compareSlider, setCompareSlider] = useState<number>(50);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showDownloadToast, setShowDownloadToast] = useState(false);

  const t = TRANSLATIONS[lang];

  function getPhotoDescription(photo: Photograph, l: ActiveLanguíage) {
    if (l === 'es') return photo.description_es || photo.description;

    return photo.description;
  }

  const handleImgRetry = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.dataset.retried) {
      img.dataset.retried = 'true';
      const sep = img.src.includes('?') ? '&' : '?';
      img.src = `${img.src}${sep}retry=${Date.now()}`;
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  const handleDownload = async () => {
    setShowDownloadToast(true);
    const safeUrl = sanitizeUrl(photo.url);
    if (!safeUrl) {
      setShowDownloadToast(false);
      return;
    }

    try {
      const fileName = `${photo.title.toLowerCase().replace(/\s+/g, '-')}-master.webp`;
      if (safeUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = safeUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowDownloadToast(false);
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
    setTimeout(() => {
      setShowDownloadToast(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col justify-between bg-overlay/80 backdrop-blur-md text-white p-4 lg:p-6 select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        data-cursor="close"
        data-cursor-text={t.customCursorClose}
      >
        {/* Navigation / Header */}
        <div className="flex items-center justify-between z-10 w-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-white/70 tracking-widest uppercase">
              {photo.category} &middot; {photo.resolution || '60MP'}
            </span>
            <h2 className="font-serif text-lg md:text-xl text-white/90 tracking-wide leading-tight">
              {photo.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={onToggleFavorite}
              className={`p-2 sm:p-2.5 rounded-full border border-stone transition-all ${
                isFavorite ? 'bg-white/10 border-white/20 text-white' : 'bg-dark-gray/60 hover:bg-white/10 text-white'
              }`}
              title="Add to Favorites"
            >
              <Heart size={14} className={isFavorite ? 'fill-dark' : ''} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 sm:p-2.5 rounded-full border border-stone bg-dark-gray/60 hover:bg-white/10 transition-all text-white"
              title="Download High-Res"
            >
              <Download size={14} />
            </button>
            <button
              onClick={handleShare}
              className="hidden sm:block p-2.5 rounded-full border border-stone bg-dark-gray/60 hover:bg-white/10 transition-all text-white"
              title="Share Link"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-full border border-stone bg-dark-gray/60 hover:bg-white/10 hover:text-white transition-all text-white"
              title="Close Gallery"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Dynamic Frame Selector */}
        <div 
          className="flex-1 flex flex-col lg:flex-row items-center justify-center my-4 relative max-h-[75vh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Previous Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-2 lg:left-6 p-4 rounded-full bg-dark-gray hover:bg-white/10 hover:text-white border border-stone/30 text-white/80 transition-all z-20"
            title="Previous"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Main Visual Arena */}
          <div className="w-full max-w-4xl h-full flex items-center justify-center relative overflow-hidden px-10">
            {activeTab !== 'compare' ? (
              <motion.img
                key={photo.id}
                src={sanitizeUrl(photo.url) || undefined}
                alt={photo.title}
                onError={handleImgRetry}
                className="max-h-[60vh] max-w-full object-contain rounded-sm shadow-2xl pointer-events-none transition-transform duration-300"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              /* High-End RAW vs Final grading comparison block */
              <div 
                className="relative max-h-[60vh] aspect-[3/2] w-full max-w-2xl rounded-md overflow-hidden shadow-2xl border border-stone"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Underlay RAW image (greyscale or desaturated slightly to replicate sensor RAW data) */}
                <div className="absolute inset-0 w-full h-full">
                  <StorageImage
                    src={sanitizeUrl(photo.url)}
                    alt="RAW"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-dark-gray/75 border border-stone px-2 py-1 text-[9px] font-mono tracking-widest text-white/75 rounded">
                    LEICA RAW DNG (14-BIT)
                  </div>
                </div>

                {/* Overlaid Edited final graded image (controlled by range slider) */}
                <div 
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${compareSlider}%` }}
                >
                  <StorageImage
                    src={sanitizeUrl(photo.url)}
                    alt="Master Color Graded"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: '100%', maxWidth: 'none' }}
                  />
                  <div className="absolute top-3 right-3 bg-white/10 border border-white/10 px-2 py-1 text-[9px] font-mono tracking-widest text-white font-semibold rounded">
                    AUREA MASTER WEB_RGB
                  </div>
                </div>

                {/* Range Controller Overlay */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={compareSlider}
                  onChange={(e) => setCompareSlider(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                />

                {/* Vertical Divider line */}
                <div 
                  className="absolute inset-y-0 w-0.5 bg-white/10 z-10 pointer-events-none flex items-center justify-center"
                  style={{ left: `${compareSlider}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-dark text-white flex items-center justify-center -ml-[15px] shadow-lg">
                    <Sliders size={12} className="rotate-90" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-2 lg:right-6 p-4 rounded-full bg-dark-gray hover:bg-white/10 hover:text-white border border-stone/30 text-white/80 transition-all z-20"
            title="Next"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Bottom Panel - Dynamic Interactive details bar */}
        <div 
          className="glass-premium rounded-lg w-full max-w-4xl mx-auto p-4 flex flex-col md:flex-row items-center justify-between text-left space-y-4 md:space-y-0 md:space-x-8 border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Controls tabs */}
          <div className="flex flex-col md:w-1/2 justify-between space-y-2">
            <div className="flex border-b border-stone pb-2 space-x-6 mb-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`text-xs font-mono tracking-widest uppercase pb-1 border-b-2 transition-all ${
                  activeTab === 'info' ? 'border-white/20 text-white/70' : 'border-transparent text-white/55 hover:text-white'
                }`}
              >
                Story
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                className={`text-xs font-mono tracking-widest uppercase pb-1 border-b-2 transition-all ${
                  activeTab === 'compare' ? 'border-white/20 text-white/70' : 'border-transparent text-white/55 hover:text-white'
                }`}
              >
                Compare Retouch
              </button>
            </div>

            <div className="h-16 overflow-y-auto pr-2 text-xs text-white/70">
              {activeTab === 'info' && (
                <p className="leading-relaxed font-sans">{getPhotoDescription(photo, lang)}</p>
              )}
              {activeTab === 'compare' && (
                <p className="leading-relaxed font-sans text-xs">
                  {t.compareDesc} Toggle or slide across the image to see raw digital highlights versus the signature gold-infused color revelation.
                </p>
              )}
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden md:block w-px h-16 bg-white/10" />

          {/* Elegant Details Column */}
          <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
            <div className="flex flex-col text-left space-y-1">
              <span className="text-[9px] font-mono text-white/70 uppercase tracking-widest">Commission / Location</span>
              <span className="text-sm font-serif font-medium text-white/95">
                {photo.exif.location || 'Fine Art Collection'}
              </span>
              <span className="text-[10px] font-mono text-white/40 uppercase">
                {photo.category} &middot; Archival Quality
              </span>
            </div>
          </div>
        </div>

        {/* Floating Toasts */}
        <AnimatePresence>
          {showShareToast && (
            <motion.div
              className="fixed bottom-6 right-6 glass-premium px-4 py-2.5 rounded-lg border border-white/10 text-white/50 text-xs font-mono tracking-wider flex items-center space-x-2 shadow-2xl z-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <span className="w-2 h-2 rounded-full bg-white/10 animate-ping" />
              <span>LINK COPIED TO CLIPBOARD</span>
            </motion.div>
          )}

          {showDownloadToast && (
            <motion.div
              className="fixed bottom-6 right-6 glass-premium px-4 py-2.5 rounded-lg border border-white/10 text-white/50 text-xs font-mono tracking-wider flex items-center space-x-2 shadow-2xl z-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="w-4 h-4 border-2 border-white/20 border-t-transparent rounded-full animate-spin" />
              <span>PREPARING MASTER 16-BIT WEB_RGB PACK...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
