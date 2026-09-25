import type { TeamPerson } from './team';

export type MemberAccount = {
  id: string;
  email: string;
  profile_name: string;
  role: 'explorer' | 'admin';
  is_team_member: boolean;
  is_active: boolean;
};

export type ManagedMember = TeamPerson & {
  location: string;
  directory_public: boolean;
  primary_profile_id: string | null;
  updated_at: string | null;
  accounts: MemberAccount[];
};

export const newMember = (): ManagedMember => ({
  id: crypto.randomUUID(), full_name: '', category: 'team', status: 'draft',
  title: '', description: '', photo_url: '', linkedin_url: '', substack_url: '',
  sort_order: 0, location: '', directory_public: false, primary_profile_id: null,
  updated_at: null, accounts: [],
});

export function memberMatches(member: ManagedMember, search: string) {
  const term = search.trim().toLowerCase();
  return !term || [member.full_name, member.title, member.category, member.location,
    ...member.accounts.flatMap((account) => [account.email, account.profile_name])]
    .some((value) => value.toLowerCase().includes(term));
}
