import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-10 text-center rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#FAFAF9] ${className || ''}`}>
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white border border-[#E5E7EB] text-[#9CA3AF] mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-[#171717] mb-1">{title}</h3>
      {description && (
        <p className="text-[13px] text-[#6B7280] max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="default">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
