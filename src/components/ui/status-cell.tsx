'use client';

import React from 'react';
import { StatusBadge } from './status-badge';
import { Button } from './button';
import { Eye } from 'lucide-react';

interface TableStatusCellProps {
  status: string;
  lang?: 'bn' | 'en';
  onView?: () => void;
  viewLabel?: string;
  className?: string;
}

/**
 * TableStatusCell
 * Reusable table component displaying status badge on top
 * with an optional stacked View button directly underneath.
 */
export function TableStatusCell({
  status,
  lang = 'bn',
  onView,
  viewLabel,
  className,
}: TableStatusCellProps) {
  const isEn = lang === 'en';
  const label = viewLabel || (isEn ? 'View' : 'দেখুন');

  return (
    <div className={`flex flex-col items-start gap-1 py-0.5 ${className || ''}`}>
      <StatusBadge status={status} lang={lang} />
      {onView && (
        <Button
          size="sm"
          variant="outline"
          onClick={onView}
          className="h-6 px-2 text-[11px] text-slate-700 hover:text-slate-900 hover:bg-slate-100 gap-1 rounded-md border-slate-200/90 shadow-none font-medium mt-0.5"
          title={label}
        >
          <Eye className="w-3 h-3 text-slate-500" />
          <span>{label}</span>
        </Button>
      )}
    </div>
  );
}
