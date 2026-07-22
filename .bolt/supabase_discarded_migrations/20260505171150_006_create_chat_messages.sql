/*
  # Create chat_messages table

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `author_id` (uuid, references profiles)
      - `message` (text, not null)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `chat_messages`
    - Authenticated users can read all messages
    - Authenticated users can insert their own messages
    - Only admins can delete messages
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Admins can delete messages"
  ON chat_messages FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
