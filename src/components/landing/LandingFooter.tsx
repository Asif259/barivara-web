'use client';

import Link from 'next/link';
import { ArrowUpRight, MessageCircle } from './icons';
import { useLandingCopy } from './use-landing-copy';

export default function LandingFooter() {
  const { t } = useLandingCopy();
  const year = new Date().getFullYear();

  const product = [
    { label: t.footer.links.features, href: '#features' },
    { label: t.footer.links.comparison, href: '#comparison' },
    { label: t.footer.links.pricing, href: '#pricing' },
    { label: t.footer.links.howItWorks, href: '#how-it-works' },
    { label: t.footer.links.faq, href: '#faq' },
    { label: t.footer.links.trust, href: '#trust' },
    { label: t.footer.links.roadmap, href: '#roadmap' },
  ];
  const account = [
    { label: t.footer.links.login, href: '/login' },
    { label: t.footer.links.register, href: '/register' },
    { label: t.footer.links.forgot, href: '/forgot-password' },
  ];

  const backToTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  const whatsappHref = `https://wa.me/${t.faq.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    t.faq.whatsappMessage,
  )}`;

  return (
    <footer className="border-t border-white/10 bg-[#04100c] pb-10 pt-16 text-[#e9f3ee]">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.75fr_0.75fr] lg:gap-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo_t.png" alt="" className="h-8 w-8 rounded-md object-contain" />
              <span className="flex flex-col leading-none">
                <span className="text-[15px] font-semibold tracking-tight">{t.common.appName}</span>
                <span className="mt-0.5 text-[9px] uppercase tracking-[0.22em] text-[#7f978c]">BariVara</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-[12px] leading-relaxed text-[#9db3a8]">{t.footer.tagline}</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-1.5 text-[12px] font-medium text-[#25D366] transition-colors hover:bg-[#25D366]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {t.footer.whatsappSupport}
            </a>
          </div>

          <nav aria-label={t.footer.productLabel}>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#829c90]">{t.footer.productLabel}</p>
            <ul className="mt-4 space-y-2.5">
              {product.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-[12px] text-[#c7d8d0] transition-colors hover:text-white focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ff0c2]">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.accountLabel}>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#829c90]">{t.footer.accountLabel}</p>
            <ul className="mt-4 space-y-2.5">
              {account.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[12px] text-[#c7d8d0] transition-colors hover:text-white focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ff0c2]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl space-y-1.5">
            <p className="text-[10px] leading-relaxed text-[#829c90]">{t.footer.sampleDisclosure}</p>
            <p className="text-[10px] text-[#829c90]">
              © {year} {t.common.appName} · {t.footer.rights}
            </p>
          </div>
          <button
            type="button"
            onClick={backToTop}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#9db3a8] transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ff0c2]"
          >
            {t.common.backToTop}
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
