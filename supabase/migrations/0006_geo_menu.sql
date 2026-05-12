-- ============================================================
-- 0006 · RPC para setar geo + tabela menu_items
-- ============================================================

-- RPC: atualiza geo de estabelecimento via lat/lng
create or replace function public.set_establishment_geo(
  estab_id uuid,
  lat double precision,
  lng double precision
) returns void
language sql
security definer
set search_path = public, extensions
as $$
  update public.establishments
  set geo = st_setsrid(st_makepoint(lng, lat), 4326)::geography
  where id = estab_id;
$$;

grant execute on function public.set_establishment_geo(uuid, double precision, double precision)
  to anon, authenticated, service_role;

-- Cardápio
create table if not exists public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  category text not null,
  name text not null,
  description text,
  price_cents int,
  image_url text,
  position smallint default 0,
  available boolean default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_menu_items_estab on public.menu_items(establishment_id, position);

alter table public.menu_items enable row level security;

create policy "menu_items_select_all" on public.menu_items for select using (true);

create policy "menu_items_owner_write" on public.menu_items for all
  using (exists(select 1 from public.establishments e where e.id = establishment_id
    and (e.owner_id = auth.uid() or e.sales_agent_id = auth.uid()
         or (select role from public.profiles where id = auth.uid()) = 'admin')))
  with check (exists(select 1 from public.establishments e where e.id = establishment_id
    and (e.owner_id = auth.uid() or e.sales_agent_id = auth.uid()
         or (select role from public.profiles where id = auth.uid()) = 'admin')));

grant all on public.menu_items to anon, authenticated, service_role;
