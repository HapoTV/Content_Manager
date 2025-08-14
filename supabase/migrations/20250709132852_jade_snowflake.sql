/*
  # Create stores table

  1. New Tables
    - `stores`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, not null, references profiles.id)
      - `name` (text, not null)
      - `brand_company` (text, not null)
      - `address` (text, not null)
      - `latitude` (numeric, nullable)
      - `longitude` (numeric, nullable)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `stores` table
    - Add policy for users to read their own stores
    - Add policy for users to insert their own stores
    - Add policy for users to update their own stores
    - Add policy for admins to read all stores
*/

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand_company text NOT NULL,
  address text NOT NULL,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stores"
  ON stores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stores"
  ON stores
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- CORRECTED: The admin policy now uses a non-recursive JWT check.
CREATE POLICY "Admins can read all stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING ( (auth.jwt() ->> 'role') = 'admin' );