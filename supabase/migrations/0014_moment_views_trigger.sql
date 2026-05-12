-- Auto-increment moments.views_count quando alguem visualiza pela primeira vez

create or replace function public.tg_moment_view_inc()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  update public.moments
  set views_count = coalesce(views_count, 0) + 1
  where id = new.moment_id;
  return new;
end;
$$;

drop trigger if exists moment_view_inc_trigger on public.moment_views;
create trigger moment_view_inc_trigger
  after insert on public.moment_views
  for each row execute function public.tg_moment_view_inc();

-- Garante que moment_views tem RLS razoavel
alter table public.moment_views enable row level security;

drop policy if exists "moment_views_insert_self" on public.moment_views;
create policy "moment_views_insert_self" on public.moment_views for insert
  with check (profile_id = auth.uid());

drop policy if exists "moment_views_select_owner_or_admin" on public.moment_views;
create policy "moment_views_select_owner_or_admin" on public.moment_views for select
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from public.moments m
      join public.establishments e on e.id = m.establishment_id
      where m.id = moment_views.moment_id
        and (e.owner_id = auth.uid() or e.sales_agent_id = auth.uid() or is_admin())
    )
  );

grant all on public.moment_views to anon, authenticated, service_role;
