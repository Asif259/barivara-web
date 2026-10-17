import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barivara-web.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register', '/forgot-password', '/reset-password'],
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/properties',
          '/properties/*',
          '/tenants',
          '/tenants/*',
          '/agreements',
          '/agreements/*',
          '/rents',
          '/rents/*',
          '/payments',
          '/payments/*',
          '/expenses',
          '/expenses/*',
          '/reports',
          '/reports/*',
          '/settings',
          '/settings/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
