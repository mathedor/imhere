# I'm Here

Plataforma de check-in social em estabelecimentos (bares, restaurantes, baladas).

## Estrutura

```
imhere/
├── web/              Next.js 16 (landing, app PWA, painéis admin/comercial/estabelecimento)
├── mobile/           Expo / React Native (iOS + Android)
└── supabase/         Migrations SQL + seed (PostGIS, RLS, RPCs)
```

## Stack

- **Web**: Next.js 16 + Tailwind v4 + Framer Motion + Lucide
- **Mobile**: Expo Router + React Native Reanimated + Moti + expo-image
- **Backend**: Supabase (Postgres com PostGIS, Auth, Realtime, Storage)
- **Pagamentos**: Efí Bank (PIX + cartão recorrente)

## Como rodar

### 1. Web

```bash
cd web
cp .env.example .env.local   # Sem env, roda em modo mock
npm install
npm run dev                  # http://localhost:3010
```

Sem credenciais, o web funciona com dados mockados (estabelecimentos, usuários, planos).

### 2. Mobile

```bash
cd mobile
cp .env.example .env
npm install
npx expo start
# Pressione i (iOS) ou a (Android)
```

### 3. Supabase

Crie um projeto em [supabase.com](https://supabase.com) e rode:

```bash
# Via Supabase CLI (recomendado)
supabase link --project-ref <SEU_REF>
supabase db push

# Ou cole o conteúdo dos arquivos no SQL editor, na ordem:
# 1. supabase/migrations/0001_init.sql
# 2. supabase/migrations/0002_rls.sql
# 3. supabase/migrations/0003_rpcs.sql
# 4. supabase/seed.sql
```

Depois preencha as variáveis em `web/.env.local` e `mobile/.env`.

### 4. Efí Bank

1. Crie uma conta em [dev.efipay.com.br](https://dev.efipay.com.br)
2. Gere certificado `.p12` no painel
3. Configure `web/.env.local`:
   ```
   EFI_CLIENT_ID=...
   EFI_CLIENT_SECRET=...
   EFI_CERT_PATH=./.efi-cert.p12
   EFI_PIX_KEY=sua_chave_pix
   ```
4. Configure o webhook apontando para `https://seu-dominio.com/api/webhooks/efi`

## Schema do banco

Tabelas principais:

- `profiles` (1-1 com `auth.users`, 4 roles: user/establishment/sales/admin)
- `establishments` (PostGIS geography, perks_active)
- `checkins` (com TTL automático de 6h)
- `moments` (Stories "No Momento", expira em 4h)
- `contact_requests` → `conversations` → `messages` (com moderação)
- `plans` + `subscriptions` + `payments` (Efí integration)
- `courtesies` (cortesias do estabelecimento ao usuário)
- `moderation_logs` (palavras bloqueadas)
- `notifications` + `push_tokens`

RPCs:

- `nearby_establishments(lat, lng, radius, sort)` — busca geo
- `do_checkin(estab_id)` — encerra anterior e cria novo
- `do_checkout()` — encerra checkin ativo
- `respond_contact_request(req_id, accept)` — aceita/recusa e cria conversa
- `redeem_courtesy(id)` — resgata cortesia

## Roles e fluxos

| Role            | Rota web                       | Pode...                                                   |
| --------------- | ------------------------------ | --------------------------------------------------------- |
| `user`          | `/app`                         | Check-in, ver presentes, chat (com plano)                 |
| `establishment` | `/estabelecimento`             | Postar moments, ver presentes, enviar cortesias, premium da casa |
| `sales`         | `/comercial`                   | Cadastrar estabelecimentos, ver comissão                  |
| `admin`         | `/admin`                       | Dashboards, CRUDs, relatórios, moderação                  |

O middleware redireciona automaticamente para a área correta do role após login.

## Regras de negócio críticas (RLS-enforced)

1. **Só inicia contato se ambos têm check-in ativo no mesmo estabelecimento** — validado em `contact_requests_create` policy
2. **Só vê usuários com status open/watching** — `profiles_select_visible`
3. **Mensagem só em conversa que o usuário participa** — `messages_select_participant`
4. **Cortesia só o estabelecimento dono envia** — `courtesies_estab_send`
5. **Stories expiram em 4h** — `moments_select_all` filtra por `expires_at`

## Próximos passos

- [ ] Realtime chat com `supabase.channel`
- [ ] Push notifications (OneSignal/FCM)
- [ ] Upload de fotos para Supabase Storage
- [ ] Token de cartão Efí (efi.js no front)
- [ ] EAS Build para iOS/Android
- [ ] Substituir QR Code SVG mock por geração real (já vem da API Efí)
