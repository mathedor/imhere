-- ============================================================
-- SEED DATA pra demo: 25 users, 15 estabs, 200+ checkins, msgs, loyalty, NPS
-- ROLE TUDO de uma vez no SQL Editor do Supabase
-- IMPORTANTE: Roda apenas em DEV/STAGING. Adiciona ON CONFLICT pra ser idempotente.
-- ============================================================

-- Tabela temporária pra mapear nomes lógicos pros IDs gerados
create temp table if not exists _seed_users (
  slug text primary key,
  user_id uuid,
  email text,
  name text,
  gender text,
  city text,
  birth_date date,
  photo_url text,
  profession text,
  bio text
);

-- 25 perfis variados (litoral SC)
insert into _seed_users (slug, email, name, gender, city, birth_date, photo_url, profession, bio) values
  ('mari',   'mariana.costa@demo.imhere.app',    'Mariana Costa',     'female', 'Itajaí',              '1996-03-12', 'https://i.pravatar.cc/300?img=47', 'Designer',         'Praia, drink autoral e sunset. Vai um?'),
  ('lucas',  'lucas.andrade@demo.imhere.app',    'Lucas Andrade',     'male',   'Balneário Camboriú', '1994-07-22', 'https://i.pravatar.cc/300?img=12', 'Engenheiro',       'Surfista nas horas vagas. Sextou?'),
  ('bia',    'beatriz.lima@demo.imhere.app',     'Beatriz Lima',      'female', 'Florianópolis',       '1998-11-04', 'https://i.pravatar.cc/300?img=23', 'Médica',           'Sol e samba. Caipira na medida.'),
  ('bruno',  'bruno.salles@demo.imhere.app',     'Bruno Salles',      'male',   'Itajaí',              '1992-01-30', 'https://i.pravatar.cc/300?img=33', 'Empreendedor',     'Bar nico ou rooftop?'),
  ('caro',   'carolina.reis@demo.imhere.app',    'Carolina Reis',     'female', 'Bombinhas',           '1997-08-15', 'https://i.pravatar.cc/300?img=49', 'Arquiteta',        'Curto música ao vivo'),
  ('pedro',  'pedro.vasco@demo.imhere.app',      'Pedro Vasco',       'male',   'Balneário Camboriú', '1990-04-08', 'https://i.pravatar.cc/300?img=15', 'DJ',               'Música corre nas veias'),
  ('julia',  'julia.carvalho@demo.imhere.app',   'Júlia Carvalho',    'female', 'Itajaí',              '1995-12-19', 'https://i.pravatar.cc/300?img=44', 'Fotógrafa',        'Procuro modelo pra ensaio na praia'),
  ('andre',  'andre.tavares@demo.imhere.app',    'André Tavares',     'male',   'Florianópolis',       '1989-06-25', 'https://i.pravatar.cc/300?img=58', 'Chef',             'Conhece todos os molhos'),
  ('sofia',  'sofia.nunes@demo.imhere.app',      'Sofia Nunes',       'female', 'Bombinhas',           '1999-02-14', 'https://i.pravatar.cc/300?img=40', 'Estudante',        'Primeiro check-in!'),
  ('tiago',  'tiago.rocha@demo.imhere.app',      'Tiago Rocha',       'male',   'Itajaí',              '1993-09-03', 'https://i.pravatar.cc/300?img=68', 'Programador',      'Code e cerveja artesanal'),
  ('ana',    'ana.beatriz@demo.imhere.app',      'Ana Beatriz',       'female', 'Balneário Camboriú', '1996-05-21', 'https://i.pravatar.cc/300?img=26', 'Publicitária',     'Vibe boa atrai vibe boa'),
  ('rafa',   'rafael.mendes@demo.imhere.app',    'Rafael Mendes',     'male',   'Florianópolis',       '1991-11-11', 'https://i.pravatar.cc/300?img=11', 'Advogado',         'Final de semana é sagrado'),
  ('iza',    'isabela.gomes@demo.imhere.app',    'Isabela Gomes',     'female', 'Itajaí',              '1997-07-08', 'https://i.pravatar.cc/300?img=31', 'Nutricionista',    'Sushi + vinho branco'),
  ('felipe', 'felipe.santos@demo.imhere.app',    'Felipe Santos',     'male',   'Bombinhas',           '1988-03-17', 'https://i.pravatar.cc/300?img=53', 'Veterinário',      'Praia + cachorro'),
  ('luana',  'luana.ferreira@demo.imhere.app',   'Luana Ferreira',    'female', 'Balneário Camboriú', '1994-10-29', 'https://i.pravatar.cc/300?img=45', 'Dentista',         'Bom papo e drink criativo'),
  ('thiago', 'thiago.silva@demo.imhere.app',     'Thiago Silva',      'male',   'Itajaí',              '1996-12-05', 'https://i.pravatar.cc/300?img=14', 'Personal',         'Treino e curto música boa'),
  ('clara',  'clara.batista@demo.imhere.app',    'Clara Batista',     'female', 'Florianópolis',       '1992-08-22', 'https://i.pravatar.cc/300?img=24', 'Psicóloga',        'Curto papo profundo'),
  ('mateus', 'mateus.gomes@demo.imhere.app',     'Mateus Gomes',      'male',   'Itajaí',              '1995-04-14', 'https://i.pravatar.cc/300?img=51', 'Designer',         'Sempre em busca da nova praia'),
  ('rita',   'rita.almeida@demo.imhere.app',     'Rita Almeida',      'female', 'Bombinhas',           '1993-01-09', 'https://i.pravatar.cc/300?img=39', 'Yoga teacher',     'Mar, meditação, presença'),
  ('gabe',   'gabriel.lopes@demo.imhere.app',    'Gabriel Lopes',     'male',   'Balneário Camboriú', '1990-09-27', 'https://i.pravatar.cc/300?img=67', 'Investidor',       'Rooftop + bom drink'),
  ('nat',    'natalia.duarte@demo.imhere.app',   'Natália Duarte',    'female', 'Itajaí',              '1998-06-13', 'https://i.pravatar.cc/300?img=43', 'Bióloga',          'Mergulho e bar de praia'),
  ('caue',   'caue.martins@demo.imhere.app',     'Cauê Martins',      'male',   'Florianópolis',       '1991-02-18', 'https://i.pravatar.cc/300?img=37', 'Músico',           'Faço parte de bandinha local'),
  ('lara',   'lara.oliveira@demo.imhere.app',    'Lara Oliveira',     'female', 'Balneário Camboriú', '1997-11-30', 'https://i.pravatar.cc/300?img=22', 'Influencer',       'Sempre buscando o novo'),
  ('vini',   'vinicius.alves@demo.imhere.app',   'Vinícius Alves',    'male',   'Itajaí',              '1994-05-07', 'https://i.pravatar.cc/300?img=17', 'Marketeiro',       'Brand, café e cerveja'),
  ('helo',   'heloisa.castro@demo.imhere.app',   'Heloísa Castro',    'female', 'Bombinhas',           '1996-10-02', 'https://i.pravatar.cc/300?img=29', 'Atriz',            'Improviso, cinema e mar')
on conflict (slug) do nothing;

-- ============================================================
-- Cria users no auth.users (com senha 'demo123' bcrypt-hashed)
-- ============================================================
do $$
declare
  rec record;
  v_uid uuid;
begin
  for rec in select * from _seed_users where user_id is null
  loop
    -- Verifica se já existe
    select id into v_uid from auth.users where email = rec.email;
    if v_uid is null then
      v_uid := gen_random_uuid();
      insert into auth.users (
        id, instance_id, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, aud, role
      ) values (
        v_uid,
        '00000000-0000-0000-0000-000000000000',
        rec.email,
        crypt('demo123', gen_salt('bf')),
        now() - (random() * interval '60 days'),
        now() - (random() * interval '60 days'),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('name', rec.name, 'role', 'user'),
        'authenticated',
        'authenticated'
      );
    end if;
    update _seed_users set user_id = v_uid where slug = rec.slug;
  end loop;
end$$;

-- ============================================================
-- Atualiza profiles (trigger handle_new_user já criou os básicos)
-- ============================================================
update public.profiles p
set name = u.name,
    gender = u.gender::user_gender,
    city = u.city,
    state = 'SC',
    birth_date = u.birth_date,
    photo_url = u.photo_url,
    profession = u.profession,
    bio = u.bio,
    onboarding_completed_at = now() - (random() * interval '30 days'),
    code_of_conduct_accepted_at = now() - (random() * interval '30 days'),
    is_verified = random() > 0.6
from _seed_users u
where p.id = u.user_id;

-- ============================================================
-- 200+ Check-ins simulados nos últimos 30 dias
-- ============================================================
do $$
declare
  user_rec record;
  estab_rec record;
  i int;
  days_ago int;
  duration_h numeric;
begin
  for user_rec in select user_id from _seed_users where user_id is not null
  loop
    -- Cada user faz 5-12 check-ins aleatórios
    for i in 1..(5 + floor(random() * 8)::int)
    loop
      -- Pega um estab aleatório
      select id into estab_rec from public.establishments order by random() limit 1;
      if estab_rec is null then continue; end if;

      days_ago := floor(random() * 30)::int;
      duration_h := 1.5 + random() * 3;

      insert into public.checkins (profile_id, establishment_id, checked_in_at, left_at, status)
      values (
        user_rec.user_id,
        estab_rec.id,
        now() - (days_ago || ' days')::interval - (random() * interval '4 hours'),
        case when days_ago > 0 then now() - (days_ago || ' days')::interval - (random() * interval '1 hour') + (duration_h * interval '1 hour') else null end,
        case when days_ago > 0 then 'left'::checkin_status else 'active'::checkin_status end
      );
    end loop;
  end loop;
end$$;

-- ============================================================
-- ~30 Contact requests (alguns aceitos, recusados, pendentes)
-- ============================================================
do $$
declare
  from_user uuid;
  to_user uuid;
  est_id uuid;
  i int;
  status_choice text;
begin
  for i in 1..40
  loop
    select user_id into from_user from _seed_users where user_id is not null order by random() limit 1;
    select user_id into to_user from _seed_users where user_id is not null and user_id != from_user order by random() limit 1;
    select establishment_id into est_id from public.checkins where profile_id = from_user limit 1;
    if from_user is null or to_user is null or est_id is null then continue; end if;

    status_choice := case
      when random() < 0.55 then 'accepted'
      when random() < 0.80 then 'rejected'
      else 'pending'
    end;

    insert into public.contact_requests (from_profile_id, to_profile_id, establishment_id, status, created_at, responded_at)
    values (
      from_user, to_user, est_id,
      status_choice::contact_request_status,
      now() - (random() * interval '30 days'),
      case when status_choice != 'pending' then now() - (random() * interval '29 days') else null end
    )
    on conflict do nothing;
  end loop;
end$$;

-- ============================================================
-- Conversas pros contatos aceitos + ~50 mensagens
-- ============================================================
do $$
declare
  req record;
  conv_id uuid;
  msg_count int;
  i int;
  sender uuid;
  sample_msgs text[] := array[
    'Oi! Tudo bem?',
    'Tô aqui há uns 30 min, vibe boa',
    'Conhece esse lugar?',
    'Vai um drink?',
    'Tava lendo seu perfil, curti!',
    'Qual sua música preferida?',
    'Vamos marcar algo no próximo fds?',
    'kkkkkk verdade',
    'Tá no rooftop?',
    'Que coincidência! Eu também trabalho com isso',
    'Tô curtindo demais essa playlist',
    'Te vejo lá perto da bancada',
    'Olha pra cá, oi 👋',
    'Bora dançar?',
    'Esse drink tá incrível'
  ];
begin
  for req in select * from public.contact_requests where status = 'accepted' limit 20
  loop
    -- Cria conversation
    insert into public.conversations (establishment_id, contact_request_id, participants, created_at)
    values (req.establishment_id, req.id, array[req.from_profile_id, req.to_profile_id], req.responded_at)
    on conflict do nothing
    returning id into conv_id;

    if conv_id is null then
      select id into conv_id from public.conversations where contact_request_id = req.id;
    end if;
    if conv_id is null then continue; end if;

    -- 3-8 mensagens
    msg_count := 3 + floor(random() * 6)::int;
    for i in 1..msg_count
    loop
      sender := case when i % 2 = 1 then req.from_profile_id else req.to_profile_id end;
      insert into public.messages (conversation_id, sender_id, type, body, status, created_at)
      values (
        conv_id, sender, 'text',
        sample_msgs[1 + floor(random() * array_length(sample_msgs, 1))::int],
        'delivered',
        coalesce(req.responded_at, now()) + (i * interval '5 minutes') + (random() * interval '10 minutes')
      );
    end loop;
  end loop;
end$$;

-- ============================================================
-- Loyalty progress pros frequentadores
-- ============================================================
-- Programas (se ainda não existem)
insert into public.loyalty_programs (establishment_id, name, checkins_required, reward_label, reward_description)
select id, 'Cliente fiel', 5, 'Drink grátis', 'Escolha qualquer drink da casa no próximo check-in'
from public.establishments
where not exists (
  select 1 from public.loyalty_programs lp where lp.establishment_id = establishments.id
)
limit 10;

-- ============================================================
-- NPS responses
-- ============================================================
insert into public.nps_responses (profile_id, score, feedback, context, created_at)
select
  user_id,
  6 + floor(random() * 5)::int, -- scores 6-10 (positive bias pra demo)
  case when random() < 0.4 then
    (array['App muito útil!', 'Adorei a vibe', 'Indico fácil', 'Ainda tô explorando, mas curti', 'Tá top'])[1 + floor(random() * 5)::int]
  else null end,
  'post_chat',
  now() - (random() * interval '20 days')
from _seed_users
where user_id is not null
  and random() < 0.5;

-- ============================================================
-- Moments (stories) ativos em alguns estabs
-- ============================================================
do $$
declare
  est record;
  captions text[] := array[
    'Sunset chegando 🌅',
    'Música ao vivo a partir das 22h 🎸',
    'Drink novo no menu, vem testar!',
    'Casa cheia hoje 🔥',
    'Happy hour rolando até 21h'
  ];
  imgs text[] := array[
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80'
  ];
begin
  for est in select id from public.establishments order by random() limit 6
  loop
    insert into public.moments (establishment_id, image_url, caption, posted_at, expires_at)
    values (
      est.id,
      imgs[1 + floor(random() * 3)::int],
      captions[1 + floor(random() * 5)::int],
      now() - (random() * interval '2 hours'),
      now() + interval '4 hours' - (random() * interval '2 hours')
    );
  end loop;
end$$;

-- ============================================================
-- Reviews / avaliações
-- ============================================================
do $$
declare
  user_rec record;
  est_rec record;
begin
  for user_rec in select user_id from _seed_users where user_id is not null limit 15
  loop
    for est_rec in select id from public.establishments order by random() limit 1 + floor(random() * 2)::int
    loop
      insert into public.reviews (profile_id, establishment_id, rating, comment, created_at)
      values (
        user_rec.user_id,
        est_rec.id,
        3 + floor(random() * 3)::int,
        (array['Lugar incrível!', 'Boa vibe e bom drink', 'Voltarei sim', 'Atendimento top', 'Música boa'])[1 + floor(random() * 5)::int],
        now() - (random() * interval '60 days')
      )
      on conflict do nothing;
    end loop;
  end loop;
end$$;

-- ============================================================
-- Reset: marca alguns checkins como ativos (online agora)
-- ============================================================
update public.checkins
set status = 'active', left_at = null
where id in (
  select id from public.checkins
  where checked_in_at > now() - interval '6 hours'
  order by random()
  limit 30
);

-- ============================================================
-- Cleanup
-- ============================================================
-- _seed_users é TEMP, some sozinho. Pra rodar de novo sem duplicar
-- users, basta criar de novo (auth.users tem UNIQUE em email)

select
  '✅ Seed completo · login: <slug>@demo.imhere.app · senha: demo123' as resultado,
  count(*) as total_users
from _seed_users where user_id is not null;
