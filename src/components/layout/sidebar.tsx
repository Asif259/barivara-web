'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Home,
  Users,
  FileText,
  Receipt,
  CreditCard,
  Wallet,
  BarChart3,
  Bell,
  LogOut,
  ChevronRight,
  Settings as SettingsIcon,
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
    <aside className="flex h-full flex-col justify-between bg-slate-900 text-slate-100 border-r border-slate-800 w-64 select-none">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-lg shadow-emerald-500/20">
              <Image src="/logo.png" alt="BariVara" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                বাড়িভাড়া <span className="text-xs px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-normal">v1</span>
              </span>
              <span className="text-xs text-slate-400 block font-normal">Smart Rental Manager</span>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1.5 flex-1">
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
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-emerald-400">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Owner'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || user?.phone || 'Landlord'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{t.logout}</span>
        </button>
      </div>
    </aside>
  );
}
