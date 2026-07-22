import { Building2, GraduationCap, Landmark } from 'lucide-react';

export type OrganizationType = 'company' | 'education' | 'government';

export type CustomExpeditionTopic =
  | 'ai'
  | 'robotics'
  | 'health'
  | 'retail'
  | 'education'
  | 'energy'
  | 'finance'
  | 'food'
  | 'other';

export type CustomExpeditionDestination =
  | 'silicon_valley'
  | 'shenzhen_hongkong'
  | 'suggest_different_location';

export const CUSTOM_EXPEDITION_HERO_IMAGE =
  'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/expedition-media/IMG_2923.JPG';

export const organizationOptions = [
  {
    value: 'company',
    label: 'Company',
    icon: Building2,
    pricePerDay: 20000,
  },
  {
    value: 'government',
    label: 'Government',
    icon: Landmark,
    pricePerDay: 30000,
  },
  {
    value: 'education',
    label: 'Education Institution',
    icon: GraduationCap,
    pricePerDay: 5000,
  },
] as const;

export const topicOptions = [
  { value: 'ai', label: 'AI' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'health', label: 'Health' },
  { value: 'retail', label: 'Retail' },
  { value: 'education', label: 'Education' },
  { value: 'energy', label: 'Energy' },
  { value: 'finance', label: 'Finance' },
  { value: 'food', label: 'Food' },
  { value: 'other', label: 'Other' },
] as const;

export const destinationOptions = [
  { value: 'silicon_valley', label: 'Silicon Valley' },
  { value: 'shenzhen_hongkong', label: 'Shenzhen / Hong Kong' },
  { value: 'suggest_different_location', label: 'Suggest a different location' },
] as const;