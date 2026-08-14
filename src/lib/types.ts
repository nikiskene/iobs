// src/lib/types.ts
export interface Profile {
  id: string;
  full_name: string | null;
  photo_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  location: string | null;
  city: string | null;
  location_label: string | null;
  geo_lat: number | null;
  geo_lng: number | null;
  show_on_map: boolean;
  bio: string | null;
  role: 'explorer' | 'admin';
  is_team_member: boolean;
  is_event_master: boolean;
  team_role: string | null;
  team_bio: string | null;
  team_sort_order: number | null;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ThesisCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color_hex: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Thesis {
  id: string;
  category_id: string;
  author_id: string | null;
  title: string;
  subheadline: string | null;
  short_explanation: string | null;
  body: string | null;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  thesis_categories?: ThesisCategory;
  profiles?: Profile;
  thesis_media?: ThesisMedia[];
}

export interface ThesisMedia {
  id: string;
  thesis_id: string;
  file_url: string;
  file_path: string | null;
  alt_text: string | null;
  display_order: number;
  is_featured: boolean;
  created_at: string;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  headline: string | null;
  subheadline: string | null;
  body: string | null;
  media_url: string | null;
  media_path: string | null;
  icon_key: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'photo_url'>;
}

export interface SiteSettings {
  id: string;
  logo_url: string | null;
  logo_path: string | null;
  default_hero_url: string | null;
  default_hero_path: string | null;
  headline_font_url: string | null;
  headline_font_path: string | null;
  body_font_url: string | null;
  body_font_path: string | null;
  contact_email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  status: 'draft' | 'scheduled' | 'past' | 'archived';
  start_date: string;
  end_date: string | null;
  location: string | null;
  description: string | null;
  hero_image_url: string | null;
  hero_image_path: string | null;
  investment: string | null;
  participation_info: string | null;
  past_summary: string | null;
  youtube_url: string | null;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  event_program_items?: EventProgramItem[];
}

export interface EventProgramItem {
  id: string;
  event_id: string;
  created_at: string;
  updated_at: string;
  headline: string;
  short_description: string | null;
  photo_url: string | null;
  photo_path: string | null;
  display_order: number;
  is_active: boolean;
}

export interface EventRsvp {
  id: string;
  event_id: string;
  created_at: string;
  name: string;
  email: string;
  message: string | null;
  status: 'new' | 'contacted' | 'confirmed' | 'declined' | 'archived';
}

export interface Expedition {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  price: string | null;
  short_description: string | null;
  description: string | null;
  hero_image_url: string | null;
  hero_image_path: string | null;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  is_active: boolean;
  apply_button_label: string | null;
  contact_email: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  expedition_program_items?: ExpeditionProgramItem[];
  expedition_photos?: ExpeditionPhoto[];
}

export interface ExpeditionProgramItem {
  id: string;
  expedition_id: string;
  headline: string;
  day_label: string | null;
  time_label: string | null;
  short_description: string | null;
  photo_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ExpeditionPhoto {
  id: string;
  expedition_id: string;
  photo_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ExpeditionInquiry {
  id: string;
  expedition_id: string;
  user_id: string | null;
  name: string;
  email: string;
  company: string | null;
  position: string | null;
  linkedin_url: string | null;
  message: string | null;
  motivation: string | null;
  contribution: string | null;
  curiosity_question: string | null;
  commitment_accepted: boolean;
  status:
    | 'new'
    | 'reviewing'
    | 'interesting'
    | 'interview'
    | 'invited'
    | 'confirmed'
    | 'waiting_list'
    | 'declined'
    | 'attended'
    | 'alumni'
    | 'archived';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  expeditions?: Pick<Expedition, 'id' | 'title' | 'slug' | 'location' | 'start_date'>;
}

export interface HomepageRotatingHeadline {
  id: string;
  prefix: string;
  subject: string;
  first_line: string;
  second_line: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  conversation_type:
    | 'conversation'
    | 'dinner'
    | 'session'
    | 'workshop'
    | 'field_visit'
    | 'roundtable';
  location: string | null;
  start_time: string | null;
  end_time: string | null;
  expedition_id: string | null;
  event_id: string | null;
  host_profile_id: string | null;
  hero_image_url: string | null;
  hero_image_path: string | null;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  expeditions?: Pick<Expedition, 'id' | 'title' | 'slug'>;
  events?: Pick<Event, 'id' | 'title' | 'slug'>;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'photo_url'>;
  conversation_participants?: ConversationParticipant[];
  conversation_theses?: ConversationThesis[];
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  profile_id: string | null;
  name: string | null;
  role_label: string | null;
  created_at: string;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'photo_url'>;
}

export interface ConversationThesis {
  id: string;
  conversation_id: string;
  thesis_id: string;
  created_at: string;
  theses?: Pick<Thesis, 'id' | 'title' | 'subheadline' | 'short_explanation'>;
}