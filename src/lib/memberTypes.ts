export interface DirectoryMember {
  id: string;
  profile_name: string;
  full_name: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  location: string | null;
  city: string | null;
  location_label: string | null;
  bio: string | null;
  team_role: string | null;
  is_team_member: boolean;
}
