"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface MobileDataRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Line 1 Left: Primary Identity (e.g. Tenant name, Property name, Category) */
  identity: React.ReactNode;
  /** Line 1 Right: Primary Value (e.g. Amount Due, Rent, Units). Always aligned right, tabular numerals. */
  value?: React.ReactNode;
  /** Line 2 Left: State dot/badge + labeled supporting details (e.g. ● Overdue · Due Sep 10) */
  stateAndDetail?: React.ReactNode;
  /** Line 2 Right: Action button, dropdown menu, or icon trigger */
  action?: React.ReactNode;
  /** Optional click handler to expand row details / open BottomSheet */
  onClick?: () => void;
  /** If true, shows a subtle chevron indicator on row tap */
  showChevron?: boolean;
}

/**
 * High-density 2-line mobile data row complying with the Global Responsive Table Design Pattern.
 * - Line 1: Primary Identity (Left) | Primary Value (Right)
 * - Line 2: State + Supporting Detail (Left) | Action / Detail CTA (Right)
 */
export function MobileDataRow({
  identity,
  value,
  stateAndDetail,
  action,
  onClick,
  showChevron = false,
  className,
  ...props
}: MobileDataRowProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "group relative flex flex-col justify-center px-4 py-3 border-b border-[#F1F5F9] bg-white transition-colors",
        onClick && "cursor-pointer hover:bg-slate-50/80 active:bg-slate-100/70 select-none",
        className
      )}
      {...props}
    >
      {/* LINE 1: Primary Identity (Left) & Primary Value (Right) */}
      <div className="flex items-baseline justify-between gap-3 min-w-0">
        <div className="font-medium text-sm text-[#0F172A] truncate flex-1 leading-snug">
          {identity}
        </div>
        {value && (
          <div className="text-sm font-semibold text-[#0F172A] tabular-nums whitespace-nowrap text-right shrink-0 tracking-tight">
            {value}
          </div>
        )}
      </div>

      {/* LINE 2: State + Supporting Detail (Left) & Action (Right) */}
      <div className="flex items-center justify-between gap-2 mt-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-[#64748B] truncate flex-1 leading-tight">
          {stateAndDetail}
        </div>
        
        <div
          className="flex items-center gap-1 shrink-0 ml-2"
          onClick={(e) => e.stopPropagation()} // Prevent triggering row click when tapping action
        >
          {action}
          {showChevron && onClick && (
            <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#64748B] transition-colors" />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile Table Skeleton with 2-line pulse rows matching the responsive mobile view geometry.
 */
export function MobileTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-[#F1F5F9] bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 flex flex-col gap-2">
          {/* Line 1 Skeleton */}
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          {/* Line 2 Skeleton */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
            <Skeleton className="h-4 w-6 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Compact Status Indicator (Dot + Label) for mobile rows
 */
export function CompactStatus({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  const dotColor = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-blue-500",
    neutral: "bg-slate-400",
  }[variant];

  const textColor = {
    success: "text-emerald-700",
    warning: "text-amber-700",
    danger: "text-rose-700",
    info: "text-blue-700",
    neutral: "text-slate-600",
  }[variant];

  return (
    <span className={cn("inline-flex items-center gap-1.5 font-medium text-xs", textColor)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
      <span>{label}</span>
    </span>
  );
}

/**
 * Container component wrapping both Desktop and Mobile representations.
 * Sets CSS container query context (`@container`) and standard mobile-first visibility.
 */
export function ResponsiveTableContainer({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "table-container w-full rounded-lg border border-[#E2E8F0] bg-white overflow-hidden shadow-none",
        className
      )}
      style={{ containerType: "inline-size" }}
    >
      {children}
    </div>
  );
}
