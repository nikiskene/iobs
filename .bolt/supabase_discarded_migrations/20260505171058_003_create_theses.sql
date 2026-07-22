/*
  # Create theses table

  1. New Tables
    - `theses`
      - `id` (uuid, primary key)
      - `category_id` (uuid, references thesis_categories)
      - `author_id` (uuid, references profiles)
      - `title` (text, not null)
      - `subheadline` (text)
      - `short_explanation` (text)
      - `body` (text)
      - `status` (text, default 'draft') -- draft, published, archived
      - `is_featured` (boolean, default false)
      - `display_order` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `theses`
    - Anyone can read published theses
    - Authors can read their own drafts
    - Authors can insert their own theses
    - Authors can update their own theses
    - Admins can update/delete any thesis
*/

CREATE TABLE IF NOT EXISTS theses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES thesis_categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  subheadline text DEFAULT '',
  short_explanation text DEFAULT '',
  body text DEFAULT '',
  status text DEFAULT 'draft',
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE theses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published theses"
  ON theses FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Authors can insert own theses"
  ON theses FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update own theses"
  ON theses FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins and authors can delete theses"
  ON theses FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
