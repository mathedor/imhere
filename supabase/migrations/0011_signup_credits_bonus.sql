-- ============================================================
-- 0011 · Bonus de boas-vindas: 250 créditos ao cadastrar
-- Atualiza tg_handle_new_user pra também criar credit_balance + transação
-- ============================================================

create or replace function public.tg_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_role public.user_role;
  bonus_credits int := 250;
begin
  begin
    v_role := coalesce(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'user'::public.user_role
    );
  exception when others then
    v_role := 'user'::public.user_role;
  end;

  -- 1. Cria profile
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, 'user'), '@', 1)
    ),
    v_role
  )
  on conflict (id) do nothing;

  -- 2. Bônus de boas-vindas (somente pra users normais, não estab/sales/admin)
  if v_role = 'user' then
    -- Saldo inicial
    insert into public.credit_balances (profile_id, balance)
      values (new.id, bonus_credits)
      on conflict (profile_id) do nothing;

    -- Transação
    insert into public.credit_transactions(profile_id, kind, amount, description, balance_after)
      values (new.id, 'bonus', bonus_credits, '🎁 Bônus de boas-vindas', bonus_credits);

    -- Notificação
    insert into public.notifications(profile_id, kind, title, body, link)
      values (
        new.id,
        'credits_received',
        '🎁 Bem-vindo ao I''m Here!',
        format('Você ganhou %s créditos pra explorar a plataforma. Use em foto/áudio no chat, ver perfis premium e mais.', bonus_credits),
        '/app/creditos'
      );
  end if;

  return new;
exception when others then
  raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
  return new;
end;
$$;

grant execute on function public.tg_handle_new_user() to postgres, anon, authenticated, service_role;

-- Reaplica o trigger (mesmo se já existir)
drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_new_user();

-- Backfill: dá 250 créditos a TODOS os users existentes que ainda não têm saldo
do $$
declare
  u record;
begin
  for u in
    select p.id from public.profiles p
    where p.role = 'user'
      and not exists (select 1 from public.credit_balances cb where cb.profile_id = p.id)
  loop
    insert into public.credit_balances(profile_id, balance) values (u.id, 250);
    insert into public.credit_transactions(profile_id, kind, amount, description, balance_after)
      values (u.id, 'bonus', 250, '🎁 Bônus retroativo de boas-vindas', 250);
  end loop;
end $$;
