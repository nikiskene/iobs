/*
  # Seed initial data and storage buckets

  1. Seed Data
    - Insert default thesis categories (Education, Governance, Economy, Technology, Environment, Health)
    - Insert default homepage sections (hero, mission, vision, approach)

  2. Storage
    - Create storage buckets: profile-photos, thesis-visuals, homepage-media
*/

-- Seed thesis categories
INSERT INTO thesis_categories (name, slug, description, color_hex, display_order) VALUES
  ('Education', 'education', 'Rethinking how societies learn, teach, and share knowledge.', '#0EA5E9', 1),
  ('Governance', 'governance', 'Examining the structures that shape collective decision-making.', '#F59E0B', 2),
  ('Economy', 'economy', 'Questioning the systems that distribute resources and opportunity.', '#10B981', 3),
  ('Technology', 'technology', 'Understanding the tools that redefine what is possible.', '#6366F1', 4),
  ('Environment', 'environment', 'Addressing the relationship between civilization and the natural world.', '#84CC16', 5),
  ('Health', 'health', 'Exploring what it means to care for human well-being at scale.', '#EF4444', 6)
ON CONFLICT (slug) DO NOTHING;

-- Seed homepage sections
INSERT INTO homepage_sections (section_key, headline, subheadline, body, display_order) VALUES
  ('hero', 'The Operating System the World Needs', 'A platform for rethinking the systems that shape our future.', 'WorldOS is a space for serious people asking serious questions about the systems that govern our lives — and what comes next.', 0),
  ('mission', 'Our Mission', 'Start the conversations that matter.', 'We believe the most important step in changing any system is having the courage to question it. WorldOS exists to make that step possible — by giving thinkers, builders, and leaders a place to articulate what they see, propose what could be, and invite others into the conversation.', 1),
  ('vision', 'A World That Works', 'For everyone, not just some.', 'The systems we inherited were designed for a world that no longer exists. WorldOS is not a blueprint — it is an invitation. An invitation to think clearly, speak honestly, and build together toward systems that serve the many, not the few.', 2),
  ('approach', 'How We Work', 'Thesis-driven, community-powered.', 'Every conversation on WorldOS begins with a thesis — a clear, reasoned argument about what is broken and what could be better. Theses are organized by category, open to challenge, and built to evolve. This is not opinion without structure. It is conviction with rigor.', 3)
ON CONFLICT (section_key) DO NOTHING;

-- Seed a sample education thesis
INSERT INTO theses (category_id, title, subheadline, short_explanation, body, status, is_featured, display_order)
SELECT
  c.id,
  'Education Must Be Reimagined as a Public Good',
  'The current model serves credentials, not understanding.',
  'Our education systems were designed for industrial efficiency, not human flourishing. It is time to rethink what learning is for.',
  'The modern education system was built for a world that valued compliance over curiosity, standardization over creativity, and credentials over competence. Schools were designed to sort, not to teach — to produce workers, not thinkers.

This thesis argues that education must be reimagined as a genuine public good: accessible to all, oriented toward understanding rather than credentialing, and structured to develop the full range of human capability rather than a narrow set of economically useful skills.

The path forward is not incremental reform. It requires fundamentally rethinking the purpose, structure, and delivery of learning — from early childhood through adulthood — and building systems that treat education as an end in itself, not a means to an economic end.',
  'published',
  true,
  0
FROM thesis_categories c WHERE c.slug = 'education';
