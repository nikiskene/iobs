/*
  # Create homepage_sections table

  1. New Tables
    - `homepage_sections`
      - `id` (uuid, primary key)
      - `section_key` (text, unique, not null)
      - `headline` (text)
      - `subheadline` (text)
      - `body` (text)
      - `media_url` (text)
      - `media_path` (text)
      - `display_order` (integer, default 0)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `homepage_sections`
    - Anyone can read active sections
    - Only admins can insert/update/delete
*/

CREATE TABLE IF NOT EXISTS homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  headline text DEFAULT '',
  subheadline text DEFAULT '',
  body text DEFAULT '',
  media_url text DEFAULT '',
  media_path text DEFAULT '',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active homepage sections"
  ON homepage_sections FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can insert homepage sections"
  ON homepage_sections FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update homepage sections"
  ON homepage_sections FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can delete homepage sections"
  ON homepage_sections FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
