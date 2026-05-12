-- ============================================================
-- Row Level Security · I'm Here
-- ============================================================

-- helper: papel do usuário corrente
create or replace function current_user_role() returns user_role
  language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_admin() returns boolean
  language sql stable as $$
  select current_user_role() = 'admin'
$$;

-- helper: user atual está com checkin ativo em qual estab
create or replace function current_active_checkin_estab() returns uuid
  language sql stable security definer set search_path = public as $$
  select establishment_id from checkins
   where profile_id = auth.uid() and status = 'active'
   limit 1
$$;

-- ============================================================
-- profiles
-- ============================================================
alter table profiles enable row level security;

create policy "profiles_select_visible"
  on profiles for select using (
    status <> 'invisible'
    or id = auth.uid()
    or is_admin()
  );

create policy "profiles_update_self"
  on profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles_admin_all"
  on profiles for all using (is_admin()) with check (is_admin());

-- ============================================================
-- user_photos
-- ============================================================
alter table user_photos enable row level security;

create policy "user_photos_select_all" on user_photos for select using (true);
create policy "user_photos_owner_write" on user_photos for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- ============================================================
-- establishments
-- ============================================================
alter table establishments enable row level security;

create policy "establishments_select_all" on establishments for select using (true);
create policy "establishments_owner_update" on establishments for update
  using (owner_id = auth.uid() or sales_agent_id = auth.uid() or is_admin());
create policy "establishments_sales_or_admin_insert" on establishments for insert
  with check (current_user_role() in ('sales','admin'));
create policy "establishments_admin_delete" on establishments for delete using (is_admin());

-- ============================================================
-- establishment_photos
-- ============================================================
alter table establishment_photos enable row level security;
create policy "estab_photos_select_all" on establishment_photos for select using (true);
create policy "estab_photos_owner_write" on establishment_photos for all
  using (exists(select 1 from establishments e where e.id = establishment_id
    and (e.owner_id = auth.uid() or e.sales_agent_id = auth.uid() or is_admin())));

-- ============================================================
-- checkins
-- ============================================================
alter table checkins enable row level security;

-- Qualquer um vê checkins (necessário para mostrar presentes em estabelecimentos)
create policy "checkins_select_all" on checkins for select using (true);

create policy "checkins_self_insert" on checkins for insert
  with check (profile_id = auth.uid());

create policy "checkins_self_update" on checkins for update
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ============================================================
-- moments
-- ============================================================
alter table moments enable row level security;
create policy "moments_select_all" on moments for select using (expires_at > now());
create policy "moments_estab_write" on moments for all
  using (exists(select 1 from establishments e where e.id = establishment_id
    and (e.owner_id = auth.uid() or e.sales_agent_id = auth.uid() or is_admin())))
  with check (exists(select 1 from establishments e where e.id = establishment_id
    and (e.owner_id = auth.uid() or e.sales_agent_id = auth.uid() or is_admin())));

alter table moment_views enable row level security;
create policy "moment_views_self" on moment_views for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ============================================================
-- contact_requests
-- ============================================================
alter table contact_requests enable row level security;

create policy "contact_requests_visible_to_parties"
  on contact_requests for select
  using (from_profile_id = auth.uid() or to_profile_id = auth.uid() or is_admin());

create policy "contact_requests_create"
  on contact_requests for insert
  with check (
    from_profile_id = auth.uid()
    and exists(
      select 1 from checkins c
      where c.profile_id = auth.uid()
        and c.establishment_id = contact_requests.establishment_id
        and c.status = 'active'
    )
    and exists(
      select 1 from checkins c
      where c.profile_id = contact_requests.to_profile_id
        and c.establishment_id = contact_requests.establishment_id
        and c.status = 'active'
    )
  );

create policy "contact_requests_respond"
  on contact_requests for update
  using (to_profile_id = auth.uid())
  with check (to_profile_id = auth.uid());

-- ============================================================
-- conversations + messages
-- ============================================================
alter table conversations enable row level security;

create policy "conversations_participant_select"
  on conversations for select using (auth.uid() = any(participants) or is_admin());

create policy "conversations_create_with_accepted_request"
  on conversations for insert
  with check (
    auth.uid() = any(participants)
    and exists(
      select 1 from contact_requests cr
      where cr.id = contact_request_id
        and cr.status = 'accepted'
        and auth.uid() in (cr.from_profile_id, cr.to_profile_id)
    )
  );

alter table messages enable row level security;

create policy "messages_select_participant"
  on messages for select
  using (exists(
    select 1 from conversations c
    where c.id = conversation_id and auth.uid() = any(c.participants)
  ));

create policy "messages_insert_participant"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and exists(
      select 1 from conversations c
      where c.id = conversation_id and auth.uid() = any(c.participants)
    )
  );

-- ============================================================
-- plans (público leitura)
-- ============================================================
alter table plans enable row level security;
create policy "plans_select_all" on plans for select using (active);
create policy "plans_admin_write" on plans for all using (is_admin()) with check (is_admin());

-- ============================================================
-- subscriptions
-- ============================================================
alter table subscriptions enable row level security;
create policy "subs_self_or_admin" on subscriptions for all
  using (profile_id = auth.uid() or
         exists(select 1 from establishments e where e.id = establishment_id and e.owner_id = auth.uid())
         or is_admin());

-- ============================================================
-- payments
-- ============================================================
alter table payments enable row level security;
create policy "payments_self_or_admin" on payments for all
  using (profile_id = auth.uid() or
         exists(select 1 from establishments e where e.id = establishment_id and e.owner_id = auth.uid())
         or is_admin());

-- ============================================================
-- courtesies
-- ============================================================
alter table courtesies enable row level security;
create policy "courtesies_select_recipient_or_estab"
  on courtesies for select
  using (to_profile_id = auth.uid()
         or exists(select 1 from establishments e where e.id = establishment_id and e.owner_id = auth.uid())
         or is_admin());
create policy "courtesies_estab_send"
  on courtesies for insert
  with check (exists(select 1 from establishments e where e.id = establishment_id
    and (e.owner_id = auth.uid() or e.sales_agent_id = auth.uid() or is_admin())));
create policy "courtesies_recipient_redeem"
  on courtesies for update
  using (to_profile_id = auth.uid()) with check (to_profile_id = auth.uid());

-- ============================================================
-- moderation_logs
-- ============================================================
alter table moderation_logs enable row level security;
create policy "moderation_admin_select" on moderation_logs for select using (is_admin());
create policy "moderation_self_insert" on moderation_logs for insert
  with check (profile_id = auth.uid());

-- ============================================================
-- notifications
-- ============================================================
alter table notifications enable row level security;
create policy "notif_self" on notifications for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ============================================================
-- push_tokens
-- ============================================================
alter table push_tokens enable row level security;
create policy "push_tokens_self" on push_tokens for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
