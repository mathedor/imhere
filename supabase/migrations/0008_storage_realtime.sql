-- ============================================================
-- 0008 · Storage buckets + Realtime publications
-- ============================================================

-- ============================================================
-- STORAGE BUCKETS (publicos, com policies de acesso)
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('establishment-covers', 'establishment-covers', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('establishment-gallery', 'establishment-gallery', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('user-gallery', 'user-gallery', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('moments', 'moments', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('chat-media', 'chat-media', true, 20971520, array['image/jpeg','image/png','image/webp','audio/mpeg','audio/webm'])
on conflict (id) do nothing;

-- Policies: leitura publica (buckets sao public), upload requer auth
do $$
begin
  -- Avatars: usuario sobe sua propria foto
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'avatars_authenticated_upload') then
    create policy "avatars_authenticated_upload" on storage.objects
      for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'avatars_authenticated_update') then
    create policy "avatars_authenticated_update" on storage.objects
      for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');
  end if;

  -- Establishment buckets: owner ou admin
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'estab_buckets_upload') then
    create policy "estab_buckets_upload" on storage.objects
      for insert with check (
        bucket_id in ('establishment-covers','establishment-gallery','moments')
        and auth.role() = 'authenticated'
      );
  end if;

  -- User gallery: owner
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'user_gallery_upload') then
    create policy "user_gallery_upload" on storage.objects
      for insert with check (bucket_id = 'user-gallery' and auth.role() = 'authenticated');
  end if;

  -- Chat media: qualquer authenticated
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'chat_media_upload') then
    create policy "chat_media_upload" on storage.objects
      for insert with check (bucket_id = 'chat-media' and auth.role() = 'authenticated');
  end if;
end $$;

-- ============================================================
-- REALTIME: publica tabelas pra escutar mudanças via channels
-- ============================================================

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.checkins;
alter publication supabase_realtime add table public.contact_requests;
alter publication supabase_realtime add table public.moments;

-- REPLICA IDENTITY FULL: necessário pra detectar UPDATE corretamente em realtime
alter table public.messages replica identity full;
alter table public.notifications replica identity full;
alter table public.checkins replica identity full;
