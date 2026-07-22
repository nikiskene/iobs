/*
  # Create profiles table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `photo_url` (text)
      - `email` (text)
      - `linkedin_url` (text)
      - `location` (text)
      - `bio` (text)
      - `role` (text, default 'explorer')
      - `is_team_member` (boolean, default false)
      - `team_role` (text)
      - `team_bio` (text)
      - `team_sort_order` (integer, default 0)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `profiles` table
    - Anyone can read active profiles
    - Users can update their own profile
    - Users can insert their own profile
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  photo_url text DEFAULT '',
  email text DEFAULT '',
  linkedin_url text DEFAULT '',
  location text DEFAULT '',
  bio text DEFAULT '',
  role text DEFAULT 'explorer',
  is_team_member boolean DEFAULT false,
  team_role text DEFAULT '',
  team_bio text DEFAULT '',
  team_sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_active = true OR auth.uid() = id);

CREATE POLICY "Public can read team members"
  ON profiles FOR SELECT
  TO anon
  USING (is_active = true AND is_team_member = true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
