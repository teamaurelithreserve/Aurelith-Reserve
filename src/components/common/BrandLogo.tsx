import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import lightLogo from '../../assets/images/aurelith_logo_light.png';
import darkLogo from '../../assets/images/aurelith_logo_dark.png';

interface BrandLogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  textClassName?: string;
  subtextClassName?: string;
  subtext?: string;
  variant?: 'auto' | 'light' | 'dark';
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  imgClassName = 'h-8 w-auto object-contain',
  showText = false,
  textClassName = '',
  subtextClassName = '',
  subtext,
  variant = 'auto',
  alt = 'Aurelith Reserve Logo',
}) => {
  const { isDark } = useTheme();

  const isDarkMode = variant === 'auto' ? isDark : variant === 'dark';
  const logoSrc = isDarkMode ? darkLogo : lightLogo;

  const defaultTextColor = isDarkMode ? 'text-white' : 'text-[#1C2B4C]';
  const defaultSubtextColor = isDarkMode ? 'text-red-400' : 'text-[#C8102E]';

  return (
    <div className={`inline-flex items-center space-x-2.5 select-none ${className}`}>
      <img
        src={logoSrc}
        alt={alt}
        className={`shrink-0 transition-opacity duration-200 ${imgClassName}`}
        loading="eager"
      />
      {showText && (
        <div className="flex flex-col text-left leading-none">
          <span
            className={`font-extrabold tracking-tight font-sans ${textClassName || defaultTextColor}`}
          >
            AURELITH RESERVE
          </span>
          {subtext && (
            <span
              className={`text-[8px] sm:text-[8.5px] uppercase tracking-[0.22em] font-bold mt-0.5 ${
                subtextClassName || defaultSubtextColor
              }`}
            >
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
