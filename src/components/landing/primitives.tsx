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
        'flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.28em]',
        tone === 'dark' ? 'text-[#2dc2bd]' : 'text-[#12664F]',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('inline-block h-1 w-1 rounded-full', tone === 'dark' ? 'bg-[#2dc2bd]' : 'bg-[#12664F]')}
      />
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
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        tone === 'dark' ? 'text-[#e9f3ee]' : 'text-[#0d1f18]',
        className,
      )}
    >
      <Eyebrow tone={tone} className={cn(align === 'center' && 'justify-center')}>
        {eyebrow}
      </Eyebrow>
      <h2 className="mt-4 font-semibold tracking-[-0.03em] text-[clamp(1.8rem,4vw,3rem)] leading-[1.08]">{title}</h2>
      {lead ? (
        <p
          className={cn(
            'mt-4 text-[15px] leading-relaxed sm:text-base',
            tone === 'dark' ? 'text-[#9db3a8]' : 'text-[#5c6f66]',
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

const TONE_DOT: Record<string, string> = {
  paid: 'bg-[#3ecf7c]',
  partial: 'bg-[#e0a93c]',
  pending: 'bg-[#6f9cd8]',
  overdue: 'bg-[#dc6a5d]',
  vacant: 'bg-[#7d8f88]',
  occupied: 'bg-[#3ecf7c]',
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
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium',
        onDark ? 'bg-white/10 text-[#e9f3ee]' : 'bg-[#0d1f18]/5 text-[#0d1f18]',
        className,
      )}
    >
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', TONE_DOT[tone] ?? TONE_DOT.vacant)} />
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
    'group inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const styles = {
    solid:
      'bg-[#7ff0c2] text-[#05100c] hover:bg-[#a6f7d6] focus-visible:ring-[#7ff0c2] focus-visible:ring-offset-[#05100c]',
    ghost:
      'border border-white/18 bg-white/[0.03] text-[#e9f3ee] hover:border-white/35 hover:bg-white/[0.07] focus-visible:ring-white/40 focus-visible:ring-offset-[#05100c]',
    paper:
      'bg-[#12664F] text-white hover:bg-[#0e513f] focus-visible:ring-[#12664F] focus-visible:ring-offset-[#f6f3ea]',
  } as const;

  return (
    <Link href={href} className={cn(base, styles[variant], className)}>
      {children}
    </Link>
  );
}
