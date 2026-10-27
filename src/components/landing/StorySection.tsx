'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLandingCopy } from './use-landing-copy';
import { Eyebrow } from './primitives';
import { StoryVisual } from './StoryVisuals';

export default function StorySection() {
  const { t } = useLandingCopy();
  const chapters = t.story.chapters;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPinned(mq.matches && !reduce.matches);
    update();
    mq.addEventListener('change', update);
    reduce.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      reduce.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!pinned) return;
    let frame = 0;
    let cachedTravel = 0;

    const updateTravel = () => {
      const node = sectionRef.current;
      if (!node) return;
      cachedTravel = node.offsetHeight - window.innerHeight;
    };

    const measure = () => {
      frame = 0;
      const node = sectionRef.current;
      if (!node) return;
      if (cachedTravel <= 0) updateTravel();
      if (cachedTravel <= 0) return;
      const rect = node.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / cachedTravel));
      const next = Math.min(chapters.length - 1, Math.floor(progress * chapters.length));
      setActive((current) => (current === next ? current : next));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    const onResize = () => {
      updateTravel();
      onScroll();
    };

    updateTravel();
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pinned, chapters.length]);

  const goTo = useCallback(
    (index: number) => {
      const node = sectionRef.current;
      if (!node) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!pinned) {
        document.getElementById(`story-${chapters[index].id}`)?.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'start',
        });
        return;
      }
      const travel = node.offsetHeight - window.innerHeight;
      const top = node.offsetTop + (travel * (index + 0.35)) / chapters.length;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    },
    [chapters, pinned],
  );

  const current = pinned ? active : 0;

  return (
    <section
      id="story"
      ref={sectionRef}
      className={cn('bv-ink-section relative', pinned ? 'lg:h-[720vh]' : 'h-auto py-20')}
    >
      <div className={cn(pinned ? 'lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center' : 'relative')}>
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:py-0">
          <div className="flex items-end justify-between gap-6">
            <Eyebrow tone="dark">{t.story.eyebrow}</Eyebrow>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#829c90]">
              <span className="text-[#7ff0c2]">{String(current + 1).padStart(2, '0')}</span>
              <span className="mx-1">/</span>
              {String(chapters.length).padStart(2, '0')}
            </p>
          </div>

          {pinned ? (
            <>
              <div className="mt-10 hidden lg:grid lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14">
                <div className="relative min-h-[300px]">
                  {chapters.map((chapter, index) => (
                    <article
                      key={chapter.id}
                      aria-hidden={index !== active}
                      className={cn(
                        'absolute inset-0 flex flex-col justify-center transition-all duration-500 ease-out',
                        index === active
                          ? 'pointer-events-auto translate-y-0 opacity-100 blur-0'
                          : 'pointer-events-none translate-y-4 opacity-0 blur-[2px]',
                      )}
                    >
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[#7ff0c2]">
                        {t.story.chapterLabel} {String(index + 1).padStart(2, '0')} · {chapter.kicker}
                      </p>
                      <h2 className="mt-4 max-w-[15ch] text-[clamp(2rem,3.2vw,3.1rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-[#f2faf6]">
                        {chapter.title}
                      </h2>
                      <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#9db3a8]">{chapter.body}</p>
                      <div className="mt-6 h-px w-24 bg-gradient-to-r from-[#7ff0c2] to-transparent" />
                    </article>
                  ))}
                </div>

                <div className="relative h-[430px]">
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      aria-hidden={index !== active}
                      className={cn(
                        'absolute inset-0 flex items-center transition-all duration-500 ease-out',
                        index === active
                          ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
                          : 'pointer-events-none translate-y-6 scale-[0.98] opacity-0',
                      )}
                    >
                      <StoryVisual id={chapter.id} t={t} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 hidden items-center gap-2 lg:flex" role="group" aria-label={t.story.progressLabel}>
                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    type="button"
                    aria-current={index === active ? 'step' : undefined}
                    aria-label={`${t.story.goToChapter}: ${chapter.kicker}`}
                    onClick={() => goTo(index)}
                    className="group flex flex-1 flex-col gap-2 text-left focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ff0c2]"
                  >
                    <span
                      className={cn(
                        'h-0.5 w-full rounded-full transition-all duration-300',
                        index === active
                          ? 'bg-[#7ff0c2] shadow-[0_0_8px_rgba(127,240,194,0.6)]'
                          : index < active
                            ? 'bg-[#7ff0c2]/60'
                            : 'bg-white/12 group-hover:bg-white/25',
                      )}
                    />
                    <span
                      className={cn(
                        'truncate text-[10px] uppercase tracking-[0.16em] transition-colors',
                        index === active ? 'text-[#e9f3ee]' : 'text-[#829c90] group-hover:text-[#9db3a8]',
                      )}
                    >
                      {chapter.kicker}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {/* Accessible sequential list rendered on mobile or when prefers-reduced-motion disables pinning */}
          <div className={cn('mt-10 space-y-16', pinned ? 'lg:hidden' : 'block max-w-4xl mx-auto')}>
            {chapters.map((chapter, index) => (
              <article key={chapter.id} id={`story-${chapter.id}`} className="scroll-mt-24">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#7ff0c2]">
                  {t.story.chapterLabel} {String(index + 1).padStart(2, '0')} · {chapter.kicker}
                </p>
                <h2 className="mt-3 text-[clamp(1.7rem,6vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-[#f2faf6]">
                  {chapter.title}
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-[#9db3a8]">{chapter.body}</p>
                <div className="mt-6">
                  <StoryVisual id={chapter.id} t={t} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
