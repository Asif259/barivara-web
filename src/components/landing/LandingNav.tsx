'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLandingCopy } from './use-landing-copy';
import { useSetLanguage } from '@/stores/language-store';

const NAV_ITEMS = [
  { key: 'features', href: '#features' },
  { key: 'comparison', href: '#comparison' },
  { key: 'howItWorks', href: '#how-it-works' },
  { key: 'trust', href: '#trust' },
  { key: 'roadmap', href: '#roadmap' },
] as const;

export default function LandingNav() {
  const { lang, t } = useLandingCopy();
  const setLanguage = useSetLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const jump = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    setOpen(false);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  const toggleLanguage = () => setLanguage(lang === 'bn' ? 'en' : 'bn');

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-white/10 bg-[#05100c]/85 backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8" aria-label="BariVara">
        <Link href="/" className="flex items-center gap-2.5 text-[#e9f3ee]" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_t.png" alt="" className="h-7 w-7 rounded-md object-contain" />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight">{t.common.appName}</span>
            <span className="mt-0.5 text-[9px] uppercase tracking-[0.22em] text-[#9db3a8]">BariVara</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              onClick={(event) => jump(event, item.href)}
              className="text-[13px] text-[#c7d8d0] transition-colors hover:text-white"
            >
              {t.nav[item.key]}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div
            className="hidden items-center rounded-full border border-white/12 bg-white/[0.04] p-0.5 sm:flex"
            role="group"
            aria-label={t.common.switchLanguage}
          >
            <button
              type="button"
              onClick={() => setLanguage('bn')}
              aria-pressed={lang === 'bn'}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] transition-colors',
                lang === 'bn' ? 'bg-[#7ff0c2] text-[#05100c]' : 'text-[#9db3a8] hover:text-white',
              )}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              aria-pressed={lang === 'en'}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] transition-colors',
                lang === 'en' ? 'bg-[#7ff0c2] text-[#05100c]' : 'text-[#9db3a8] hover:text-white',
              )}
            >
              EN
            </button>
          </div>

          <Link
            href="/login"
            className="hidden h-9 items-center rounded-full px-3 text-[13px] text-[#c7d8d0] transition-colors hover:text-white sm:inline-flex"
          >
            {t.common.login}
          </Link>
          <Link
            href="/register"
            className="hidden h-9 items-center rounded-full bg-[#7ff0c2] px-4 text-[13px] font-medium text-[#05100c] transition-colors hover:bg-[#a6f7d6] sm:inline-flex"
          >
            {t.common.getStarted}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? t.common.closeMenu : t.common.openMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-[#e9f3ee] lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-white/10 bg-[#05100c]/95 px-5 pb-8 pt-3 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col divide-y divide-white/[0.08]">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={(event) => jump(event, item.href)}
                className="py-3.5 text-[15px] text-[#e9f3ee]"
              >
                {t.nav[item.key]}
              </a>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-[13px] text-[#e9f3ee]"
            >
              {lang === 'bn' ? t.common.switchToEnglish : t.common.switchToBangla}
            </button>
            <div className="flex gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 items-center rounded-full border border-white/15 px-4 text-[13px] text-[#e9f3ee]"
              >
                {t.common.login}
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 items-center rounded-full bg-[#7ff0c2] px-4 text-[13px] font-medium text-[#05100c]"
              >
                {t.common.getStarted}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
