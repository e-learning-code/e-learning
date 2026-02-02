-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

-- Storage policies for receipts bucket
-- Allow authenticated users to upload their own receipts
DROP POLICY IF EXISTS "Students can upload receipts" ON storage.objects;
CREATE POLICY "Students can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own receipts
DROP POLICY IF EXISTS "Students can view own receipts" ON storage.objects;
CREATE POLICY "Students can view own receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all receipts
DROP POLICY IF EXISTS "Admins can view all receipts" ON storage.objects;
CREATE POLICY "Admins can view all receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Public read access for receipts (since bucket is public)
DROP POLICY IF EXISTS "Public read access for receipts" ON storage.objects;
CREATE POLICY "Public read access for receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'receipts');
