import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';
import { landingCopy } from '@/components/landing/copy';

const bn = landingCopy.bn;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
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
    canonical: siteUrl ? `${siteUrl}/` : '/',
  },
  openGraph: {
    type: 'website',
    title: bn.meta.title,
    description: bn.meta.description,
    siteName: bn.meta.siteName,
    locale: 'bn_BD',
    alternateLocale: 'en_US',
    url: siteUrl ? `${siteUrl}/` : '/',
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
    operatingSystem: 'Web',
    inLanguage: ['bn', 'en'],
    description: bn.meta.description,
    ...(siteUrl ? { url: `${siteUrl}/` } : {}),
    featureList: bn.features.items.map((item) => item.title),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingPage />
    </>
  );
}
