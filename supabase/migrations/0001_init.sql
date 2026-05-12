-- ============================================================
-- I'm Here · Initial schema
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "postgis";
create extension if not exists "pg_trgm";

-- ============================================================
-- Enums
-- ============================================================

create type user_role as enum ('user', 'establishment', 'sales', 'admin');
create type user_status as enum ('open', 'watching', 'invisible');
create type user_gender as enum ('male', 'female', 'other', 'na');
create type establishment_type as enum ('bar', 'restaurant', 'club', 'show', 'lounge');
create type checkin_status as enum ('active', 'left', 'expired');
create type message_type as enum ('text', 'image', 'audio', 'link', 'system');
create type message_status as enum ('sent', 'delivered', 'read', 'blocked');
create type contact_request_status as enum ('pending', 'accepted', 'rejected', 'expired');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'unpaid');
create type subscription_target as enum ('user', 'establishment');
create type payment_method as enum ('pix', 'credit_card', 'debit_card', 'boleto');
create type courtesy_status as enum ('sent', 'delivered', 'redeemed', 'expired');

-- ============================================================
-- profiles (1-1 com auth.users)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'user',
  name text not null,
  email text not null unique,
  phone text,
  whatsapp text,
  instagram text,
  birth_date date,
  gender user_gender,
  profession text,
  bio text,
  photo_url text,
  status user_status not null default 'open',
  city text,
  state text,
  current_plan_id uuid,
  verified_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_role on profiles(role);
create index idx_profiles_status on profiles(status) where status <> 'invisible';
create index idx_profiles_name_trgm on profiles using gin (name gin_trgm_ops);

-- ============================================================
-- user_photos (galeria)
-- ============================================================

create table user_photos (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  url text not null,
  position smallint not null default 0,
  created_at timestamptz not null default now()
);

create index idx_user_photos_profile on user_photos(profile_id);

-- ============================================================
-- establishments
-- ============================================================

create table establishments (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references profiles(id) on delete set null,
  sales_agent_id uuid references profiles(id) on delete set null,
  slug text unique,
  name text not null,
  type establishment_type not null default 'bar',
  city text not null,
  state text not null,
  address text not null,
  cep text,
  cnpj text,
  capacity int,
  rating numeric(2,1) default 0,
  review_count int default 0,
  cover_url text,
  whatsapp text,
  instagram text,
  reservation_url text,
  menu_url text,
  about text,
  price_level smallint default 2 check (price_level between 1 and 4),
  open_now boolean not null default true,
  geo geography(point, 4326),
  tags text[] default '{}',
  -- Premium da Casa (features pagas pelo estab e liberadas a quem fizer checkin)
  perks_active text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_establishments_geo on establishments using gist (geo);
create index idx_establishments_type on establishments(type);
create index idx_establishments_city_state on establishments(city, state);
create index idx_establishments_name_trgm on establishments using gin (name gin_trgm_ops);

-- ============================================================
-- establishment_photos (galeria)
-- ============================================================

create table establishment_photos (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  url text not null,
  position smallint not null default 0,
  created_at timestamptz not null default now()
);

create index idx_establishment_photos_estab on establishment_photos(establishment_id);

-- ============================================================
-- checkins
-- ============================================================

create table checkins (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  establishment_id uuid not null references establishments(id) on delete cascade,
  status checkin_status not null default 'active',
  checked_in_at timestamptz not null default now(),
  checked_out_at timestamptz,
  expires_at timestamptz not null default (now() + interval '6 hours')
);

create unique index idx_checkins_unique_active
  on checkins(profile_id) where status = 'active';

create index idx_checkins_active_estab
  on checkins(establishment_id) where status = 'active';

create index idx_checkins_expires on checkins(expires_at) where status = 'active';

-- Auto-expira checkins
create or replace function expire_old_checkins() returns void language sql as $$
  update checkins set status='expired'
  where status='active' and expires_at < now();
$$;

-- ============================================================
-- moments (Stories "No Momento" do estabelecimento)
-- ============================================================

create table moments (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  image_url text not null,
  caption text,
  views_count int not null default 0,
  posted_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '4 hours')
);

create index idx_moments_estab_active on moments(establishment_id, expires_at)
  where expires_at > now();

create table moment_views (
  moment_id uuid not null references moments(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (moment_id, profile_id)
);

-- ============================================================
-- contact_requests (pedido de iniciar conversa)
-- ============================================================

create table contact_requests (
  id uuid primary key default uuid_generate_v4(),
  from_profile_id uuid not null references profiles(id) on delete cascade,
  to_profile_id uuid not null references profiles(id) on delete cascade,
  establishment_id uuid not null references establishments(id) on delete cascade,
  status contact_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (from_profile_id <> to_profile_id)
);

create index idx_contact_requests_to_pending on contact_requests(to_profile_id, status);
create unique index idx_contact_requests_unique_pending
  on contact_requests(from_profile_id, to_profile_id)
  where status = 'pending';

-- ============================================================
-- conversations + messages
-- ============================================================

create table conversations (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references establishments(id) on delete set null,
  contact_request_id uuid references contact_requests(id) on delete set null,
  participants uuid[] not null,
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create index idx_conversations_participants on conversations using gin (participants);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  type message_type not null default 'text',
  body text,
  media_url text,
  audio_duration_sec int,
  link_url text,
  link_title text,
  status message_status not null default 'sent',
  blocked_reason text,
  created_at timestamptz not null default now()
);

create index idx_messages_conv on messages(conversation_id, created_at desc);

-- ============================================================
-- plans + subscriptions
-- ============================================================

create table plans (
  id uuid primary key default uuid_generate_v4(),
  target subscription_target not null,
  code text unique not null,
  name text not null,
  tagline text,
  monthly_price_cents int not null,
  annual_price_cents int not null,
  features jsonb not null default '[]'::jsonb,
  highlight boolean default false,
  active boolean default true,
  sort_order smallint default 0
);

create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  establishment_id uuid references establishments(id) on delete cascade,
  plan_id uuid not null references plans(id),
  status subscription_status not null default 'trialing',
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly','annual')),
  amount_cents int not null,
  method payment_method,
  efi_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  check (profile_id is not null or establishment_id is not null)
);

create index idx_subs_profile on subscriptions(profile_id);
create index idx_subs_estab on subscriptions(establishment_id);
create index idx_subs_status on subscriptions(status);

-- ============================================================
-- payments (cobranças individuais)
-- ============================================================

create table payments (
  id uuid primary key default uuid_generate_v4(),
  subscription_id uuid references subscriptions(id) on delete set null,
  profile_id uuid references profiles(id) on delete set null,
  establishment_id uuid references establishments(id) on delete set null,
  amount_cents int not null,
  method payment_method not null,
  status text not null default 'pending',
  efi_charge_id text unique,
  efi_pix_qr text,
  efi_pix_code text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_payments_status on payments(status);
create index idx_payments_subscription on payments(subscription_id);

-- ============================================================
-- courtesies (mensagens & cortesias do estab pro user)
-- ============================================================

create table courtesies (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  to_profile_id uuid not null references profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  message text,
  status courtesy_status not null default 'sent',
  expires_at timestamptz default (now() + interval '4 hours'),
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_courtesies_user on courtesies(to_profile_id, status);

-- ============================================================
-- moderation_logs
-- ============================================================

create table moderation_logs (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete set null,
  conversation_id uuid references conversations(id) on delete set null,
  type text not null,
  matched text,
  body text,
  created_at timestamptz not null default now()
);

create index idx_moderation_profile on moderation_logs(profile_id, created_at desc);

-- ============================================================
-- notifications (in-app)
-- ============================================================

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notif_user on notifications(profile_id, created_at desc);
create index idx_notif_unread on notifications(profile_id) where read_at is null;

-- ============================================================
-- push_tokens (FCM / OneSignal / APNS)
-- ============================================================

create table push_tokens (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  platform text not null check (platform in ('web','ios','android')),
  token text not null unique,
  enabled boolean default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Helpers / Views
-- ============================================================

create or replace view v_establishments_with_presence as
select
  e.*,
  (select count(*) from checkins c where c.establishment_id = e.id and c.status='active') as present_count,
  exists(select 1 from moments m where m.establishment_id = e.id and m.expires_at > now()) as has_momento
from establishments e;

-- ============================================================
-- Triggers
-- ============================================================

create or replace function tg_set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_profiles_updated before update on profiles
  for each row execute function tg_set_updated_at();

create trigger trg_establishments_updated before update on establishments
  for each row execute function tg_set_updated_at();

-- Cria profile automaticamente quando auth.users é criado
create or replace function tg_handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'user')
  );
  return new;
end $$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function tg_handle_new_user();
