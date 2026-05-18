-- =====================================================================
-- SETUP SUPABASE STORAGE BUCKET & RLS POLICIES FOR EQUIPMENT IMAGES
-- =====================================================================

-- 1. Création du bucket de stockage public 'equipments' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('equipments', 'equipments', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Suppression des anciennes règles si elles existent pour éviter les doublons
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- 3. RLS Policy : Permettre à tout le monde d'afficher les photos (Lecture Publique)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'equipments' );

-- 4. RLS Policy : Permettre uniquement aux utilisateurs connectés d'uploader des photos
CREATE POLICY "Authenticated Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'equipments' );

-- 5. RLS Policy : Permettre aux utilisateurs connectés de modifier leurs propres photos
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'equipments' AND auth.uid()::text = owner );

-- 6. RLS Policy : Permettre aux utilisateurs connectés de supprimer leurs propres photos
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'equipments' AND auth.uid()::text = owner );
