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
    <Card className={cn("overflow-hidden border-slate-200/80 bg-white", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs", iconBgColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
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
