import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://barivara-web.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    absolute: 'BariVara (বাড়িভাড়া) — আধুনিক আর্কিটেকচারাল প্রপার্টি ও ডিজিটাল ভাড়া ব্যবস্থাপনা',
  },
  description:
    'বাংলাদেশের বাড়িওয়ালা ও প্রপার্টি মালিকদের জন্য বাংলা-প্রথম ভাড়া ব্যবস্থাপনা প্ল্যাটফর্ম। বাড়ি ও ফ্ল্যাট ডিজিটালাইজেশন, ভাড়াটিয়া যাচাই, মাসিক বিল, ১-ক্লিকে হোয়াটসঅ্যাপ রসিদ এবং এ৪ ভাউচার।',
  keywords: [
    'বাড়িভাড়া',
    'BariVara',
    'property management Bangladesh',
    'house rent Dhaka',
    'landlord software Bangladesh',
    'Gulshan apartment rent',
    'Banani flat rent',
    'Dhanmondi penthouse',
    'tenant management',
    'WhatsApp rent receipt',
    'digital khata',
  ],
  alternates: {
    canonical: `${siteUrl}/`,
  },
  openGraph: {
    type: 'website',
    title: 'BariVara (বাড়িভাড়া) — আধুনিক আর্কিটেকচারাল প্রপার্টি ও ডিজিটাল ভাড়া ব্যবস্থাপনা',
    description:
      'কাগজের খাতা থেকে স্মার্ট ডিজিটাল খতিয়ানে বাড়ি ও ফ্ল্যাট ব্যবস্থাপনা। স্বয়ংক্রিয় মাসিক বিল, ১-ক্লিকে হোয়াটসঅ্যাপ রসিদ ও নিশ্চিত ভাড়া আদায়।',
    siteName: 'বাড়িভাড়া (BariVara)',
    locale: 'bn_BD',
    alternateLocale: 'en_US',
    url: `${siteUrl}/`,
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'BariVara Architectural Property Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BariVara (বাড়িভাড়া) — Modern Architectural Property & Tenancy Platform',
    description: 'Digital rental management for landlords in Dhaka and across Bangladesh.',
    images: ['/icon.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BariVara (বাড়িভাড়া)',
  operatingSystem: 'Web, iOS, Android',
  applicationCategory: 'BusinessApplication',
  description: 'Bangla-first property and rental management platform for residential and commercial landlords.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BDT',
  },
  publisher: {
    '@type': 'Organization',
    name: 'BariVara Technologies Ltd.',
    url: siteUrl,
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <LandingPage />
      </main>
    </>
  );
}

