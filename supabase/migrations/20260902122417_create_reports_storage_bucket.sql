/*
# Create 'reports' storage bucket and public access policies

1. Storage Bucket
- Create a public bucket named 'reports' for pollution and cleaned-area photos.

2. Storage Policies (on storage.objects)
- Allow anon + authenticated to SELECT (read) objects in the 'reports' bucket.
- Allow anon + authenticated to INSERT (upload) objects in the 'reports' bucket.
- Allow anon + authenticated to UPDATE objects in the 'reports' bucket.
- Allow anon + authenticated to DELETE objects in the 'reports' bucket.
- All policies are scoped to the 'reports' bucket only.
- Data is intentionally public (no sign-in screen).
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_select_reports_bucket" ON storage.objects;
CREATE POLICY "anon_select_reports_bucket"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'reports');

DROP POLICY IF EXISTS "anon_insert_reports_bucket" ON storage.objects;
CREATE POLICY "anon_insert_reports_bucket"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'reports');

DROP POLICY IF EXISTS "anon_update_reports_bucket" ON storage.objects;
CREATE POLICY "anon_update_reports_bucket"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'reports')
  WITH CHECK (bucket_id = 'reports');

DROP POLICY IF EXISTS "anon_delete_reports_bucket" ON storage.objects;
CREATE POLICY "anon_delete_reports_bucket"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'reports');
