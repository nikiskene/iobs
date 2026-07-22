/*
  # Create thesis_media table

  1. New Tables
    - `thesis_media`
      - `id` (uuid, primary key)
      - `thesis_id` (uuid, references theses)
      - `media_url` (text)
      - `media_path` (text)
      - `media_type` (text, default 'image')
      - `display_order` (integer, default 0)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `thesis_media`
    - Anyone can read media for published theses
    - Authors can insert/update/delete media for their theses
    - Admins can manage all media
*/

CREATE TABLE IF NOT EXISTS thesis_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thesis_id uuid REFERENCES theses(id) ON DELETE CASCADE,
  media_url text DEFAULT '',
  media_path text DEFAULT '',
  media_type text DEFAULT 'image',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE thesis_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read media for accessible theses"
  ON thesis_media FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM theses
    WHERE theses.id = thesis_media.thesis_id
    AND (theses.status = 'published' OR theses.author_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  ));

CREATE POLICY "Authors can insert media for own theses"
  ON thesis_media FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM theses
    WHERE theses.id = thesis_media.thesis_id
    AND (theses.author_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  ));

CREATE POLICY "Authors can update media for own theses"
  ON thesis_media FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM theses
    WHERE theses.id = thesis_media.thesis_id
    AND (theses.author_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM theses
    WHERE theses.id = thesis_media.thesis_id
    AND (theses.author_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  ));

CREATE POLICY "Authors can delete media for own theses"
  ON thesis_media FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM theses
    WHERE theses.id = thesis_media.thesis_id
    AND (theses.author_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  ));
