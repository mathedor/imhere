-- Pipeline de leads para o time comercial
-- Cada lead pertence a 1 comercial (owner) e passa por stages

create type if not exists lead_stage as enum ('new', 'meeting', 'proposal', 'closed_won', 'closed_lost');

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  city text,
  state text,
  expected_mrr_cents integer default 0,
  stage lead_stage not null default 'new',
  probability_pct integer default 20 check (probability_pct >= 0 and probability_pct <= 100),
  notes text,
  next_action_at timestamptz,
  established_id uuid references public.establishments(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists leads_owner_idx on public.leads(owner_id);
create index if not exists leads_stage_idx on public.leads(stage);

alter table public.leads enable row level security;

-- Comercial vê só os seus, admin vê tudo
create policy "leads_select_owner_or_admin" on public.leads for select
  using (owner_id = auth.uid() or is_admin());

create policy "leads_insert_self_or_admin" on public.leads for insert
  with check ((owner_id = auth.uid() and current_user_role() in ('sales','admin')) or is_admin());

create policy "leads_update_owner_or_admin" on public.leads for update
  using (owner_id = auth.uid() or is_admin());

create policy "leads_delete_owner_or_admin" on public.leads for delete
  using (owner_id = auth.uid() or is_admin());

grant all on public.leads to anon, authenticated, service_role;

-- Trigger pra atualizar updated_at
create or replace function public.tg_leads_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.tg_leads_set_updated_at();
