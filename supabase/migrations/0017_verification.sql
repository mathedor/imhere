-- Sprint 3: verificação de identidade por selfie

-- 1. Tabela de submissões
create table if not exists public.identity_verifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  selfie_url text not null,
  doc_url text, -- opcional, foto do documento
  status text not null default 'pending', -- pending | approved | rejected
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz default now(),
  unique (profile_id, status) deferrable initially deferred -- evita 2 pending simultaneos
);

create index if not exists identity_verifications_status_idx
  on public.identity_verifications(status, created_at desc);

-- 2. Flag no profile
alter table public.profiles
  add column if not exists is_verified boolean not null default false,
  add column if not exists verified_at timestamptz;

-- 3. RLS
alter table public.identity_verifications enable row level security;

drop policy if exists "verifs_select_self_or_admin" on public.identity_verifications;
create policy "verifs_select_self_or_admin" on public.identity_verifications for select
  using (profile_id = auth.uid() or is_admin());

drop policy if exists "verifs_insert_self" on public.identity_verifications;
create policy "verifs_insert_self" on public.identity_verifications for insert
  with check (profile_id = auth.uid());

drop policy if exists "verifs_update_admin" on public.identity_verifications;
create policy "verifs_update_admin" on public.identity_verifications for update
  using (is_admin());

grant all on public.identity_verifications to anon, authenticated, service_role;

-- 4. Storage bucket pra selfies (privado, só admin lê)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('verifications', 'verifications', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Policy: user faz upload da própria selfie; admin lê tudo
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename='objects' and schemaname='storage'
      and policyname='verifications_upload_self'
  ) then
    create policy "verifications_upload_self" on storage.objects
      for insert with check (
        bucket_id = 'verifications' and auth.role() = 'authenticated'
      );
  end if;
  if not exists (
    select 1 from pg_policies where tablename='objects' and schemaname='storage'
      and policyname='verifications_read_admin_or_self'
  ) then
    create policy "verifications_read_admin_or_self" on storage.objects
      for select using (
        bucket_id = 'verifications' and (
          owner = auth.uid()
          or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
        )
      );
  end if;
end$$;

-- 5. Trigger: quando aprova, marca profile.is_verified + notifica user
create or replace function public.tg_verification_update()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  if new.status = 'approved' and (old.status is null or old.status != 'approved') then
    update public.profiles
    set is_verified = true, verified_at = now()
    where id = new.profile_id;

    insert into public.notifications (profile_id, kind, title, body, link)
    values (
      new.profile_id,
      'moderation_warning',
      'Você foi verificado ✓',
      'Seu badge de verificado já está ativo no app.',
      '/app/perfil'
    );
  elsif new.status = 'rejected' and old.status != 'rejected' then
    insert into public.notifications (profile_id, kind, title, body, link)
    values (
      new.profile_id,
      'moderation_warning',
      'Verificação recusada',
      coalesce(new.rejection_reason, 'Envie uma selfie mais clara.'),
      '/app/perfil/verificacao'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists verification_update on public.identity_verifications;
create trigger verification_update
  after update on public.identity_verifications
  for each row execute function public.tg_verification_update();
