'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { PROPERTIES } from './landing-data';
import { PropertyItem, SupportedLocale } from './landing-types';
import { LandingNav } from './LandingNav';
import { LandingHero } from './LandingHero';
import { LandingShowcase } from './LandingShowcase';
import { LandingStats } from './LandingStats';
import { LandingProcess } from './LandingProcess';
import { LandingDivider } from './LandingDivider';
import { LandingTestimonials } from './LandingTestimonials';
import { LandingBlog } from './LandingBlog';
import { LandingCta } from './LandingCta';
import { LandingFooter } from './LandingFooter';
import { PropertyQuickViewModal } from './PropertyQuickViewModal';
import { ConsultationModal } from './ConsultationModal';
import { toast } from 'sonner';

export const LandingPage: React.FC = () => {
  const [locale, setLocale] = useState<SupportedLocale>('en');

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedBudget, setSelectedBudget] = useState<string>('all');

  // Shortlist state
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());

  // Modal states
  const [quickViewProperty, setQuickViewProperty] = useState<PropertyItem | null>(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [consultationProperty, setConsultationProperty] = useState<PropertyItem | null>(null);

  // Floating toast state matching index.html
  const [floatingToast, setFloatingToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const showToastNotification = useCallback((msg: string) => {
    // Show both inline dark-neon toast and Sonner
    setFloatingToast({ message: msg, visible: true });
    setTimeout(() => {
      setFloatingToast((prev) => ({ ...prev, visible: false }));
    }, 3200);

    toast(msg, {
      style: {
        background: '#16171a',
        color: '#ffffff',
        border: '1px solid #d9ff43',
      },
    });
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'en' ? 'bn' : 'en'));
  }, []);

  const handleToggleSave = useCallback(
    (property: PropertyItem) => {
      setSavedPropertyIds((prev) => {
        const next = new Set(prev);
        if (next.has(property.id)) {
          next.delete(property.id);
          showToastNotification(
            locale === 'bn'
              ? `"${property.titleBn}" শর্টলিস্ট থেকে সরানো হয়েছে`
              : `Removed "${property.title}" from shortlist`
          );
        } else {
          next.add(property.id);
          showToastNotification(
            locale === 'bn'
              ? `"${property.titleBn}" শর্টলিস্টে যুক্ত হয়েছে`
              : `Saved "${property.title}" to shortlist`
          );
        }
        return next;
      });
    },
    [locale, showToastNotification]
  );

  const handleResetFilters = useCallback(() => {
    setSelectedLocation('all');
    setSelectedType('all');
    setSelectedBudget('all');
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
      locale === 'bn' ? 'প্রপার্টি তালিকা আপডেট করা হয়েছে' : 'Property listings updated'
    );
  }, [locale, showToastNotification]);

  const handleInquirySubmit = useCallback(
    (data: { name: string; phone: string; email: string; location: string }) => {
      showToastNotification(
        locale === 'bn'
          ? `ধন্যবাদ ${data.name}! আপনার অনুরোধ সফলভাবে গৃহীত হয়েছে।`
          : `Thank you, ${data.name}! We will contact you shortly.`
      );
    },
    [locale, showToastNotification]
  );

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return PROPERTIES.filter((item) => {
      if (selectedLocation !== 'all' && item.area !== selectedLocation) {
        return false;
      }
      if (selectedType !== 'all' && item.propertyType !== selectedType) {
        return false;
      }
      if (selectedBudget === 'under100k' && item.priceMonthlyBdt >= 100000) {
        return false;
      }
      if (selectedBudget === 'over100k' && item.priceMonthlyBdt < 100000) {
        return false;
      }
      return true;
    });
  }, [selectedLocation, selectedType, selectedBudget]);

  return (
    <div className="min-h-screen text-white font-sans page-frame">
      {/* Outer Neon Lime Frame Container */}
        {/* Navigation */}
        <LandingNav
          locale={locale}
          onToggleLocale={toggleLocale}
          savedCount={savedPropertyIds.size}
          onOpenSavedToast={() => {
            const count = savedPropertyIds.size;
            showToastNotification(
              locale === 'bn'
                ? `আপনার কাছে ${count}টি সংরক্ষিত প্রপার্টি রয়েছে`
                : `You have ${count} saved property in your shortlist`
            );
          }}
          onOpenConsultation={() => {
            setConsultationProperty(null);
            setIsConsultationOpen(true);
          }}
        />

        {/* Hero */}
        <LandingHero
          locale={locale}
          selectedLocation={selectedLocation}
          selectedType={selectedType}
          selectedBudget={selectedBudget}
          onLocationChange={setSelectedLocation}
          onTypeChange={setSelectedType}
          onBudgetChange={setSelectedBudget}
          onResetFilters={handleResetFilters}
          onSearch={handleSearchClick}
        />

        {/* Featured Showcase (12-column asymmetric bento grid) */}
        <LandingShowcase
          locale={locale}
          properties={filteredProperties}
          onSelectProperty={(prop) => setQuickViewProperty(prop)}
        />

        {/* 4 Overlapping Circular Stats Badges */}
        <LandingStats locale={locale} />

        {/* 4-Step Vertical Timeline */}
        <LandingProcess locale={locale} />

        {/* Central Geometric Neon Lime Divider */}
        <LandingDivider locale={locale} />

        {/* Testimonials Slider */}
        <LandingTestimonials locale={locale} />

        {/* Editorial Journal / Blog */}
        <LandingBlog
          locale={locale}
          onSelectArticle={(article) => {
            showToastNotification(
              locale === 'bn'
                ? `আর্টিকেল: ${article.titleBn}`
                : `Opening guide: ${article.titleEn}`
            );
          }}
        />

        {/* Architectural CTA Banner */}
        <LandingCta
          locale={locale}
          onOpenConsultation={() => {
            setConsultationProperty(null);
            setIsConsultationOpen(true);
          }}
        />

        {/* Footer */}
        <LandingFooter
          locale={locale}
          onShowToast={showToastNotification}
        />

      {/* Quick-View Property Modal */}
      <PropertyQuickViewModal
        property={quickViewProperty}
        isOpen={Boolean(quickViewProperty)}
        onClose={() => setQuickViewProperty(null)}
        onSave={handleToggleSave}
        isSaved={quickViewProperty ? savedPropertyIds.has(quickViewProperty.id) : false}
        onScheduleInquiry={(prop) => {
          setConsultationProperty(prop);
          setIsConsultationOpen(true);
        }}
        locale={locale}
      />

      {/* Consultation / Advisory Modal */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => {
          setIsConsultationOpen(false);
          setConsultationProperty(null);
        }}
        selectedProperty={consultationProperty}
        onSubmitInquiry={handleInquirySubmit}
        locale={locale}
      />

      {/* Floating Dark-Neon Toast Notification (Matching index.html lines 996-1000) */}
      <div
        id="toast"
        className={`fixed bottom-5 right-5 z-50 bg-[#16171a] border border-[#d9ff43] text-white text-xs px-4 py-3 rounded shadow-2xl flex items-center gap-2.5 transition-all duration-300 ${
          floatingToast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#d9ff43] shadow-[0_0_8px_#d9ff43]" />
        <span>{floatingToast.message}</span>
      </div>
    </div>
  );
};
export default LandingPage;

