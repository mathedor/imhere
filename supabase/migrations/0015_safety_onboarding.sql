-- Sprint 1: safety + onboarding + retencao

-- 1. Flags no profile pra onboarding e código de conduta
alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists code_of_conduct_accepted_at timestamptz;

-- 2. Tabela de denúncias (botão pânico no chat / report de perfil)
create table if not exists public.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  reported_profile_id uuid references public.profiles(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  establishment_id uuid references public.establishments(id) on delete set null,
  category text not null default 'other', -- harassment | spam | fake | offensive | safety | other
  description text,
  status text not null default 'pending', -- pending | reviewed | dismissed | actioned
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists moderation_reports_status_idx on public.moderation_reports(status, created_at desc);
create index if not exists moderation_reports_reported_idx on public.moderation_reports(reported_profile_id);

alter table public.moderation_reports enable row level security;

drop policy if exists "moderation_reports_insert_self" on public.moderation_reports;
create policy "moderation_reports_insert_self" on public.moderation_reports for insert
  with check (reporter_id = auth.uid());

drop policy if exists "moderation_reports_select_admin" on public.moderation_reports;
create policy "moderation_reports_select_admin" on public.moderation_reports for select
  using (is_admin() or reporter_id = auth.uid());

drop policy if exists "moderation_reports_update_admin" on public.moderation_reports;
create policy "moderation_reports_update_admin" on public.moderation_reports for update
  using (is_admin());

grant all on public.moderation_reports to anon, authenticated, service_role;

-- 3. Trigger pra notificar admin de novo report (notification kind=moderation_alert)
create or replace function public.tg_moderation_report_notify()
returns trigger language plpgsql security definer
set search_path = public as $$
declare
  admin_id uuid;
begin
  -- Notifica TODOS os admins
  for admin_id in select id from public.profiles where role = 'admin'
  loop
    insert into public.notifications (profile_id, kind, title, body, link)
    values (
      admin_id,
      'moderation_warning',
      'Nova denúncia',
      'Um usuário enviou uma denúncia · clique pra revisar',
      '/admin/moderacao'
    );
  end loop;
  return new;
end;
$$;

drop trigger if exists moderation_report_notify on public.moderation_reports;
create trigger moderation_report_notify
  after insert on public.moderation_reports
  for each row execute function public.tg_moderation_report_notify();
