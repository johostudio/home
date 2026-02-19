-- Run this in your Supabase SQL Editor to fix the RLS issues

-- 1. Enable RLS on public.strips table
alter table public.strips enable row level security;

-- 2. Allow anon to read/insert rows in public.strips table
drop policy if exists "public read" on public.strips;
create policy "public read" on public.strips for select to anon using (true);

drop policy if exists "public write" on public.strips;
create policy "public write" on public.strips for insert to anon with check (true);

-- 3. Allow anon to upload/read files in storage.objects (bucket: 'darkroom')
-- Make sure your bucket is named "darkroom" and is Public!

drop policy if exists "anon upload darkroom" on storage.objects;
create policy "anon upload darkroom" on storage.objects
  for insert to anon with check (bucket_id = 'darkroom');

drop policy if exists "anon read darkroom" on storage.objects;
create policy "anon read darkroom" on storage.objects
  for select to anon using (bucket_id = 'darkroom');
