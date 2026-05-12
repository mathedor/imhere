-- ============================================================
-- RPC functions
-- ============================================================

-- Lista estabelecimentos com presença + distância
create or replace function nearby_establishments(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision default 30,
  sort text default 'nearest'
)
returns table (
  id uuid,
  name text,
  type establishment_type,
  city text,
  state text,
  address text,
  cover_url text,
  rating numeric,
  review_count int,
  price_level smallint,
  open_now boolean,
  tags text[],
  instagram text,
  distance_km double precision,
  present_count bigint,
  present_male bigint,
  present_female bigint,
  has_momento boolean
)
language sql stable as $$
  select
    e.id, e.name, e.type, e.city, e.state, e.address, e.cover_url,
    e.rating, e.review_count, e.price_level, e.open_now, e.tags, e.instagram,
    st_distance(e.geo, st_makepoint(user_lng, user_lat)::geography) / 1000.0 as distance_km,
    (select count(*) from checkins c where c.establishment_id = e.id and c.status='active') as present_count,
    (select count(*) from checkins c join profiles p on p.id=c.profile_id
       where c.establishment_id = e.id and c.status='active' and p.gender='male') as present_male,
    (select count(*) from checkins c join profiles p on p.id=c.profile_id
       where c.establishment_id = e.id and c.status='active' and p.gender='female') as present_female,
    exists(select 1 from moments m where m.establishment_id = e.id and m.expires_at > now()) as has_momento
  from establishments e
  where e.geo is null or st_dwithin(e.geo, st_makepoint(user_lng, user_lat)::geography, radius_km*1000)
  order by
    case when sort = 'nearest' then st_distance(e.geo, st_makepoint(user_lng, user_lat)::geography) end asc nulls last,
    case when sort = 'busiest' then (select count(*) from checkins c where c.establishment_id = e.id and c.status='active') end desc,
    case when sort = 'rated' then e.rating end desc;
$$;

-- Faz check-in (encerra anterior se houver)
create or replace function do_checkin(estab_id uuid) returns uuid
language plpgsql security definer as $$
declare
  new_id uuid;
begin
  update checkins set status='left', checked_out_at=now()
    where profile_id = auth.uid() and status='active';
  insert into checkins(profile_id, establishment_id)
    values (auth.uid(), estab_id) returning id into new_id;
  return new_id;
end $$;

-- Encerra checkin atual
create or replace function do_checkout() returns void
language sql security definer as $$
  update checkins set status='left', checked_out_at=now()
    where profile_id = auth.uid() and status='active';
$$;

-- Aceita ou recusa um contact_request, e se aceito cria conversation
create or replace function respond_contact_request(req_id uuid, accept boolean)
returns uuid
language plpgsql security definer as $$
declare
  req record;
  conv_id uuid;
begin
  select * into req from contact_requests where id = req_id and to_profile_id = auth.uid();
  if req is null then raise exception 'Request not found or not yours'; end if;

  if accept then
    update contact_requests set status='accepted', responded_at=now() where id = req_id;
    insert into conversations(establishment_id, contact_request_id, participants)
      values (req.establishment_id, req.id, array[req.from_profile_id, req.to_profile_id])
      returning id into conv_id;
    insert into notifications(profile_id, kind, title, body, link)
      values (req.from_profile_id, 'contact_accepted', 'Contato aceito!',
              'Sua solicitação foi aceita. Inicie a conversa.', '/app/chat/' || conv_id);
    return conv_id;
  else
    update contact_requests set status='rejected', responded_at=now() where id = req_id;
    insert into notifications(profile_id, kind, title, body)
      values (req.from_profile_id, 'contact_rejected', 'Contato recusado',
              'A pessoa não aceitou seu pedido de contato.');
    return null;
  end if;
end $$;

-- Resgata cortesia
create or replace function redeem_courtesy(courtesy_id uuid) returns void
language plpgsql security definer as $$
begin
  update courtesies
    set status='redeemed', redeemed_at=now()
    where id = courtesy_id
      and to_profile_id = auth.uid()
      and status in ('sent','delivered');
end $$;
