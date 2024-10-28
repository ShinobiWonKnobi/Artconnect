-- Add banner_url to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Create banners bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for banners
CREATE POLICY "Banner images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Users can upload banner images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'banners'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own banner images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'banners'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own banner images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'banners'
    AND auth.uid()::text = (storage.foldername(name))[1]
);