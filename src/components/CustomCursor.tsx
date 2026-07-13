/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'view' | 'close' | 'drag'>('default');
  const [cursorText, setCursorText] = useState('');

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 30, stiffness: 350, mass: 0.6 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Add custom cursor active class to html body
    document.body.classList.add('custom-cursor-active');

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Dynamic hover listeners for links, buttons, images, and special components
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const hoverView = target.closest('[data-cursor="view"]');
      const hoverClose = target.closest('[data-cursor="close"]');
      const hoverDrag = target.closest('[data-cursor="drag"]');
      const hoverInteractive = target.closest('a, button, select, input, textarea, [role="button"]');

      if (hoverClose) {
        setCursorType('close');
        setCursorText(target.getAttribute('data-cursor-text') || 'CLOSE');
      } else if (hoverView) {
        setCursorType('view');
        setCursorText(target.getAttribute('data-cursor-text') || 'VIEW');
      } else if (hoverDrag) {
        setCursorType('drag');
        setCursorText(target.getAttribute('data-cursor-text') || 'DRAG');
      } else if (hoverInteractive) {
        setCursorType('view');
        setCursorText('');
      } else {
        setCursorType('default');
        setCursorText('');
      }
    };

    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-gold-400 pointer-events-none z-50 mix-blend-difference hidden lg:block"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: cursorType !== 'default' ? 70 : 32,
          height: cursorType !== 'default' ? 70 : 32,
          backgroundColor: cursorType !== 'default' ? 'rgba(183, 126, 114, 0.15)' : 'rgba(0, 0, 0, 0)',
          borderColor: cursorType !== 'default' ? '#DFBAB1' : '#BD857A',
        }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.2 }}
      />

      {/* Inner Dot & Text */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 flex items-center justify-center hidden lg:flex"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="rounded-full bg-gold-400 flex items-center justify-center text-[9px] tracking-widest font-mono text-dark font-semibold uppercase whitespace-nowrap overflow-hidden"
          animate={{
            width: cursorType !== 'default' && cursorText ? 56 : 6,
            height: cursorType !== 'default' && cursorText ? 56 : 6,
            backgroundColor: cursorType !== 'default' ? '#BD857A' : '#BD857A',
          }}
          transition={{ type: 'tween', duration: 0.15 }}
        >
          {cursorType !== 'default' && cursorText && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {cursorText}
            </motion.span>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
