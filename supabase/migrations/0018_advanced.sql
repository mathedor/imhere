-- Sprint 4: NPS, boosts, plano casal, alertas

-- ============================================================
-- 1. NPS pós-conversa (pesquisa de satisfação)
-- ============================================================

create table if not exists public.nps_responses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  score smallint not null check (score >= 0 and score <= 10),
  feedback text,
  context text default 'post_chat', -- post_chat | post_checkin | manual
  created_at timestamptz default now()
);

create index if not exists nps_score_idx on public.nps_responses(score, created_at desc);
create index if not exists nps_profile_idx on public.nps_responses(profile_id);

alter table public.nps_responses enable row level security;

drop policy if exists "nps_select_self_or_admin" on public.nps_responses;
create policy "nps_select_self_or_admin" on public.nps_responses for select
  using (profile_id = auth.uid() or is_admin());

drop policy if exists "nps_insert_self" on public.nps_responses;
create policy "nps_insert_self" on public.nps_responses for insert
  with check (profile_id = auth.uid());

grant all on public.nps_responses to anon, authenticated, service_role;

-- ============================================================
-- 2. Boosts pagos do estabelecimento (afetam ranking nearby)
-- ============================================================

create table if not exists public.establishment_boosts (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  paid_credits int not null default 50,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  reason text, -- 'show', 'happy_hour', etc
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists est_boosts_active_idx on public.establishment_boosts(establishment_id, ends_at desc);

alter table public.establishment_boosts enable row level security;

drop policy if exists "boosts_select_public" on public.establishment_boosts;
create policy "boosts_select_public" on public.establishment_boosts for select using (true);

drop policy if exists "boosts_owner_insert" on public.establishment_boosts;
create policy "boosts_owner_insert" on public.establishment_boosts for insert
  with check (exists (
    select 1 from public.establishments e
    where e.id = establishment_boosts.establishment_id
      and (e.owner_id = auth.uid() or is_admin())
  ));

grant all on public.establishment_boosts to anon, authenticated, service_role;

-- ============================================================
-- 3. Plano casal: subscription pode ter um partner
-- ============================================================

alter table public.subscriptions
  add column if not exists partner_profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists is_couple_plan boolean not null default false;

create index if not exists subs_partner_idx on public.subscriptions(partner_profile_id);

-- Convite de plano casal (pra aceitar antes de virar partner)
create table if not exists public.couple_invitations (
  id uuid primary key default gen_random_uuid(),
  primary_profile_id uuid not null references public.profiles(id) on delete cascade,
  invitee_email text not null,
  invitee_profile_id uuid references public.profiles(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete cascade,
  status text not null default 'pending', -- pending | accepted | declined | expired
  token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  created_at timestamptz default now(),
  responded_at timestamptz
);

create index if not exists couple_inv_invitee_idx on public.couple_invitations(invitee_email);

alter table public.couple_invitations enable row level security;

drop policy if exists "couple_inv_select_parties" on public.couple_invitations;
create policy "couple_inv_select_parties" on public.couple_invitations for select
  using (primary_profile_id = auth.uid() or invitee_profile_id = auth.uid() or is_admin());

drop policy if exists "couple_inv_insert_self" on public.couple_invitations;
create policy "couple_inv_insert_self" on public.couple_invitations for insert
  with check (primary_profile_id = auth.uid());

drop policy if exists "couple_inv_update_parties" on public.couple_invitations;
create policy "couple_inv_update_parties" on public.couple_invitations for update
  using (invitee_profile_id = auth.uid() or primary_profile_id = auth.uid() or is_admin());

grant all on public.couple_invitations to anon, authenticated, service_role;

-- ============================================================
-- 4. Alertas de anomalia (admin)
-- ============================================================

create table if not exists public.admin_alerts (
  id uuid primary key default gen_random_uuid(),
  kind text not null, -- 'checkin_drop' | 'report_spike' | 'churn_spike' | 'fraud_suspicious'
  severity text not null default 'medium', -- low | medium | high | critical
  entity_kind text, -- 'establishment' | 'user' | 'global'
  entity_id uuid,
  title text not null,
  body text,
  resolved boolean not null default false,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists admin_alerts_idx on public.admin_alerts(resolved, severity, created_at desc);

alter table public.admin_alerts enable row level security;

drop policy if exists "admin_alerts_admin_only" on public.admin_alerts;
create policy "admin_alerts_admin_only" on public.admin_alerts for all using (is_admin());

grant all on public.admin_alerts to anon, authenticated, service_role;

-- ============================================================
-- 5. Trigger: spike de denúncias gera alerta
-- ============================================================
create or replace function public.tg_check_report_spike()
returns trigger language plpgsql security definer
set search_path = public as $$
declare
  recent_count int;
begin
  select count(*) into recent_count
  from public.moderation_reports
  where created_at >= now() - interval '1 hour';

  if recent_count >= 5 then
    insert into public.admin_alerts (kind, severity, entity_kind, title, body)
    values (
      'report_spike',
      case when recent_count >= 20 then 'critical' when recent_count >= 10 then 'high' else 'medium' end,
      'global',
      'Pico de denúncias na última hora',
      recent_count || ' denúncias recebidas · revise a fila de moderação'
    )
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists check_report_spike on public.moderation_reports;
create trigger check_report_spike
  after insert on public.moderation_reports
  for each row execute function public.tg_check_report_spike();
