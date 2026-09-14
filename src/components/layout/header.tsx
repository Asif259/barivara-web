'use client';

import React from 'react';
import { Menu, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/stores/language-store';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslation } from '@/lib/translations';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { language, setLanguage } = useLanguageStore();
  const t = useTranslation(language);
  const { user } = useAuthStore();
  const pathname = usePathname();

  const pageContext = pathname.startsWith('/properties')
    ? t.properties
    : pathname.startsWith('/tenants')
      ? t.tenants
      : pathname.startsWith('/agreements')
        ? t.agreements
        : pathname.startsWith('/rents')
          ? t.monthlyRents
          : pathname.startsWith('/payments')
            ? t.payments
            : pathname.startsWith('/expenses')
              ? t.expenses
              : pathname.startsWith('/reports')
                ? t.reports
                : pathname.startsWith('/settings')
                  ? t.settings
                  : t.dashboard;

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E5E7EB] bg-white px-4 md:px-7">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#171717] transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <span>BariVara</span>
            <span className="text-[#D1D5DB]">/</span>
            <span className="font-medium text-[#374151]">{pageContext}</span>
          </div>
          <p className="mt-1 text-xs text-[#6B7280]">
            {language === 'bn' ? 'স্বাগতম, ' : 'Welcome back, '}
            <span className="font-medium text-[#12664F]">{user?.name || 'Owner'}</span>
            <span className="mx-1.5 text-[#D1D5DB]">·</span>
            {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="gap-1.5 text-xs font-medium text-[#374151] rounded-md border-[#E5E7EB] hover:bg-[#F3F4F6]"
        >
          <Globe className="w-3.5 h-3.5 text-[#12664F]" />
          {language === 'bn' ? 'English' : 'বাংলা'}
        </Button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#E5E7EB]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F3EF] text-[#12664F] font-semibold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}