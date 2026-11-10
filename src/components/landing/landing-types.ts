export interface ProductModuleItem {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  category: 'Receipts' | 'Utilities' | 'Tenants' | 'Payments' | 'Ledger';
  categoryBn: string;
  badge: string;
  badgeBn: string;
  highlightMetric: string;
  highlightMetricBn: string;
  imageUrl: string;
  descriptionEn: string;
  descriptionBn: string;
  specs: string[];
  specsBn: string[];
  features: string[];
  featuresBn: string[];
  sampleUiSnippetEn: string;
  sampleUiSnippetBn: string;
  ctaTextEn: string;
  ctaTextBn: string;
  targetPropertyType?: string[];
}

export interface TestimonialItem {
  id: string;
  name: string;
  nameBn: string;
  role: string;
  roleBn: string;
  location: string;
  unitsCount: string;
  quoteEn: string;
  quoteBn: string;
  headlineEn: string;
  headlineBn: string;
  imageUrl: string;
}

export interface ArticleItem {
  id: string;
  titleEn: string;
  titleBn: string;
  excerptEn: string;
  excerptBn: string;
  author: string;
  authorAvatar: string;
  readTime: string;
  readTimeBn: string;
  imageUrl: string;
  categoryEn: string;
  categoryBn: string;
  tagEn: string;
  tagBn: string;
}

export interface ProcessStep {
  number: string;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  iconType: 'building' | 'users' | 'invoice' | 'whatsapp';
  imageBadgeUrl?: string;
}

export interface StatItem {
  value: string;
  valueBn: string;
  labelEn: string;
  labelBn: string;
  sublabelEn: string;
  sublabelBn: string;
}

export type SupportedLocale = 'en' | 'bn';
