'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const Model = dynamic(() => import('./BuildingModel'), { ssr: false, loading: () => null });

const POSTER_ROWS = [
  ['paid', 'partial', 'paid', 'vacant'],
  ['paid', 'paid', 'pending', 'paid'],
  ['paid', 'vacant', 'paid', 'overdue'],
  ['pending', 'paid', 'partial', 'paid'],
  ['paid', 'paid', 'paid', 'vacant'],
  ['paid', 'paid', 'paid', 'paid'],
];

const toneClasses: Record<string, string> = {
  paid: 'bg-[#5ef29a] shadow-[0_0_18px_rgba(94,242,154,0.55)]',
  partial: 'bg-[#f0c05a] shadow-[0_0_18px_rgba(240,192,90,0.45)]',
  pending: 'bg-[#9ec9ff] shadow-[0_0_18px_rgba(158,201,255,0.4)]',
  overdue: 'bg-[#ff8d7d] shadow-[0_0_18px_rgba(255,141,125,0.45)]',
  vacant: 'bg-[#20332c]',
};

export function BuildingPoster({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(55%_50%_at_72%_40%,rgba(45,194,189,0.22),transparent_70%)]" />
      <div className="absolute bottom-[11%] left-1/2 h-[74%] w-[min(42vw,300px)] -translate-x-1/2 sm:left-[62%]">
        {/* roof line + water tank */}
        <div className="absolute -top-3 inset-x-0 h-1.5 rounded-sm bg-[#1b5142]" />
        <div className="absolute -top-8 right-[18%] h-6 w-8 rounded-sm border border-white/10 bg-[#123b30]" />
        {/* mass */}
        <div className="relative h-full overflow-hidden rounded-[2px] border border-white/12 bg-[linear-gradient(100deg,#0a231c_0%,#0e2f27_45%,#071812_100%)] shadow-[0_40px_120px_-30px_rgba(45,194,189,0.4)]">
          {/* floor slabs */}
          {[0, 1, 2, 3, 4, 5].map((floor) => (
            <div
              key={floor}
              className="absolute inset-x-0 h-[2px] bg-white/[0.06]"
              style={{ top: `${8 + floor * 15.2}%` }}
            />
          ))}
          {/* windows */}
          <div className="flex h-full flex-col justify-between px-[9%] py-[7%]">
            {POSTER_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-4 gap-[9%]">
                {row.map((tone, cellIndex) => (
                  <span
                    key={`${rowIndex}-${cellIndex}`}
                    className={cn(
                      'block aspect-[4/5] rounded-[1px] border border-black/40',
                      toneClasses[tone] ?? toneClasses.vacant,
                    )}
                    style={{ opacity: tone === 'vacant' ? 1 : 0.72 }}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* shopfront strip */}
          <div className="absolute inset-x-[9%] bottom-[2.5%] h-[6%] rounded-[1px] border border-black/40 bg-[#e8c468]/60" />
          {/* side shading */}
          <div className="absolute inset-y-0 right-0 w-[16%] bg-gradient-to-l from-black/45 to-transparent" />
        </div>
        <div className="absolute -inset-x-8 -bottom-7 h-8 rounded-[50%] bg-black/60 blur-2xl" />
      </div>
    </div>
  );
}

export default function BuildingScene({
  progress,
  className,
}: {
  progress?: { current: number };
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const fallbackProgress = useRef(0);
  const [capable, setCapable] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let webgl = false;
      try {
        const probe = document.createElement('canvas');
        webgl = Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
      } catch {
        webgl = false;
      }
      const lowEnd =
        window.innerWidth < 380 ||
        (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2);
      setCapable(webgl && !reduced && !lowEnd);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const node = hostRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '160px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className={cn('relative h-full w-full', className)} aria-hidden="true">
      <BuildingPoster className={capable && active ? 'opacity-40' : 'opacity-100'} />
      {capable && active ? <Model progress={progress ?? fallbackProgress} /> : null}
    </div>
  );
}
