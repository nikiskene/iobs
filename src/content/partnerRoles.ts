// src/content/partnerRoles.ts
export const PARTNER_ROLES = [
  ['founding', 'Founding Partner'],
  ['principal', 'Principal Partner'],
  ['category', 'Category Partner'],
  ['host-event', 'Host & Event Partner'],
  ['media', 'Media Partner'],
  ['knowledge', 'Knowledge Partner'],
  ['patron', 'Patron'],
] as const;

export type PartnerRole = typeof PARTNER_ROLES[number][0];

export const PARTNER_GROUPS: { title:string; roles:PartnerRole[] }[] = [
  { title: 'Founding Partners', roles: ['founding'] },
  { title: 'Partners', roles: ['principal', 'category', 'host-event', 'media', 'knowledge'] },
  { title: 'Patrons', roles: ['patron'] },
];

export function partnerRole(value: string | null): PartnerRole {
  return PARTNER_ROLES.some(([key]) => key === value) ? value as PartnerRole : 'principal';
}
