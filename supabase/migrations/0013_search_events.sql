-- Tracking de buscas feitas no app (pra relatorios admin)

create table if not exists public.search_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  query text,
  filters jsonb default '{}'::jsonb,
  result_count int default 0,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

create index if not exists search_events_created_idx on public.search_events(created_at desc);
create index if not exists search_events_profile_idx on public.search_events(profile_id);

alter table public.search_events enable row level security;

-- Usuário insere sua própria busca; admin pode ler tudo
create policy "search_events_insert_self" on public.search_events for insert
  with check (profile_id = auth.uid() or profile_id is null);

create policy "search_events_admin_select" on public.search_events for select
  using (is_admin());

grant all on public.search_events to anon, authenticated, service_role;
