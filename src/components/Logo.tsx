import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  xs: 'h-8 w-8 sm:h-10 sm:w-10',
  sm: 'h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16',
  md: 'h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24',
  lg: 'h-24 w-24 sm:h-28 sm:w-28 lg:h-36 lg:w-36',
  xl: 'h-32 w-32 sm:h-40 sm:w-40 lg:h-48 lg:w-48',
} as const;

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <img
        src="/logo.png"
        alt="Miriam Campos Photography"
        className={`${sizeClasses[size]} object-contain drop-shadow-[0_2px_10px_rgba(189,133,122,0.15)] transition-all duration-700 hover:scale-105`}
      />
    </div>
  );
};
