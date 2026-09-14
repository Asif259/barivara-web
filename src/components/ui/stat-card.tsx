import React from 'react';
import { Card, CardContent } from './card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-emerald-600',
  iconBgColor = 'bg-emerald-50',
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border-[#E5E7EB] bg-white", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#6B7280]">{title}</p>
            <h3 className="text-2xl font-semibold tracking-tight text-[#171717]">{value}</h3>
            {subtitle && <p className="text-xs text-[#6B7280]">{subtitle}</p>}
          </div>
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-md", iconBgColor)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        </div>

        {trend && (
          <div className="mt-4 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "font-semibold",
                trend.isPositive ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {trend.value}
            </span>
            <span className="text-slate-400">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
