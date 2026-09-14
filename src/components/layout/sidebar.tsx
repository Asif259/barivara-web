'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Receipt,
  CreditCard,
  Wallet,
  BarChart3,
  LogOut,
  Settings as SettingsIcon,
  X,
} from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const { logout, user } = useAuthStore();

  const navItems = [
    {
      title: t.dashboard,
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t.properties,
      href: '/properties',
      icon: Building2,
    },
    {
      title: t.tenants,
      href: '/tenants',
      icon: Users,
    },
    {
      title: t.agreements,
      href: '/agreements',
      icon: FileText,
    },
    {
      title: t.monthlyRents,
      href: '/rents',
      icon: Receipt,
    },
    {
      title: t.payments,
      href: '/payments',
      icon: CreditCard,
    },
    {
      title: t.expenses,
      href: '/expenses',
      icon: Wallet,
    },
    {
      title: t.reports,
      href: '/reports',
      icon: BarChart3,
    },
    {
      title: t.settings,
      href: '/settings',
      icon: SettingsIcon,
    },
  ];

  return (
    <aside className="flex h-full flex-col justify-between bg-white text-[#171717] border-r border-[#E5E7EB] w-64 select-none">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0">
              <Image src="/logo.png" alt="BariVara" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-base font-semibold text-[#171717] tracking-tight flex items-center gap-1.5">
                বাড়িভাড়া <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0FDF4] text-[#12664F] font-medium">v1</span>
              </span>
              <span className="text-xs text-[#6B7280] block font-normal">Smart Rental Manager</span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex md:hidden h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:text-[#171717] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-0.5 flex-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 group',
                  isActive
                    ? 'bg-[#E8F3EF] text-[#12664F]'
                    : 'text-[#6B7280] hover:text-[#171717] hover:bg-[#F3F4F6]'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-[#12664F]' : 'text-[#9CA3AF] group-hover:text-[#307473]'
                    )}
                  />
                  <span>{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="p-4 border-t border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-lg bg-[#E8F3EF] border border-[#CDE4DA] flex items-center justify-center text-sm font-semibold text-[#12664F]">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-[#171717] truncate">{user?.name || 'Owner'}</p>
              <p className="text-[11px] text-[#6B7280] truncate">{user?.email || user?.phone || 'Landlord'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{t.logout}</span>
        </button>
      </div>
    </aside>
  );
}