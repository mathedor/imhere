-- ============================================================
-- 0009 · profile_views (quem visitou meu perfil — feature premium)
-- ============================================================

create table if not exists public.profile_views (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,  -- quem foi visitado
  viewer_id uuid not null references public.profiles(id) on delete cascade,   -- quem visitou
  viewed_at timestamptz not null default now(),
  check (profile_id <> viewer_id)
);

-- Indexes para queries rápidas (controle de "1 view/dia" feito na RPC,
-- evitando index expression com date_trunc que nao eh IMMUTABLE)
create index if not exists idx_profile_views_profile_recent
  on public.profile_views (profile_id, viewed_at desc);

create index if not exists idx_profile_views_viewer_target
  on public.profile_views (viewer_id, profile_id, viewed_at desc);

alter table public.profile_views enable row level security;

-- O DONO do perfil ve quem visitou ele (premium gated no app)
create policy "profile_views_owner_select" on public.profile_views for select
  using (profile_id = auth.uid());

-- Admin ve tudo
create policy "profile_views_admin_select" on public.profile_views for select
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- INSERT: usuario marca que visitou alguem
create policy "profile_views_self_insert" on public.profile_views for insert
  with check (viewer_id = auth.uid());

grant all on public.profile_views to anon, authenticated, service_role;

-- RPC para registrar uma view (1 por dia entre o mesmo par)
-- Controle feito via EXISTS antes do INSERT (em vez de unique index)
create or replace function public.record_profile_view(target_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  start_of_day timestamptz := date_trunc('day', now());
  already_today boolean;
begin
  if target_id = auth.uid() then return; end if;

  -- Ja visitou hoje?
  select exists(
    select 1 from public.profile_views
    where profile_id = target_id
      and viewer_id = auth.uid()
      and viewed_at >= start_of_day
  ) into already_today;

  if already_today then return; end if;

  insert into public.profile_views(profile_id, viewer_id)
    values (target_id, auth.uid());

  -- Notifica visitado (1x/dia)
  insert into public.notifications(profile_id, kind, title, body, link)
    select target_id, 'profile_view', 'Alguém visitou seu perfil 👀',
      'Veja quem está olhando você (Premium)', '/app/visitas'
    where not exists (
      select 1 from public.notifications
      where profile_id = target_id and kind = 'profile_view'
        and created_at >= start_of_day
    );
end;
$$;

grant execute on function public.record_profile_view(uuid) to authenticated, service_role;

-- RPC: lista quem visitou meu perfil (premium gated)
create or replace function public.my_profile_views(days_back int default 30)
returns table (
  viewer_id uuid,
  viewer_name text,
  viewer_photo text,
  viewer_profession text,
  visits_count bigint,
  last_view timestamptz
)
language sql stable security definer set search_path = public
as $$
  select
    p.id,
    p.name,
    p.photo_url,
    p.profession,
    count(pv.id) as visits_count,
    max(pv.viewed_at) as last_view
  from public.profile_views pv
  join public.profiles p on p.id = pv.viewer_id
  where pv.profile_id = auth.uid()
    and pv.viewed_at >= now() - (days_back || ' days')::interval
    and p.status <> 'invisible'
  group by p.id, p.name, p.photo_url, p.profession
  order by last_view desc
  limit 100;
$$;

grant execute on function public.my_profile_views(int) to authenticated, service_role;
