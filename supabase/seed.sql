-- ============================================================
-- Seed I'm Here
-- ============================================================

-- Planos
insert into plans (target, code, name, tagline, monthly_price_cents, annual_price_cents, features, highlight, sort_order)
values
  ('user','free','Free','Para experimentar',0,0,'[]',false,0),
  ('user','basic','Básico','Para conhecer pessoas',1990,1490,
    '["Ver perfil 360 completo","3 conversas/dia","Galeria 6 fotos"]',false,1),
  ('user','premium','Premium','O mais escolhido',3990,2990,
    '["Conversas ilimitadas","Foto/áudio no chat","Ver visitantes","Galeria 12 fotos","Modo invisível"]',true,2),
  ('user','vip','VIP','Experiência completa',8990,6990,
    '["Tudo do Premium","Filtros avançados","Boost ilimitado","Selo elite","Suporte 24h"]',false,3),
  ('establishment','casa-basic','Básico Casa','Comece no app',29000,24000,
    '["Aparece na busca","NO MOMENTO 4h","Analytics básico"]',false,0),
  ('establishment','casa-premium','Premium Casa+','Mais conexões na sua casa',59000,49000,
    '["Tudo do Básico","Chat livre incluso","Boost de visibilidade","Stories 12h"]',true,1)
on conflict (code) do nothing;

-- Estabelecimentos (sem owner; admin atribui depois)
insert into establishments (slug, name, type, city, state, address, rating, review_count, cover_url, instagram, price_level, tags, geo)
values
  ('lume-rooftop','Lume Rooftop','lounge','São Paulo','SP','R. Oscar Freire, 837 — Jardins',4.8,1284,
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80','@lume.rooftop',4,
    array['Rooftop','Drinks autorais','DJ ao vivo'],
    st_setsrid(st_makepoint(-46.6716,-23.5667),4326)::geography),
  ('noir-club','Noir Club','club','São Paulo','SP','R. Augusta, 2690 — Consolação',4.6,3421,
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80','@noirclub',3,
    array['Techno','Open bar','After'],
    st_setsrid(st_makepoint(-46.6589,-23.5560),4326)::geography),
  ('boteco-da-vila','Boteco da Vila','bar','São Paulo','SP','R. Fradique Coutinho, 1154 — Vila Madalena',4.7,892,
    'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80','@botecodavila',2,
    array['Chopp gelado','Petiscos','Samba'],
    st_setsrid(st_makepoint(-46.6884,-23.5489),4326)::geography),
  ('kazoku-omakase','Kazoku Omakase','restaurant','São Paulo','SP','Al. Lorena, 1234 — Jardins',4.9,567,
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80','@kazoku.sp',4,
    array['Japonesa','Omakase','Sake bar'],
    st_setsrid(st_makepoint(-46.6643,-23.5639),4326)::geography),
  ('palco-arena','Palco Arena','show','São Paulo','SP','Av. das Nações Unidas, 17955',4.5,2104,
    'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&q=80','@palco.arena',3,
    array['Show ao vivo'],
    st_setsrid(st_makepoint(-46.6960,-23.6210),4326)::geography),
  ('mar-azul','Mar Azul Cocktails','bar','Florianópolis','SC','Av. Beira Mar Norte, 2300',4.4,712,
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80','@marazul.floripa',3,
    array['Vista pro mar','Drinks','Pôr do sol'],
    st_setsrid(st_makepoint(-48.5290,-27.5860),4326)::geography),
  ('subsolo-bar','Subsolo Bar','bar','São Paulo','SP','R. Aspicuelta, 645',4.3,1023,
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80','@subsolosp',2,
    array['Indie rock','Cervejaria','Vinil'],
    st_setsrid(st_makepoint(-46.6885,-23.5560),4326)::geography),
  ('trattoria-fellini','Trattoria Fellini','restaurant','São Paulo','SP','R. dos Pinheiros, 590',4.7,856,
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80','@fellini.sp',3,
    array['Italiana','Vinhos'],
    st_setsrid(st_makepoint(-46.6810,-23.5650),4326)::geography),
  ('neon-after','Neon After','club','São Paulo','SP','R. Pamplona, 1473',4.2,2890,
    'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&q=80','@neonafter',3,
    array['After hours','House','LGBTQ+'],
    st_setsrid(st_makepoint(-46.6571,-23.5645),4326)::geography),
  ('horto-cafe','Horto Café','restaurant','São Paulo','SP','R. Harmonia, 234',4.6,421,
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80','@hortocafe',2,
    array['Brunch','Cafeteria','Pet friendly'],
    st_setsrid(st_makepoint(-46.6907,-23.5470),4326)::geography)
on conflict (slug) do nothing;
