'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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

export function Sidebar({
  onClose,
  isMobile = false,
  className,
  isHovered: externalHovered,
  isFocused: externalFocused,
  onMouseEnter,
  onMouseLeave,
  onFocusCapture,
  onBlurCapture,
}: {
  onClose?: () => void;
  isMobile?: boolean;
  className?: string;
  isHovered?: boolean;
  isFocused?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocusCapture?: () => void;
  onBlurCapture?: (e: React.FocusEvent<HTMLElement>) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const { logout, user } = useAuthStore();

  const [internalHovered, setInternalHovered] = useState(false);
  const [internalFocused, setInternalFocused] = useState(false);

  const isHovered = externalHovered !== undefined ? externalHovered : internalHovered;
  const isFocused = externalFocused !== undefined ? externalFocused : internalFocused;

  // Mobile mode is always fully expanded; desktop expands on hover or keyboard focus
  const isExpanded = isMobile || isHovered || isFocused;

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
    <aside
      onMouseEnter={() => {
        if (!isMobile) {
          if (onMouseEnter) onMouseEnter();
          else setInternalHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          if (onMouseLeave) onMouseLeave();
          else setInternalHovered(false);
        }
      }}
      onFocusCapture={() => {
        if (!isMobile) {
          if (onFocusCapture) onFocusCapture();
          else setInternalFocused(true);
        }
      }}
      onBlurCapture={(e) => {
        if (!isMobile) {
          if (onBlurCapture) {
            onBlurCapture(e);
          } else if (!e.currentTarget.contains(e.relatedTarget)) {
            setInternalFocused(false);
          }
        }
      }}
      className={cn(
        'flex flex-col justify-between bg-white text-[#171717] select-none',
        isMobile
          ? 'relative h-full w-72 border-r border-[#E5E7EB]'
          : cn(
              'fixed left-0 top-0 bottom-0 h-screen z-40 border-r border-[#E5E7EB] transition-[width] duration-200 ease-in-out',
              isExpanded ? 'w-[250px]' : 'w-[68px]'
            ),
        className
      )}
    >
      <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 border-b border-[#E5E7EB] flex items-center px-3 justify-between shrink-0 overflow-hidden">
          <Link
            href="/dashboard"
            className="flex items-center group overflow-hidden"
            onClick={() => onClose?.()}
            title={!isExpanded ? t.appName : undefined}
          >
            {/* Fixed 44px slot centered in 68px width: padding 12px + 22px center = 34px */}
            <div className="w-[44px] h-10 flex items-center justify-center shrink-0">
              <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0 shadow-xs border border-[#E5E7EB]/80">
                <Image
                  src="/logo.png"
                  alt="BariVara"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div
              className={cn(
                'flex flex-col whitespace-nowrap overflow-hidden transition-all duration-200 origin-left ml-2',
                isExpanded
                  ? 'opacity-100 max-w-[160px] translate-x-0'
                  : 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
              )}
            >
              <span className="text-base font-bold text-[#171717] tracking-tight leading-tight">
                {t.appName}
              </span>
              <span className="text-[11px] text-[#6B7280] font-normal leading-tight">
                Smart Rental Manager
              </span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="flex md:hidden h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:text-[#171717] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors shrink-0 mr-1 cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1 flex-1 overflow-x-hidden">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose?.()}
                title={!isExpanded ? item.title : undefined}
                className={cn(
                  'relative flex items-center h-10 rounded-lg text-sm font-medium transition-colors duration-150 group overflow-hidden',
                  isActive
                    ? 'bg-[#E8F3EF] text-[#12664F] font-semibold'
                    : 'text-[#6B7280] hover:text-[#171717] hover:bg-[#F3F4F6]'
                )}
              >
                {/* Fixed icon slot (44px wide), perfectly stationary in collapsed and expanded states */}
                <div className="w-[44px] h-10 flex items-center justify-center shrink-0">
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-colors',
                      isActive ? 'text-[#12664F]' : 'text-[#6B7280] group-hover:text-[#307473]'
                    )}
                  />
                </div>

                {/* Text Label: smoothly reveals without wrapping or shifting the icon */}
                <span
                  className={cn(
                    'whitespace-nowrap transition-all duration-200 origin-left select-none',
                    isExpanded
                      ? 'opacity-100 max-w-[175px] translate-x-0 ml-1.5'
                      : 'opacity-0 max-w-0 -translate-x-2 pointer-events-none ml-0'
                  )}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-t border-[#E5E7EB] shrink-0 overflow-hidden">
        <div className="flex items-center mb-2.5 overflow-hidden">
          <div className="w-[44px] h-10 flex items-center justify-center shrink-0">
            <div className="h-9 w-9 rounded-lg bg-[#E8F3EF] border border-[#CDE4DA] flex items-center justify-center text-sm font-semibold text-[#12664F] shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
          <div
            className={cn(
              'flex flex-col whitespace-nowrap overflow-hidden transition-all duration-200 origin-left ml-2',
              isExpanded
                ? 'opacity-100 max-w-[160px] translate-x-0'
                : 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
            )}
          >
            <p className="text-xs font-semibold text-[#171717] truncate">{user?.name || 'Owner'}</p>
            <p className="text-[11px] text-[#6B7280] truncate">{user?.email || user?.phone || 'Landlord'}</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            router.replace('/login');
          }}
          title={!isExpanded ? t.logout : undefined}
          className="relative flex items-center h-10 w-full rounded-lg text-xs font-medium text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] transition-colors cursor-pointer overflow-hidden group"
        >
          <div className="w-[44px] h-10 flex items-center justify-center shrink-0">
            <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
          </div>
          <span
            className={cn(
              'whitespace-nowrap font-medium transition-all duration-200 origin-left',
              isExpanded
                ? 'opacity-100 max-w-[160px] translate-x-0 ml-1.5'
                : 'opacity-0 max-w-0 -translate-x-2 pointer-events-none ml-0'
            )}
          >
            {t.logout}
          </span>
        </button>
      </div>
    </aside>
  );
}