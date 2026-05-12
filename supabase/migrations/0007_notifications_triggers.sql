-- ============================================================
-- 0007 · Triggers de notificação automática
-- Tudo que o usuário faz vira uma notification.
-- ============================================================

-- 1. CHECK-IN: ao fazer check-in, notifica o user
create or replace function public.do_checkin(estab_id uuid) returns uuid
language plpgsql security definer set search_path = public, auth, extensions
as $$
declare
  new_id uuid;
  estab_name text;
begin
  -- Encerra checkin ativo anterior
  update public.checkins set status='left', checked_out_at=now()
    where profile_id = auth.uid() and status='active';

  -- Cria novo
  insert into public.checkins(profile_id, establishment_id)
    values (auth.uid(), estab_id) returning id into new_id;

  -- Notifica
  select name into estab_name from public.establishments where id = estab_id;
  insert into public.notifications(profile_id, kind, title, body, link)
    values (
      auth.uid(),
      'checkin_done',
      'Check-in confirmado',
      'Você está em ' || coalesce(estab_name, 'um estabelecimento') || ' 📍',
      '/app/estabelecimento/' || estab_id::text
    );

  return new_id;
end $$;

grant execute on function public.do_checkin(uuid) to authenticated, service_role;

-- 2. MENSAGENS: ao receber, notifica o destinatário
create or replace function public.tg_notify_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  other_id uuid;
  sender_name text;
begin
  -- Pega o outro participante
  select unnest(participants) into other_id
  from public.conversations where id = new.conversation_id
  and unnest(participants) <> new.sender_id
  limit 1;

  if other_id is null then return new; end if;

  select name into sender_name from public.profiles where id = new.sender_id;

  insert into public.notifications(profile_id, kind, title, body, link)
    values (
      other_id,
      'new_message',
      coalesce(sender_name, 'Alguém') || ' enviou uma mensagem',
      case new.type
        when 'text' then substr(coalesce(new.body, ''), 1, 80)
        when 'image' then '📷 Foto enviada'
        when 'audio' then '🎤 Áudio enviado'
        else 'Nova mensagem'
      end,
      '/app/chat/' || new.conversation_id::text
    );
  return new;
end $$;

drop trigger if exists trg_notify_message on public.messages;
create trigger trg_notify_message after insert on public.messages
  for each row when (new.status <> 'blocked') execute function public.tg_notify_message();

-- 3. ASSINATURA CRIADA: notifica o user
create or replace function public.tg_notify_subscription() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  plan_name text;
begin
  if new.profile_id is null then return new; end if;
  select name into plan_name from public.plans where id = new.plan_id;
  insert into public.notifications(profile_id, kind, title, body, link)
    values (
      new.profile_id,
      'subscription_created',
      'Plano ' || coalesce(plan_name, 'ativado') || ' ✨',
      'Sua assinatura foi confirmada. Aproveite os recursos liberados!',
      '/app/planos'
    );
  return new;
end $$;

drop trigger if exists trg_notify_subscription on public.subscriptions;
create trigger trg_notify_subscription after insert on public.subscriptions
  for each row execute function public.tg_notify_subscription();

-- 4. PAGAMENTO PIX PAGO: notifica o user
create or replace function public.tg_notify_payment_paid() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.status <> 'paid' and new.status = 'paid' and new.profile_id is not null then
    insert into public.notifications(profile_id, kind, title, body, link)
      values (
        new.profile_id,
        'payment_confirmed',
        'Pagamento confirmado 💳',
        'R$ ' || to_char(new.amount_cents::numeric / 100, 'FM999,999.00') || ' recebido via ' || new.method,
        '/app/planos'
      );
  end if;
  return new;
end $$;

drop trigger if exists trg_notify_payment on public.payments;
create trigger trg_notify_payment after update of status on public.payments
  for each row execute function public.tg_notify_payment_paid();

-- 5. MODERAÇÃO: ao bloquear mensagem, notifica o usuário (educativo)
create or replace function public.tg_notify_moderation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.profile_id is null then return new; end if;
  insert into public.notifications(profile_id, kind, title, body, link)
    values (
      new.profile_id,
      'moderation_warning',
      'Atenção — sua mensagem foi bloqueada 🛡️',
      'Detectamos um termo inadequado. Continue respeitando a comunidade I''m Here.',
      '/app/chat'
    );
  return new;
end $$;

drop trigger if exists trg_notify_moderation on public.moderation_logs;
create trigger trg_notify_moderation after insert on public.moderation_logs
  for each row when (new.type = 'blocked') execute function public.tg_notify_moderation();

-- 6. CHECK-IN no MEU ESTABELECIMENTO: notifica o owner (estabelecimento)
create or replace function public.tg_notify_checkin_owner() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  owner uuid;
  user_name text;
begin
  if new.status <> 'active' then return new; end if;
  select owner_id into owner from public.establishments where id = new.establishment_id;
  if owner is null or owner = new.profile_id then return new; end if;
  select name into user_name from public.profiles where id = new.profile_id;
  insert into public.notifications(profile_id, kind, title, body, link)
    values (
      owner,
      'guest_checkin',
      'Novo check-in no seu estabelecimento 🎉',
      coalesce(user_name, 'Um usuário') || ' acabou de chegar',
      '/estabelecimento/usuarios/' || new.profile_id::text
    );
  return new;
end $$;

drop trigger if exists trg_notify_checkin_owner on public.checkins;
create trigger trg_notify_checkin_owner after insert on public.checkins
  for each row execute function public.tg_notify_checkin_owner();

-- 7. COURTESY RESGATADA: notifica o estabelecimento
create or replace function public.tg_notify_courtesy_redeemed() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  owner uuid;
  user_name text;
begin
  if old.status = 'redeemed' or new.status <> 'redeemed' then return new; end if;
  select owner_id into owner from public.establishments where id = new.establishment_id;
  if owner is null then return new; end if;
  select name into user_name from public.profiles where id = new.to_profile_id;
  insert into public.notifications(profile_id, kind, title, body, link)
    values (
      owner,
      'courtesy_redeemed',
      coalesce(user_name, 'Cliente') || ' resgatou sua cortesia ✨',
      new.title,
      '/estabelecimento/cortesias'
    );
  return new;
end $$;

drop trigger if exists trg_notify_courtesy_redeemed on public.courtesies;
create trigger trg_notify_courtesy_redeemed after update of status on public.courtesies
  for each row execute function public.tg_notify_courtesy_redeemed();
