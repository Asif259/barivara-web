import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';
import { landingCopy } from '@/components/landing/copy';

const bn = landingCopy.bn;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://barivara-web.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    absolute: bn.meta.title,
  },
  description: bn.meta.description,
  keywords: [
    'BariVara',
    'বাড়িভাড়া',
    'bari vara',
    'rent management Bangladesh',
    'বাড়ি ভাড়া ব্যবস্থাপনা',
    'landlord software Bangladesh',
    'ভাড়া রসিদ',
    'tenant management',
  ],
  alternates: {
    canonical: `${siteUrl}/`,
  },
  openGraph: {
    type: 'website',
    title: bn.meta.title,
    description: bn.meta.description,
    siteName: bn.meta.siteName,
    locale: 'bn_BD',
    alternateLocale: 'en_US',
    url: `${siteUrl}/`,
    images: [{ url: '/logo.png', width: 512, height: 512, alt: bn.meta.ogAlt }],
  },
  twitter: {
    card: 'summary_large_image',
    title: bn.meta.title,
    description: bn.meta.description,
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MarketingHomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'BariVara',
    alternateName: 'বাড়িভাড়া',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Mobile (PWA)',
    inLanguage: ['bn', 'en'],
    description: bn.meta.description,
    ...(siteUrl ? { url: `${siteUrl}/` } : {}),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BDT',
      description: '100% Free Public Beta for landlords in Bangladesh',
    },
    featureList: bn.features.items.map((item) => item.title),
  };

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: bn.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <LandingPage />
    </>
  );
}
