'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { PRODUCT_MODULES } from '@/components/landing/landing-data';
import { ProductModuleItem, SupportedLocale } from '@/components/landing/landing-types';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingShowcase } from '@/components/landing/LandingShowcase';
import { LandingStats } from '@/components/landing/LandingStats';
import { LandingProcess } from '@/components/landing/LandingProcess';
import { LandingDivider } from '@/components/landing/LandingDivider';
import { LandingTestimonials } from '@/components/landing/LandingTestimonials';
import { LandingBlog } from '@/components/landing/LandingBlog';
import { LandingCta } from '@/components/landing/LandingCta';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ModuleQuickViewModal } from '@/components/landing/ModuleQuickViewModal';
import { ConsultationModal } from '@/components/landing/ConsultationModal';
import { toast } from 'sonner';

export const LandingPage: React.FC = () => {
  const [locale, setLocale] = useState<SupportedLocale>('bn');

  // Filter states
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedScale, setSelectedScale] = useState<string>('all');

  // Shortlist state
  const [savedModuleIds, setSavedModuleIds] = useState<Set<string>>(new Set());

  // Modal states
  const [quickViewModule, setQuickViewModule] = useState<ProductModuleItem | null>(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  // Floating toast state matching index.html
  const [floatingToast, setFloatingToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const showToastNotification = useCallback((msg: string) => {
    setFloatingToast({ message: msg, visible: true });
    setTimeout(() => {
      setFloatingToast((prev) => ({ ...prev, visible: false }));
    }, 3200);

    toast(msg, {
      style: {
        background: '#16171a',
        color: '#ffffff',
        border: '1px solid #10b981',
      },
    });
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'en' ? 'bn' : 'en'));
  }, []);

  const handleToggleSave = useCallback(
    (module: ProductModuleItem) => {
      setSavedModuleIds((prev) => {
        const next = new Set(prev);
        if (next.has(module.id)) {
          next.delete(module.id);
          showToastNotification(
            locale === 'bn'
              ? `"${module.titleBn}" বুকমার্ক থেকে সরানো হয়েছে`
              : `Removed "${module.title}" from saved features`
          );
        } else {
          next.add(module.id);
          showToastNotification(
            locale === 'bn'
              ? `"${module.titleBn}" বুকমার্কে সংরক্ষিত হয়েছে`
              : `Saved "${module.title}" to favorites`
          );
        }
        return next;
      });
    },
    [locale, showToastNotification]
  );

  const handleResetFilters = useCallback(() => {
    setSelectedType('all');
    setSelectedModule('all');
    setSelectedScale('all');
    showToastNotification(
      locale === 'bn' ? 'সকল ফিল্টার রিসেট করা হয়েছে' : 'Filters reset to default'
    );
  }, [locale, showToastNotification]);

  const handleSearchClick = useCallback(() => {
    const el = document.getElementById('properties');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    showToastNotification(
      locale === 'bn' ? 'মডিউল তালিকা আপডেট হয়েছে' : 'Management modules filtered'
    );
  }, [locale, showToastNotification]);

  const handleInquirySubmit = useCallback(
    (data: { name: string; phone: string; units: string; location: string }) => {
      showToastNotification(
        locale === 'bn'
          ? `ধন্যবাদ ${data.name}! আপনার ডেমো অনুরোধ গৃহীত হয়েছে।`
          : `Thank you, ${data.name}! Our landlord onboarding team will call you.`
      );
    },
    [locale, showToastNotification]
  );

  // Filtered modules
  const filteredModules = useMemo(() => {
    return PRODUCT_MODULES.filter((item) => {
      if (selectedModule !== 'all' && item.category !== selectedModule) {
        return false;
      }
      return true;
    });
  }, [selectedModule]);

  return (
    <div className="page-frame  min-h-screen text-white font-sans antialiased">
        {/* Navigation */}
        <LandingNav
          locale={locale}
          onToggleLocale={toggleLocale}
          savedCount={savedModuleIds.size}
          onOpenSavedToast={() => {
            const count = savedModuleIds.size;
            showToastNotification(
              locale === 'bn'
                ? `আপনার কাছে ${count}টি সংরক্ষিত ফিচার রয়েছে`
                : `You have ${count} saved feature(s)`
            );
          }}
          onOpenConsultation={() => setIsConsultationOpen(true)}
        />

        {/* Hero */}
        <LandingHero
          locale={locale}
          selectedType={selectedType}
          selectedModule={selectedModule}
          selectedScale={selectedScale}
          onTypeChange={setSelectedType}
          onModuleChange={setSelectedModule}
          onScaleChange={setSelectedScale}
          onResetFilters={handleResetFilters}
          onSearch={handleSearchClick}
        />

        {/* Core Product Capabilities Bento Grid */}
        <LandingShowcase
          locale={locale}
          modules={filteredModules.length > 0 ? filteredModules : PRODUCT_MODULES}
          onSelectModule={(mod) => setQuickViewModule(mod)}
        />

        {/* 4 Overlapping Circular Stats Badges */}
        <LandingStats locale={locale} />

        {/* 4-Step Vertical Timeline */}
        <LandingProcess locale={locale} />

        {/* Central Geometric Neon Lime Divider */}
        <LandingDivider locale={locale} />

        {/* Authentic Bangladeshi Landlord Testimonials */}
        <LandingTestimonials locale={locale} />

        {/* Tenancy & Landlord Knowledge Hub */}
        <LandingBlog
          locale={locale}
          onSelectArticle={(article) => {
            showToastNotification(
              locale === 'bn'
                ? `সহায়িকা: ${article.titleBn}`
                : `Opening guide: ${article.titleEn}`
            );
          }}
        />

        {/* Architectural CTA Banner */}
        <LandingCta
          locale={locale}
          onOpenConsultation={() => setIsConsultationOpen(true)}
        />

        {/* Footer */}
        <LandingFooter
          locale={locale}
          onShowToast={showToastNotification}
        />

      {/* Module Quick-View Modal */}
      <ModuleQuickViewModal
        module={quickViewModule}
        isOpen={Boolean(quickViewModule)}
        onClose={() => setQuickViewModule(null)}
        onSave={handleToggleSave}
        isSaved={quickViewModule ? savedModuleIds.has(quickViewModule.id) : false}
        locale={locale}
      />

      {/* Landlord Consultation / Onboarding Modal */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        onSubmitInquiry={handleInquirySubmit}
        locale={locale}
      />

      {/* Floating Dark-Emerald Toast Notification */}
      <div
        id="toast"
        className={`fixed bottom-5 right-5 z-50 bg-[#16171a] border border-[#10b981] text-white text-xs px-4 py-3 rounded shadow-2xl flex items-center gap-2.5 transition-[opacity,transform] duration-300 motion-reduce:transition-none ${
          floatingToast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#10b981]" />
        <span>{floatingToast.message}</span>
      </div>
    </div>
  );
};
export default LandingPage;
