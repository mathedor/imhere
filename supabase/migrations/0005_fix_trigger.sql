-- ============================================================
-- Corrige o trigger handle_new_user
-- Problema: rodando como SECURITY DEFINER sem search_path explícito,
-- o tipo enum `user_role` (definido em public) não é encontrado
-- quando o trigger executa no contexto do schema auth.
-- Solução: search_path explícito + exception handler que não trava
-- a criação do auth.users mesmo se houver problema.
-- ============================================================

drop trigger if exists trg_on_auth_user_created on auth.users;

create or replace function public.tg_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_role public.user_role;
begin
  -- Resolve o role com fallback seguro
  begin
    v_role := coalesce(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'user'::public.user_role
    );
  exception when others then
    v_role := 'user'::public.user_role;
  end;

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

  return new;
exception when others then
  -- Loga warning mas NÃO bloqueia a criação do auth.users
  raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
  return new;
end;
$$;

grant execute on function public.tg_handle_new_user() to postgres, anon, authenticated, service_role;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_new_user();
