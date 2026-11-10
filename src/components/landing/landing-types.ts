export interface PropertyItem {
  id: string;
  title: string;
  titleBn: string;
  location: string;
  locationBn: string;
  area: string; // e.g. "Gulshan-2", "Banani Block D", "Dhanmondi 9/A", "Uttara Sector 3"
  propertyType: 'Flat' | 'Duplex' | 'Commercial' | 'Studio' | 'Penthouse';
  propertyTypeBn: string;
  priceMonthlyBdt: number;
  formattedPriceBdt: string;
  formattedPriceBn: string;
  beds: number;
  baths: number;
  sqft: number;
  parking: number;
  imageUrl: string;
  tag: string;
  tagBn: string;
  descriptionEn: string;
  descriptionBn: string;
  features: string[];
  featuresBn: string[];
}

export interface TestimonialItem {
  id: string;
  name: string;
  nameBn: string;
  role: string;
  roleBn: string;
  location: string;
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
}

export interface ProcessStep {
  number: string;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  iconType: 'grid' | 'photo' | 'contract' | 'key';
  imageBadgeUrl?: string;
}

export interface StatItem {
  value: string;
  valueBn: string;
  labelEn: string;
  labelBn: string;
}

export type SupportedLocale = 'en' | 'bn';

