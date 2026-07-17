import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  // Determine dimensions based on size prop
  const dimensions = {
    xs: 'h-8 w-8 sm:h-10 sm:w-10',
    sm: 'h-14 w-14',
    md: 'h-20 w-20 lg:h-24 lg:w-24',
    lg: 'h-28 w-28 lg:h-36 lg:w-36',
    xl: 'h-40 w-40 lg:h-48 lg:w-48',
  }[size];

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* High-fidelity Vector SVG representing Miriam's original round logo */}
      <svg
        viewBox="0 0 100 100"
        className={`${dimensions} w-auto h-full drop-shadow-[0_2px_10px_rgba(189,133,122,0.15)] transition-all duration-700 hover:scale-105`}
      >
        <defs>
          {/* High-end Metallic Rose Gold Gradient */}
          <linearGradient id="goldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#834E45" />
            <stop offset="30%" stopColor="#BD857A" />
            <stop offset="50%" stopColor="#ECD1CC" />
            <stop offset="70%" stopColor="#BD857A" />
            <stop offset="100%" stopColor="#64352D" />
          </linearGradient>

          {/* Text paths for top and bottom curved text */}
          {/* Top arc (clockwise) */}
          <path
            id="textPathTop"
            d="M 17,50 A 33,33 0 0,1 83,50"
            fill="none"
          />
          {/* Bottom arc (counter-clockwise/reversed to keep text readable left-to-right at bottom) */}
          <path
            id="textPathBottom"
            d="M 83,52 A 33,33 0 0,1 17,52"
            fill="none"
          />
        </defs>

        {/* Outer Elegant Gold Ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="1"
          className="opacity-90"
        />

        {/* Thin Inner Concentric Ring */}
        <circle
          cx="50"
          cy="50"
          r="41"
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="0.3"
          className="opacity-40"
        />

        {/* Top Text: MIRIAM CAMPOS */}
        <text className="font-serif text-[5.5px] uppercase tracking-[0.25em]" fill="#2C0F0A">
          <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
            MIRIAM CAMPOS
          </textPath>
        </text>

        {/* Bottom Text: PHOTOGRAPHY */}
        <text className="font-serif text-[4.8px] uppercase tracking-[0.22em] font-medium" fill="url(#goldGrad)">
          <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
            PHOTOGRAPHY
          </textPath>
        </text>

        {/* Center Cursive Monogram "mc" */}
        <text
          x="44"
          y="57"
          fontFamily="'Alex Brush', 'Dancing Script', cursive"
          fontSize="26"
          fill="url(#goldGrad)"
          textAnchor="middle"
          className="font-light"
        >
          m
        </text>
        <text
          x="58"
          y="57"
          fontFamily="'Alex Brush', 'Dancing Script', cursive"
          fontSize="26"
          fill="url(#goldGrad)"
          textAnchor="middle"
          className="font-light"
        >
          c
        </text>

        {/* Stylized Rose Accent nestled on the cursive letters (x: ~59, y: ~46) */}
        <g transform="translate(59, 46)">
          {/* Green leaves */}
          <path
            d="M 0,0 C -2,-3 -5,-2 -5,1 C -5,3 -2,3 0,0 Z"
            fill="#5E7A52"
            opacity="0.9"
          />
          <path
            d="M 0,0 C 2,-3 5,-2 5,1 C 5,3 2,3 0,0 Z"
            fill="#5E7A52"
            opacity="0.9"
          />
          {/* Layered Rose Pink Petals */}
          <circle cx="0" cy="0" r="2.8" fill="#E89696" />
          <circle cx="-0.6" cy="-0.6" r="1.8" fill="#DF7272" />
          <circle cx="0.5" cy="0.5" r="1.2" fill="#CC4B4B" />
          <circle cx="0" cy="0" r="0.6" fill="#A82828" />
        </g>
      </svg>
    </div>
  );
};
