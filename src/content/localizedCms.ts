import catalog from './arabicCmsCatalog.json';
import publicCopy from './arabicPublicCopy.json';

export const normalizeCmsText = (value: string) => value.trim().replace(/\r\n/g, '\n');
export const arabicCmsCatalog = catalog;
export type TranslateCms = (value: string) => string;
const arabic = new Map(catalog.map(row => [normalizeCmsText(row.source), row.translation]));
export function translateArabicCms(value: string): string {
  return arabic.get(normalizeCmsText(value)) ?? (publicCopy as Record<string,string>)[normalizeCmsText(value)] ?? value;
}
// Only editorial text is translated. Routing, identifiers, enums, money amounts,
// contact details and member identities must retain their original values.
const textFields = new Set(['label','headline','subheadline','body','title','description','short_description','short_explanation','introduction','i_am','i_can_be','what_to_do','iAm','iCanBe','whatToDo','eyebrow','city','country','continent','location','participation_info','past_summary','investment','price','apply_button_label','day_label','time_label','caption','alt_text','name']);
export function localizeCmsRecord<T>(record: T, translate: TranslateCms): T {
  if (Array.isArray(record)) return record.map(row => localizeCmsRecord(row, translate)) as T;
  if (!record || typeof record !== 'object') return record;
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key,
    typeof value === 'string' && textFields.has(key) ? translate(value)
      : value && typeof value === 'object' ? localizeCmsRecord(value, translate) : value,
  ])) as T;
}
