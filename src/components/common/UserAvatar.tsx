import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  className?: string;
  initialsClassName?: string;
  shape?: 'circle' | 'rounded-2xl' | 'rounded-xl';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  firstName,
  lastName,
  avatarUrl,
  className = '',
  initialsClassName = '',
  shape = 'circle',
  size = 'md',
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  const shapeClasses =
    shape === 'rounded-2xl'
      ? 'rounded-2xl'
      : shape === 'rounded-xl'
      ? 'rounded-xl'
      : 'rounded-full';

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl',
  }[size];

  const initials = `${firstName?.[0] || 'A'}${lastName?.[0] || 'R'}`.toUpperCase();

  if (avatarUrl && !imageFailed) {
    return (
      <div
        className={`relative overflow-hidden shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${shapeClasses} ${sizeClasses} ${className}`}
      >
        <img
          src={avatarUrl}
          alt={`${firstName} ${lastName}`}
          className={`w-full h-full object-cover ${shapeClasses}`}
          onError={() => setImageFailed(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 bg-gradient-to-br from-[#1C2B4C] to-[#2B3E68] text-white flex items-center justify-center font-bold tracking-tight shadow-xs ${shapeClasses} ${sizeClasses} ${className}`}
      aria-label={`${firstName} ${lastName}`}
    >
      <span className={initialsClassName || 'font-bold'}>{initials}</span>
    </div>
  );
};
