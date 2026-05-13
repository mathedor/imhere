-- ============================================================
-- 0020_fix_notify_message_trigger.sql
-- Conserta tg_notify_message: unnest() em WHERE não é permitido
-- em Postgres novo. Substitui por lateral join.
-- ============================================================

create or replace function public.tg_notify_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  other_id uuid;
  sender_name text;
begin
  -- Pega o outro participante usando lateral join
  select p into other_id
  from public.conversations c,
       lateral unnest(c.participants) as p
  where c.id = new.conversation_id
    and p <> new.sender_id
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
