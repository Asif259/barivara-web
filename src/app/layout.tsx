import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barivara-web.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BariVara (বাড়িভাড়া) - স্মার্ট বাড়ি ও ভাড়া ব্যবস্থাপনা',
    template: '%s · BariVara (বাড়িভাড়া)',
  },
  description:
    'বাঙালি বাড়িওয়ালা ও প্রপার্টি ম্যানেজারদের বিশ্বস্ত প্ল্যাটফর্ম। ফ্ল্যাট রেজিস্ট্রি, বিদ্যুৎ-গ্যাস বিল বণ্টন, বিকাশ ও নগদ আদায় এবং ১-ক্লিক হোয়াটসঅ্যাপ মানি রিসিট।',
  keywords: [
    'বাড়িভাড়া',
    'BariVara',
    'property management Bangladesh',
    'flat rent software Dhaka',
    'bKash rent collection',
    'WhatsApp money receipt',
    'tenancy ledger',
  ],
  authors: [{ name: 'BariVara Team', url: siteUrl }],
  creator: 'BariVara',
  publisher: 'BariVara',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    alternateLocale: 'en_US',
    url: siteUrl,
    siteName: 'BariVara (বাড়িভাড়া)',
    title: 'BariVara (বাড়িভাড়া) - স্মার্ট বাড়ি ও ভাড়া ব্যবস্থাপনা',
    description:
      'স্মার্ট বাড়ি। সময়মতো ভাড়া। ঝামেলামুক্ত বাড়ি পরিচালনা। অটো বিকাশ ট্র্যাকিং ও ১-ক্লিক হোয়াটসঅ্যাপ রিসিট।',
    images: [
      {
        url: '/hero-building.jpg',
        width: 1200,
        height: 630,
        alt: 'BariVara Architectural Hero Visual',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BariVara (বাড়িভাড়া) - স্মার্ট বাড়ি ও ভাড়া ব্যবস্থাপনা',
    description:
      'Smart properties. On-time rent. The rental platform that brings them together.',
    images: ['/hero-building.jpg'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BariVara',
  alternateName: 'বাড়িভাড়া',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android',
  description:
    'Bangla-first property and rental management platform with native BDT currency, bKash reconciliation, and WhatsApp receipt generation.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BDT',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning className={`${plusJakartaSans.variable} ${inter.variable} ${notoSansBengali.variable} bg-[#060807]`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#060807] text-[#F2F5F4] antialiased selection:bg-[#12664F] selection:text-white" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}