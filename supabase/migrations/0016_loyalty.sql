-- Sprint 2: programas de fidelidade do estabelecimento

-- 1. Programa configurado por estab (X check-ins = brinde Y)
create table if not exists public.loyalty_programs (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  name text not null default 'Cliente fiel',
  description text,
  checkins_required int not null default 5 check (checkins_required > 0),
  reward_label text not null default 'Drink grátis',
  reward_description text,
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (establishment_id, name)
);

create index if not exists loyalty_programs_estab_idx on public.loyalty_programs(establishment_id) where active;

-- 2. Progresso do usuário por programa
create table if not exists public.loyalty_progress (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.loyalty_programs(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  checkins_done int not null default 0,
  last_checkin_at timestamptz,
  created_at timestamptz default now(),
  unique (program_id, profile_id)
);

create index if not exists loyalty_progress_profile_idx on public.loyalty_progress(profile_id);

-- 3. Recompensas resgatadas (histórico)
create table if not exists public.loyalty_rewards (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.loyalty_programs(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  redeemed_at timestamptz default now(),
  redeemed_by_user_id uuid references public.profiles(id) on delete set null, -- estab/atendente que marcou
  notes text
);

create index if not exists loyalty_rewards_profile_idx on public.loyalty_rewards(profile_id, redeemed_at desc);

-- 4. RLS
alter table public.loyalty_programs enable row level security;
alter table public.loyalty_progress enable row level security;
alter table public.loyalty_rewards enable row level security;

drop policy if exists "loyalty_programs_public_select" on public.loyalty_programs;
create policy "loyalty_programs_public_select" on public.loyalty_programs for select
  using (active);

drop policy if exists "loyalty_programs_owner_all" on public.loyalty_programs;
create policy "loyalty_programs_owner_all" on public.loyalty_programs for all
  using (
    exists (
      select 1 from public.establishments e
      where e.id = loyalty_programs.establishment_id
        and (e.owner_id = auth.uid() or e.sales_agent_id = auth.uid() or is_admin())
    )
  );

drop policy if exists "loyalty_progress_owner_select" on public.loyalty_progress;
create policy "loyalty_progress_owner_select" on public.loyalty_progress for select
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from public.loyalty_programs p
      join public.establishments e on e.id = p.establishment_id
      where p.id = loyalty_progress.program_id
        and (e.owner_id = auth.uid() or is_admin())
    )
  );

drop policy if exists "loyalty_rewards_select" on public.loyalty_rewards;
create policy "loyalty_rewards_select" on public.loyalty_rewards for select
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from public.loyalty_programs p
      join public.establishments e on e.id = p.establishment_id
      where p.id = loyalty_rewards.program_id
        and (e.owner_id = auth.uid() or is_admin())
    )
  );

drop policy if exists "loyalty_rewards_owner_insert" on public.loyalty_rewards;
create policy "loyalty_rewards_owner_insert" on public.loyalty_rewards for insert
  with check (
    exists (
      select 1 from public.loyalty_programs p
      join public.establishments e on e.id = p.establishment_id
      where p.id = loyalty_rewards.program_id
        and (e.owner_id = auth.uid() or is_admin())
    )
  );

grant all on public.loyalty_programs, public.loyalty_progress, public.loyalty_rewards
  to anon, authenticated, service_role;

-- 5. Trigger: ao fazer check-in, incrementa progresso de TODOS os programas ativos do estab
create or replace function public.tg_loyalty_inc_on_checkin()
returns trigger language plpgsql security definer
set search_path = public as $$
declare
  prog record;
begin
  -- Pra cada programa ativo do estab, upserta progresso +1
  for prog in
    select id from public.loyalty_programs
    where establishment_id = new.establishment_id and active
  loop
    insert into public.loyalty_progress (program_id, profile_id, checkins_done, last_checkin_at)
    values (prog.id, new.profile_id, 1, now())
    on conflict (program_id, profile_id)
    do update set
      checkins_done = public.loyalty_progress.checkins_done + 1,
      last_checkin_at = now();
  end loop;
  return new;
end;
$$;

drop trigger if exists loyalty_inc_on_checkin on public.checkins;
create trigger loyalty_inc_on_checkin
  after insert on public.checkins
  for each row execute function public.tg_loyalty_inc_on_checkin();

-- 6. Função pra resgatar (zera progresso + insere reward)
create or replace function public.redeem_loyalty(prog_id uuid, target_profile uuid)
returns uuid language plpgsql security definer
set search_path = public as $$
declare
  v_required int;
  v_done int;
  v_reward_id uuid;
  v_can boolean;
begin
  -- Valida que caller é dono do estab ou admin
  select exists (
    select 1 from public.loyalty_programs p
    join public.establishments e on e.id = p.establishment_id
    where p.id = prog_id
      and (e.owner_id = auth.uid() or is_admin())
  ) into v_can;
  if not v_can then raise exception 'Sem permissão'; end if;

  -- Pega required + done
  select checkins_required into v_required from public.loyalty_programs where id = prog_id;
  select checkins_done into v_done from public.loyalty_progress
    where program_id = prog_id and profile_id = target_profile;

  if coalesce(v_done, 0) < coalesce(v_required, 999) then
    raise exception 'Progresso insuficiente';
  end if;

  -- Insere reward
  insert into public.loyalty_rewards (program_id, profile_id, redeemed_by_user_id)
  values (prog_id, target_profile, auth.uid())
  returning id into v_reward_id;

  -- Zera progresso
  update public.loyalty_progress
  set checkins_done = checkins_done - v_required
  where program_id = prog_id and profile_id = target_profile;

  -- Notifica o user
  insert into public.notifications (profile_id, kind, title, body, link)
  values (
    target_profile,
    'courtesy_received',
    'Recompensa liberada 🎁',
    'Sua fidelidade rendeu! Use no próximo check-in.',
    '/app/notificacoes'
  );

  return v_reward_id;
end;
$$;

grant execute on function public.redeem_loyalty(uuid, uuid) to authenticated;
