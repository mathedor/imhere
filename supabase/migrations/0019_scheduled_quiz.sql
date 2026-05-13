-- ============================================================
-- 0019_scheduled_quiz.sql
-- Story agendado + Quiz de afinidade (Sprint 5a)
-- ============================================================

-- ---------- Story agendado ----------
create table if not exists scheduled_moments (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  image_url text not null,
  caption text,
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'posted', 'cancelled')),
  posted_moment_id uuid references moments(id) on delete set null,
  created_at timestamptz not null default now(),
  posted_at timestamptz,
  created_by uuid references profiles(id) on delete set null
);

create index if not exists idx_scheduled_moments_due
  on scheduled_moments (status, scheduled_for)
  where status = 'pending';

create index if not exists idx_scheduled_moments_estab
  on scheduled_moments (establishment_id, scheduled_for desc);

alter table scheduled_moments enable row level security;

-- Dono lê/escreve só os do próprio estab
drop policy if exists scheduled_moments_owner_select on scheduled_moments;
create policy scheduled_moments_owner_select on scheduled_moments
  for select using (
    establishment_id in (select id from establishments where owner_id = auth.uid())
  );

drop policy if exists scheduled_moments_owner_insert on scheduled_moments;
create policy scheduled_moments_owner_insert on scheduled_moments
  for insert with check (
    establishment_id in (select id from establishments where owner_id = auth.uid())
  );

drop policy if exists scheduled_moments_owner_update on scheduled_moments;
create policy scheduled_moments_owner_update on scheduled_moments
  for update using (
    establishment_id in (select id from establishments where owner_id = auth.uid())
  );

drop policy if exists scheduled_moments_owner_delete on scheduled_moments;
create policy scheduled_moments_owner_delete on scheduled_moments
  for delete using (
    establishment_id in (select id from establishments where owner_id = auth.uid())
  );

-- Admin total
drop policy if exists scheduled_moments_admin_all on scheduled_moments;
create policy scheduled_moments_admin_all on scheduled_moments
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Publica todos os que estão vencidos. Retorna quantos foram publicados.
create or replace function publish_due_scheduled_moments()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int := 0;
  r record;
  v_new_id uuid;
begin
  for r in
    select * from scheduled_moments
    where status = 'pending' and scheduled_for <= now()
    order by scheduled_for
    limit 100
  loop
    insert into moments (establishment_id, image_url, caption)
    values (r.establishment_id, r.image_url, r.caption)
    returning id into v_new_id;

    update scheduled_moments
      set status = 'posted', posted_at = now(), posted_moment_id = v_new_id
      where id = r.id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

grant execute on function publish_due_scheduled_moments() to anon, authenticated, service_role;


-- ---------- Quiz de afinidade ----------
create table if not exists profile_quiz_answers (
  profile_id uuid primary key references profiles(id) on delete cascade,
  -- 5 perguntas fechadas (multiple choice)
  q1_vibe text,        -- 'agitado' | 'tranquilo' | 'misto'
  q2_drink text,       -- 'cerveja' | 'drink' | 'vinho' | 'nenhum'
  q3_music text,       -- 'sertanejo' | 'eletronica' | 'pagode' | 'rock' | 'indie'
  q4_company text,     -- 'sozinho' | 'amigos' | 'casal' | 'familia'
  q5_time text,        -- 'jantar' | 'happy' | 'madrugada'
  updated_at timestamptz not null default now()
);

alter table profile_quiz_answers enable row level security;

drop policy if exists pqa_owner_all on profile_quiz_answers;
create policy pqa_owner_all on profile_quiz_answers
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Qualquer um autenticado pode ler respostas de outros (necessário pro match score)
drop policy if exists pqa_authenticated_read on profile_quiz_answers;
create policy pqa_authenticated_read on profile_quiz_answers
  for select using (auth.uid() is not null);

-- Computa afinidade entre dois perfis (0..100)
create or replace function calc_quiz_affinity(profile_a uuid, profile_b uuid)
returns int
language plpgsql
stable
as $$
declare
  a record;
  b record;
  matches int := 0;
  total int := 0;
begin
  select * into a from profile_quiz_answers where profile_id = profile_a;
  select * into b from profile_quiz_answers where profile_id = profile_b;
  if a is null or b is null then return 0; end if;

  if a.q1_vibe is not null and b.q1_vibe is not null then
    total := total + 1;
    if a.q1_vibe = b.q1_vibe or a.q1_vibe = 'misto' or b.q1_vibe = 'misto' then
      matches := matches + 1;
    end if;
  end if;

  if a.q2_drink is not null and b.q2_drink is not null then
    total := total + 1;
    if a.q2_drink = b.q2_drink then matches := matches + 1; end if;
  end if;

  if a.q3_music is not null and b.q3_music is not null then
    total := total + 1;
    if a.q3_music = b.q3_music then matches := matches + 1; end if;
  end if;

  if a.q4_company is not null and b.q4_company is not null then
    total := total + 1;
    if a.q4_company = b.q4_company then matches := matches + 1; end if;
  end if;

  if a.q5_time is not null and b.q5_time is not null then
    total := total + 1;
    if a.q5_time = b.q5_time then matches := matches + 1; end if;
  end if;

  if total = 0 then return 0; end if;
  return floor(matches::float / total * 100)::int;
end;
$$;

grant execute on function calc_quiz_affinity(uuid, uuid) to authenticated, service_role;
