'use client';

import React from 'react';
import { useFileDownloadUrl } from '@/hooks/use-file-download-url';

interface TenantAvatarProps {
  profilePictureId: string | undefined | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const sizeClasses = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function TenantAvatar({ profilePictureId, name, size = 'md', onClick, disabled, ariaLabel }: TenantAvatarProps) {
  const { data: imageUrl, isLoading } = useFileDownloadUrl(profilePictureId);

  const fallback = name.charAt(0).toUpperCase();

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading || !imageUrl}
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#CDE4DA] bg-[#E8F3EF] font-semibold text-[#12664F] disabled:cursor-default ${sizeClasses[size]}`}
      aria-label={ariaLabel}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-pulse rounded bg-[#CDE4DA]" />
      ) : imageUrl ? (
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        fallback
      )}
    </button>
  );
}