'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'li' | 'section' | 'article';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '-12% 0px -8% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      data-visible={visible}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
      className={cn('bv-reveal', className)}
    >
      {children}
    </Tag>
  );
}

export function Eyebrow({
  children,
  tone = 'dark',
  className,
}: {
  children: ReactNode;
  tone?: 'dark' | 'light';
  className?: string;
}) {
  return (
    <p
      className={cn(
        'text-xs font-medium tracking-normal',
        tone === 'dark' ? 'text-[#8fe9c4]' : 'text-[#12664F]',
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  tone = 'light',
  align = 'left',
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: string;
  tone?: 'dark' | 'light';
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'max-w-[680px]',
        align === 'center' && 'mx-auto text-center',
        tone === 'dark' ? 'text-[#e9f3ee]' : 'text-[#0d1f18]',
        className,
      )}
    >
      <Eyebrow tone={tone} className={cn(align === 'center' && 'justify-center')}>
        {eyebrow}
      </Eyebrow>
      <h2 className="mt-3 text-balance text-2xl font-semibold leading-tight tracking-normal sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            'mt-4 text-pretty text-sm leading-relaxed sm:text-base',
            tone === 'dark' ? 'text-[#9db3a8]' : 'text-[#384940]',
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

const STATUS_STYLES: Record<string, { light: string; dark: string }> = {
  paid: {
    light: 'bg-[#12664F]/10 text-[#0f5441]',
    dark: 'bg-[#8fe9c4]/15 text-[#8fe9c4]',
  },
  partial: {
    light: 'bg-[#b45309]/10 text-[#92400e]',
    dark: 'bg-[#f0c05a]/15 text-[#f0c05a]',
  },
  pending: {
    light: 'bg-[#1e40af]/10 text-[#1e40af]',
    dark: 'bg-[#93c5fd]/15 text-[#bfdbfe]',
  },
  overdue: {
    light: 'bg-[#991b1b]/10 text-[#991b1b]',
    dark: 'bg-[#f87171]/15 text-[#fca5a5]',
  },
  vacant: {
    light: 'bg-[#0d1f18]/6 text-[#4b5f57]',
    dark: 'bg-white/10 text-[#a3b8ad]',
  },
  occupied: {
    light: 'bg-[#12664F]/10 text-[#0f5441]',
    dark: 'bg-[#8fe9c4]/15 text-[#8fe9c4]',
  },
};

export function StatusPill({
  label,
  tone = 'vacant',
  onDark = false,
  className,
}: {
  label: string;
  tone?: string;
  onDark?: boolean;
  className?: string;
}) {
  const styles = STATUS_STYLES[tone] ?? STATUS_STYLES.vacant;
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium tracking-normal',
        onDark ? styles.dark : styles.light,
        className,
      )}
    >
      {label}
    </span>
  );
}

export function LandingCta({
  href,
  children,
  variant = 'solid',
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: 'solid' | 'ghost' | 'paper';
  className?: string;
}) {
  const base =
    'group inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const styles = {
    solid:
      'bg-[#7ff0c2] text-[#05100c] hover:bg-[#a6f7d6] focus-visible:ring-[#7ff0c2] focus-visible:ring-offset-[#05100c]',
    ghost:
      'border border-white/20 bg-white/[0.04] text-[#e9f3ee] hover:border-white/40 hover:bg-white/[0.08] focus-visible:ring-white/50 focus-visible:ring-offset-[#05100c]',
    paper:
      'bg-[#12664F] text-white hover:bg-[#0e513f] focus-visible:ring-[#12664F] focus-visible:ring-offset-[#f6f3ea]',
  } as const;

  return (
    <Link href={href} className={cn(base, styles[variant], className)}>
      {children}
    </Link>
  );
}
