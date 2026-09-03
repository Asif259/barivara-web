'use client';

import React from 'react';
import { Menu, Globe, Bell, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/stores/language-store';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslation } from '@/lib/translations';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { language, setLanguage } = useLanguageStore();
  const t = useTranslation(language);
  const { user } = useAuthStore();

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-800">
            {language === 'bn' ? 'স্বাগতম, ' : 'Welcome back, '}
            <span className="text-emerald-600">{user?.name || 'Owner'}</span>
          </p>
          <p className="text-xs text-slate-500">
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
          className="gap-1.5 text-xs font-semibold text-slate-700 rounded-xl border-slate-200 hover:bg-slate-100"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          {language === 'bn' ? 'English' : 'বাংলা'}
        </Button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
