/*
# Create reports table for EcoMap pollution reports

1. New Tables
- `reports`
  - `id` (uuid, primary key, auto-generated)
  - `created_at` (timestamptz, default now())
  - `reporter_name` (text, not null) — name of the person reporting
  - `reporter_email` (text, not null) — email of the person reporting
  - `description` (text, nullable) — description of the pollution
  - `category` (text, not null) — one of: 'Sokak Çöpü', 'Sahil ve Deniz Kirliliği', 'Dere ve Akarsu Atıkları', 'Kaçak Moloz Dökümü', 'Ormanlık Alan Kirliliği'
  - `status` (text, not null, default 'Beklemede') — one of: 'Beklemede', 'İnceleniyor', 'Temizlendi'
  - `lat` (double precision, not null) — latitude
  - `lng` (double precision, not null) — longitude
  - `photo_url` (text, nullable) — public URL of the pollution photo in Storage
  - `cleaned_photo_url` (text, nullable) — public URL of the cleaned-area photo
  - `cleaned_at` (timestamptz, nullable) — timestamp when status was set to 'Temizlendi'

2. Security
- Enable RLS on `reports`.
- Allow anon + authenticated full CRUD because the data is intentionally public/shared
  (no sign-in screen; admin panel uses a simple password gate, not Supabase Auth).

3. Indexes
- Index on `created_at` (descending) for listing newest-first.
- Index on `status` for filtering by status in the admin panel.
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  reporter_name text NOT NULL,
  reporter_email text NOT NULL,
  description text,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'Beklemede',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  photo_url text,
  cleaned_photo_url text,
  cleaned_at timestamptz
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reports" ON reports;
CREATE POLICY "anon_select_reports"
  ON reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reports" ON reports;
CREATE POLICY "anon_insert_reports"
  ON reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reports" ON reports;
CREATE POLICY "anon_update_reports"
  ON reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reports" ON reports;
CREATE POLICY "anon_delete_reports"
  ON reports FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);
