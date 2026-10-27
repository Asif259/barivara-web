'use client';

import {
  Component,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLanguage } from '@/stores/language-store';
import type { Copy, Pointer } from './HeroScene';

const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => null,
});

/* -------------------------------------------------------------------------- */
/*  Copy                                                                       */
/* -------------------------------------------------------------------------- */

type Lang = 'bn' | 'en';
type Tone = 'paid' | 'partial' | 'pending' | 'overdue' | 'vacant';

const COPY: Record<Lang, Copy> = {
  bn: {
    title: ['কাগজের খাতা থেকে', 'পরিষ্কার ডিজিটাল খতিয়ানে'],
    lead: 'একাধিক বাড়ি, ইউনিট আর ভাড়াটিয়া—সব এক জায়গায়। চুক্তি, মাসিক ভাড়া, পেমেন্ট আর রসিদ, বাংলায়, আপনার নিজের হাতে।',
    primary: 'শুরু করুন',
    secondary: 'লগ ইন',
    support: ['বাংলা-প্রথম', 'বাংলা / English', 'প্রিন্ট-রেডি A4 রসিদ'],
    legend: { paid: 'পরিশোধিত', partial: 'আংশিক', pending: 'বাকি', overdue: 'মেয়াদোত্তীর্ণ', vacant: 'খালি' },
    sample: 'নমুনা তথ্য দিয়ে দেখানো হয়েছে',
    pinPaid: { name: 'ফ্ল্যাট ৪বি', status: 'পরিশোধিত', amount: '৳১৩,৩০০' },
    pinOverdue: { name: 'ফ্ল্যাট ২এ', status: 'মেয়াদোত্তীর্ণ', amount: '৳১২,০০০' },
  },
  en: {
    title: ['From the paper khata', 'to a clear digital ledger'],
    lead: 'Properties, units and tenants in one place. Agreements, monthly rent, payments and receipts, in Bangla, in your own hands.',
    primary: 'Get started',
    secondary: 'Log in',
    support: ['Bangla-first', 'Bangla / English', 'Print-ready A4 receipts'],
    legend: { paid: 'Paid', partial: 'Partial', pending: 'Pending', overdue: 'Overdue', vacant: 'Vacant' },
    sample: 'Shown with sample data',
    pinPaid: { name: 'Flat 4B', status: 'Paid', amount: '৳13,300' },
    pinOverdue: { name: 'Flat 2A', status: 'Overdue', amount: '৳12,000' },
  },
};

/* -------------------------------------------------------------------------- */
/*  Palette + styles                                                           */
/* -------------------------------------------------------------------------- */

const TONE_HEX: Record<Tone, string> = {
  paid: '#5ef2b4',
  partial: '#f0c05a',
  pending: '#8fb4e8',
  overdue: '#ff7f6e',
  vacant: '#17352c',
};

const LEGEND_HEX: Record<Tone, string> = { ...TONE_HEX, vacant: '#56756a' };

const FONT_BODY = "'Noto Sans Bengali','Inter',system-ui,-apple-system,'Segoe UI',sans-serif";
const FONT_DISPLAY = "var(--font-serif-bengali), Georgia, 'Times New Roman', serif";

const CSS = `
.hx-in{animation:hx-rise .85s cubic-bezier(.22,1,.36,1) backwards;animation-delay:var(--d,0s)}
@keyframes hx-rise{from{opacity:0;transform:translate3d(0,18px,0)}}

.hx-underline{
  background-image:linear-gradient(#e8c468,#e8c468);
  background-repeat:no-repeat;background-position:0 100%;background-size:100% 3px;
  padding-bottom:.1em;
  -webkit-box-decoration-break:clone;box-decoration-break:clone;
  animation:hx-draw 1.1s cubic-bezier(.6,0,.2,1) backwards;animation-delay:var(--d,0s);
}
@keyframes hx-draw{from{background-size:0% 3px}}

.hx-dot{animation:hx-ping 2.4s ease-out infinite;animation-delay:var(--d,0s)}
@keyframes hx-ping{0%{box-shadow:0 0 0 0 rgba(243,236,217,.55)}100%{box-shadow:0 0 0 12px rgba(243,236,217,0)}}

.hx-line{transform-origin:left center;animation:hx-grow .5s cubic-bezier(.22,1,.36,1) backwards;animation-delay:calc(var(--d,0s) + .15s)}
@keyframes hx-grow{from{transform:scaleX(0)}}
`;

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');
const delay = (seconds: number) => ({ '--d': `${seconds}s` } as CSSProperties);

/* -------------------------------------------------------------------------- */
/*  Fallbacks: static poster + error boundary                                  */
/* -------------------------------------------------------------------------- */

function Poster({ className }: { className?: string }) {
  const pattern: Tone[][] = [
    ['paid', 'partial', 'paid', 'vacant'],
    ['paid', 'paid', 'pending', 'paid'],
    ['paid', 'vacant', 'paid', 'overdue'],
    ['pending', 'paid', 'partial', 'paid'],
    ['paid', 'paid', 'paid', 'vacant'],
  ];
  return (
    <div
      aria-hidden="true"
      className={cx(
        'pointer-events-none absolute inset-0 flex items-end justify-center lg:justify-end lg:pr-[9%]',
        className,
      )}
    >
      <svg viewBox="0 0 420 520" className="h-[92%] w-auto" role="presentation">
        <ellipse cx="210" cy="450" rx="205" ry="64" fill="#e8dfc6" opacity="0.9" />
        <ellipse cx="210" cy="450" rx="150" ry="44" fill="none" stroke="#12664f" strokeOpacity="0.25" />
        <ellipse cx="210" cy="450" rx="100" ry="28" fill="none" stroke="#12664f" strokeOpacity="0.25" />
        <rect x="104" y="96" width="196" height="12" fill="#e9e0c8" />
        <rect x="132" y="70" width="34" height="28" rx="4" fill="#9fb8ae" />
        <rect x="104" y="108" width="196" height="324" fill="#17584a" />
        <polygon points="300,108 352,128 352,414 300,432" fill="#0f4034" />
        {pattern.map((row, r) =>
          row.map((tone, c) => (
            <rect
              key={`${r}-${c}`}
              x={118 + c * 46}
              y={128 + r * 56}
              width="30"
              height="36"
              rx="1"
              fill={TONE_HEX[tone]}
              opacity={tone === 'vacant' ? 1 : 0.85}
            />
          )),
        )}
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <rect key={k} x="98" y={106 + k * 56} width="208" height="4" fill="#e9e0c8" opacity="0.9" />
        ))}
        <rect x="118" y="404" width="168" height="20" fill="#f2cf7a" />
        <rect x="108" y="398" width="188" height="6" fill="#e0b24f" />
      </svg>
    </div>
  );
}

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */

export default function Hero() {
  const language = useLanguage();
  const lang: Lang = language === 'en' ? 'en' : 'bn';
  const t = COPY[lang];
  const bn = lang === 'bn';

  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  const [mode, setMode] = useState<'loading' | '3d' | 'static'>('loading');
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [desktop, setDesktop] = useState(false);

  // Capability check & idle deferred initialization for 3D
  useEffect(() => {
    let cancel = false;
    const frame = window.requestAnimationFrame(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let webgl = false;
      try {
        const probe = document.createElement('canvas');
        webgl = Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
      } catch {
        webgl = false;
      }
      const weak =
        window.innerWidth < 360 ||
        (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2);

      if (cancel) return;

      if (!webgl || reduced || weak) {
        setMode('static');
        return;
      }

      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
          () => {
            if (!cancel) setMode('3d');
          },
          { timeout: 2500 }
        );
      } else {
        setTimeout(() => {
          if (!cancel) setMode('3d');
        }, 1000);
      }
    });

    return () => {
      cancel = true;
      window.cancelAnimationFrame(frame);
    };
  }, []);

  // Desktop breakpoint (callouts are desktop only)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Pause rendering when the hero is off-screen
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '120px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Scroll progress + pointer parallax (with cached rect to prevent forced reflow)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    let frame = 0;
    let cachedRect: DOMRect | null = null;

    const update = () => {
      frame = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight)));
      progress.current = p;
      if (!reduced) el.style.setProperty('--p', p.toFixed(3));
    };
    const onScroll = () => {
      cachedRect = null;
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onResize = () => {
      cachedRect = null;
    };
    const onMove = (event: PointerEvent) => {
      if (!cachedRect) {
        cachedRect = el.getBoundingClientRect();
      }
      pointer.current = {
        x: (event.clientX - cachedRect.left) / (cachedRect.width || 1) - 0.5,
        y: (event.clientY - cachedRect.top) / (cachedRect.height || 1) - 0.5,
      };
    };
    const onLeave = () => {
      cachedRect = null;
      pointer.current = { x: 0, y: 0 };
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    if (!reduced && finePointer) {
      el.addEventListener('pointermove', onMove, { passive: true });
      el.addEventListener('pointerleave', onLeave);
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const show3d = mode === '3d';

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#06110d] text-[#f3ecd9]"
      style={{ fontFamily: FONT_BODY }}
    >
      <style>{CSS}</style>

      {/* Atmosphere: one soft emerald pool behind the building */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_55%_at_70%_52%,rgba(18,102,79,0.5),transparent_72%)]"
      />

      {/* Scene: top band on mobile, full bleed on desktop */}
      <div className="absolute inset-x-0 top-0 h-[56svh] lg:inset-0 lg:h-auto" aria-hidden="true">
        <Poster className={cx('transition-opacity duration-700', show3d && ready ? 'opacity-0' : 'opacity-100')} />
        {show3d ? (
          <SceneBoundary onError={() => setMode('static')}>
            <HeroScene
              progress={progress}
              pointer={pointer}
              desktop={desktop}
              active={active}
              copy={t}
              onReady={() => setReady(true)}
            />
          </SceneBoundary>
        ) : null}
      </div>

      {/* Readability veil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[30svh] bg-[linear-gradient(180deg,transparent_0%,rgba(6,17,13,0.92)_24%,#06110d_42%)] lg:inset-0 lg:bg-[linear-gradient(90deg,#06110d_0%,#06110d_28%,rgba(6,17,13,0.72)_44%,rgba(6,17,13,0.05)_66%,transparent_100%)]"
      />

      {/* Copy */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center px-5 pb-24 pt-[46svh] sm:px-8 lg:pb-16 lg:pt-24">
        <div
          className="max-w-xl lg:max-w-[40rem]"
          style={{
            opacity: 'calc(1 - var(--p, 0) * 1.2)',
            transform: 'translate3d(0, calc(var(--p, 0) * -36px), 0)',
          }}
        >
          <h1
            className={cx(
              'text-balance',
              bn ? 'leading-[1.3] tracking-normal' : 'leading-[1.08] tracking-[-0.02em]',
            )}
            style={{ fontFamily: FONT_DISPLAY }}
          >
            <span
              className="hx-in block text-[clamp(2.1rem,4.3vw,3.4rem)] font-bold text-[#f3ecd9]"
              style={delay(0.05)}
            >
              {t.title[0]}
            </span>
            <span
              className="hx-in mt-1 block text-[clamp(2.1rem,4.3vw,3.4rem)] font-medium text-[#8fe9c4]"
              style={delay(0.2)}
            >
              <span className="hx-underline" style={delay(1.0)}>
                {t.title[1]}
              </span>
            </span>
          </h1>

          <p
            className={cx(
              'hx-in mt-7 max-w-[34rem] text-[15px] text-[#b9cdc4] sm:text-base',
              bn ? 'leading-8' : 'leading-relaxed',
            )}
            style={delay(0.4)}
          >
            {t.lead}
          </p>

          <div className="hx-in mt-9 flex flex-wrap items-center gap-3" style={delay(0.55)}>
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#7ff0c2] px-7 text-[15px] font-semibold text-[#06110d] shadow-[0_12px_40px_-12px_rgba(127,240,194,0.6)] transition-colors hover:bg-[#a6f7d6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ff0c2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06110d]"
            >
              {t.primary}
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#f3ecd9]/25 px-7 text-[15px] font-medium text-[#f3ecd9] transition-colors hover:border-[#f3ecd9]/55 hover:bg-[#f3ecd9]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3ecd9]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06110d]"
            >
              {t.secondary}
            </Link>
          </div>

          <ul className="hx-in mt-9 flex flex-wrap items-center gap-y-2 text-[13px] text-[#9db3a8]" style={delay(0.7)}>
            {t.support.map((item, i) => (
              <li key={item} className={cx(i > 0 && 'ml-4 border-l border-[#f3ecd9]/15 pl-4')}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Key for the window colours + sample-data note */}
      <div className="absolute inset-x-5 bottom-5 z-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 text-xs text-[#8fa89c] sm:inset-x-8">
        <p>{t.sample}</p>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {(Object.keys(LEGEND_HEX) as Tone[]).map((tone) => (
            <li key={tone} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-2 rounded-[2px]" style={{ background: LEGEND_HEX[tone] }} />
              {t.legend[tone]}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
