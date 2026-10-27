import type { Metadata } from 'next';
import { Inter, Noto_Sans_Bengali, Noto_Serif_Bengali } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali',
  display: 'swap',
});

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['500', '700'],
  variable: '--font-serif-bengali',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://barivara-web.vercel.app'),
  title: 'BariVara (বাড়িভাড়া) - স্মার্ট বাড়ি ও ভাড়া ব্যবস্থাপনা',
  description: 'স্মার্ট বাড়ি ও ভাড়া ব্যবস্থাপনা প্ল্যাটফর্ম - বাড়িওয়ালাদের জন্য সহজে বাড়ি পরিচালনা ও ভাড়া আদায়',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning className={`${inter.variable} ${notoSansBengali.variable} ${notoSerifBengali.variable}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
