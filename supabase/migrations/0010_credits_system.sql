-- ============================================================
-- 0010 · Sistema de créditos (moeda interna)
-- Usado pra funcionalidades premium "pay-as-you-go" (foto chat,
-- ver perfil 360, etc) sem precisar de plano mensal.
-- ============================================================

-- Catálogo de features pagas
create table if not exists public.feature_pricing (
  code text primary key,
  label text not null,
  description text,
  scope text not null check (scope in ('chat', 'establishment', 'profile', 'discovery')),
  cost_credits int not null check (cost_credits >= 0),
  unlocked_for_plans text[] not null default '{}',
  active boolean default true,
  created_at timestamptz not null default now()
);

insert into public.feature_pricing (code, label, description, scope, cost_credits, unlocked_for_plans) values
  ('chat:send_photo', 'Enviar foto no chat', 'Compartilhe imagens em conversas', 'chat', 10, array['premium','vip']),
  ('chat:send_audio', 'Enviar áudio no chat', 'Mande mensagens de voz', 'chat', 15, array['premium','vip']),
  ('chat:send_video', 'Enviar vídeo no chat', 'Vídeos curtos (até 30s)', 'chat', 25, array['vip']),
  ('chat:start_unlimited', 'Iniciar nova conversa (extra)', 'Free: 0/dia, Básico: 3/dia. Use créditos pra mais.', 'chat', 5, array['premium','vip']),
  ('profile:view_360', 'Ver perfil 360 completo', 'Bio, galeria, Instagram, dados completos', 'profile', 5, array['basic','premium','vip']),
  ('profile:see_visitors', 'Ver quem visitou seu perfil', 'Acesso por 24h ao histórico de visitantes', 'profile', 30, array['premium','vip']),
  ('discovery:advanced_filters', 'Filtros avançados (24h)', 'Gênero, idade e disponibilidade', 'discovery', 20, array['vip']),
  ('discovery:boost', 'Boost de visibilidade (1h)', 'Apareça no topo da lista', 'discovery', 50, array['vip']),
  ('establishment:premium_query', 'Reservar mesa premium', 'Convite VIP automático', 'establishment', 40, array['vip']),
  ('establishment:invisible_mode', 'Modo invisível (1h)', 'Ver presentes sem ser visto', 'discovery', 15, array['premium','vip'])
on conflict (code) do nothing;

-- Saldo de créditos por user
create table if not exists public.credit_balances (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  balance int not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

-- Histórico de transações
create type credit_tx_kind as enum ('purchase', 'spend', 'bonus', 'refund', 'expire');

create table if not exists public.credit_transactions (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind credit_tx_kind not null,
  amount int not null, -- positivo pra purchase/bonus, negativo pra spend
  feature_code text references public.feature_pricing(code),
  payment_id uuid references public.payments(id) on delete set null,
  description text,
  balance_after int,
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_tx_profile on public.credit_transactions(profile_id, created_at desc);

alter table public.feature_pricing enable row level security;
alter table public.credit_balances enable row level security;
alter table public.credit_transactions enable row level security;

create policy "feature_pricing_select_all" on public.feature_pricing for select using (active);

create policy "credit_balance_owner_select" on public.credit_balances for select
  using (profile_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'admin');

create policy "credit_tx_owner_select" on public.credit_transactions for select
  using (profile_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'admin');

grant all on public.feature_pricing, public.credit_balances, public.credit_transactions
  to anon, authenticated, service_role;

-- RPC: gasta crédito de uma feature (verifica saldo, deduz, registra)
create or replace function public.spend_credits(feature_code text)
returns table (success boolean, new_balance int, message text)
language plpgsql security definer set search_path = public
as $$
declare
  cost int;
  current_balance int;
  feature_label text;
begin
  -- Pega custo
  select cost_credits, label into cost, feature_label
  from public.feature_pricing where code = feature_code and active = true;

  if cost is null then
    return query select false, 0, 'Feature não encontrada'::text;
    return;
  end if;

  -- Inicializa saldo se não existe
  insert into public.credit_balances (profile_id, balance)
    values (auth.uid(), 0)
    on conflict (profile_id) do nothing;

  -- Lock + check
  select balance into current_balance
    from public.credit_balances
    where profile_id = auth.uid()
    for update;

  if current_balance < cost then
    return query select false, current_balance, format('Créditos insuficientes: precisa de %s, tem %s', cost, current_balance)::text;
    return;
  end if;

  -- Deduz
  update public.credit_balances
    set balance = balance - cost, updated_at = now()
    where profile_id = auth.uid();

  -- Registra
  insert into public.credit_transactions(profile_id, kind, amount, feature_code, description, balance_after)
    values (auth.uid(), 'spend', -cost, feature_code, feature_label, current_balance - cost);

  return query select true, current_balance - cost, format('Usou %s créditos em %s', cost, feature_label)::text;
end;
$$;

grant execute on function public.spend_credits(text) to authenticated, service_role;

-- RPC: adiciona créditos (chamada após pagamento confirmado)
create or replace function public.add_credits(target_profile uuid, amount int, kind credit_tx_kind, description text default null)
returns int -- novo saldo
language plpgsql security definer set search_path = public
as $$
declare
  new_bal int;
begin
  insert into public.credit_balances (profile_id, balance)
    values (target_profile, amount)
    on conflict (profile_id)
    do update set balance = credit_balances.balance + amount, updated_at = now()
    returning balance into new_bal;

  insert into public.credit_transactions(profile_id, kind, amount, description, balance_after)
    values (target_profile, kind, amount, description, new_bal);

  -- Notifica
  insert into public.notifications(profile_id, kind, title, body, link)
    values (target_profile, 'credits_received', 'Créditos adicionados ✨',
      coalesce(description, format('+%s créditos no seu saldo', amount)),
      '/app/creditos');

  return new_bal;
end;
$$;

grant execute on function public.add_credits(uuid, int, credit_tx_kind, text) to service_role;

-- Pacotes de créditos pra comprar (admin gerencia)
create table if not exists public.credit_packs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  credits int not null,
  price_cents int not null,
  bonus int default 0,
  highlight boolean default false,
  active boolean default true,
  sort_order int default 0
);

insert into public.credit_packs (name, credits, price_cents, bonus, highlight, sort_order) values
  ('Pacote Starter', 50, 990, 0, false, 0),
  ('Pacote Popular', 150, 2490, 25, true, 1),
  ('Pacote Plus', 400, 5990, 100, false, 2),
  ('Pacote Mega', 1000, 12990, 300, false, 3)
on conflict do nothing;

alter table public.credit_packs enable row level security;
create policy "credit_packs_select" on public.credit_packs for select using (active);
grant all on public.credit_packs to anon, authenticated, service_role;
