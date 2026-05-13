# Memorial Descritivo · I'm Here

> Plataforma de check-in social para bares, restaurantes e baladas.
> Documento atualizado em **2026-05-13** · versão da plataforma: Sprint 5a entregue.

---

## 1. Visão Geral

### O que é o I'm Here

I'm Here é uma rede social geolocalizada de check-in em estabelecimentos de vida noturna e gastronomia. Reúne em uma única plataforma:

- **Aplicativo do usuário final** — para descobrir o que está acontecendo agora ao redor, fazer check-in, ver quem está no mesmo lugar e iniciar conversas presenciais.
- **Painel do estabelecimento** — para que bares, restaurantes e baladas vejam quem está no seu lugar, postem stories ao vivo, gerenciem fidelidade e analisem o público.
- **Painel comercial** — para corretores/representantes captarem novos estabelecimentos, acompanharem pipeline e comissões.
- **Painel administrativo** — para o time interno do I'm Here moderar conteúdo, acompanhar métricas globais e gerenciar planos, créditos e usuários.

### Estrutura de papéis (roles)

| Papel | Rota inicial após login | Quem é |
|---|---|---|
| `user` | `/app` | Frequentadores de bares/baladas |
| `establishment` | `/estabelecimento` | Donos/gerentes de estabs |
| `sales` | `/comercial` | Representantes comerciais |
| `admin` | `/admin` | Time interno do I'm Here |

O redirecionamento por papel é automático no login — cada usuário acessa apenas a sua área correspondente.

### Stack técnica

- **Frontend:** Next.js 16 (App Router, Server Components + Server Actions), React 19, Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL com PostGIS, Auth, Storage, Realtime + Presence)
- **Pagamentos:** Efí Bank (PIX + cartão de crédito) via webhook
- **Hospedagem:** Vercel (deploy contínuo via Git)
- **PWA:** manifest + service worker com cache offline + push notifications (VAPID)
- **Notificações push:** Web Push API com fila pelo Supabase Edge

### Características gerais

- **Multi-tenant por estabelecimento** — cada bar/restaurante é tenant isolado com Row Level Security (RLS)
- **Moderação ativa** — filtro de palavrões + denúncias + verificação de identidade por selfie
- **Sistema de créditos virtuais** — usuários e estabs compram créditos para usar features premium
- **Sistema de planos por assinatura** — Free/Premium/VIP para usuário; Starter/Pro para estab
- **Rate limiting** — proteção contra abuso em todas as ações sensíveis
- **PWA instalável** — funciona como app nativo no celular

---

## 2. Funcionalidades por Papel

## 2.1 Usuário Final (`/app`)

### 2.1.1 Cadastro e autenticação

- **Cadastro em 30 segundos** com nome, e-mail, senha e WhatsApp opcional
- **Login com redirecionamento automático** por papel
- **Recuperação de senha** via e-mail com link temporário (rota `/esqueci-senha` → `/redefinir-senha`)
- **Anti-enumeration** na recuperação: sistema sempre retorna sucesso, mesmo se o e-mail não existir, para não permitir descoberta de usuários cadastrados
- **Onboarding** com aceitação de termos e código de conduta antes do primeiro uso
- **Bonificação inicial** de créditos para novos usuários (signup bonus)

### 2.1.2 Home e descoberta

- **Geolocalização inteligente** mostra estabelecimentos próximos ao usuário, ordenados por relevância e distância
- **Lista de estabelecimentos com indicadores visuais:**
  - Quantos check-ins ativos agora
  - Se tem story ativo (borda animada no logo)
  - Distância em metros/km
  - Faixa de preço, tags e horário de funcionamento

### 2.1.3 Perfil do estabelecimento (vista do usuário)

Página dedicada para cada estabelecimento exibindo:
- Cover, nome, tipo, endereço e rating
- Instagram, WhatsApp e link de reservas
- **Lista "Quem está aqui agora"** com fotos e status dos usuários presentes
- Stories ativos ao vivo (rolam tipo Instagram)
- Botão de **check-in** que registra o usuário como presente
- Cardápio digital integrado quando disponível

### 2.1.4 Check-in social

- **Um toque para entrar** — registra o usuário como presente naquele local
- **Notificação para match contextual** — quando alguém com perfil compatível chega no mesmo estab, o usuário recebe push
- **Check-out automático** após 6h ou manual a qualquer momento
- Restrição de **apenas um check-in ativo por vez** (não pode estar em 2 lugares ao mesmo tempo)
- Rate limit de 10 check-ins por minuto (anti-spam)

### 2.1.5 Quem está aqui (lista social)

- Lista todos os usuários com check-in ativo no estab
- Filtros: idade, gênero, interesse, status (aberto/só observando/invisível)
- **Status de visibilidade** do próprio usuário:
  - `open` — aparece nas listas e aceita contato
  - `watching` — vê quem está mas não aparece (premium)
  - `invisible` — totalmente oculto (premium)

### 2.1.6 Perfil 360 de outro usuário

Tela detalhada de outro usuário exibindo:
- Foto, nome, idade, profissão, cidade
- Bio, Instagram
- Galeria de até 12 fotos
- **Badge de afinidade** calculado pelo quiz (alta/boa/baixa + percentual)
- **Selo verificado** se passou pela verificação por selfie
- Botão **"Iniciar conversa"** que envia uma solicitação de contato
- Sugestão de "Pessoas similares aqui"
- Tela registra **visualização de perfil** (analytics premium)

### 2.1.7 Solicitações de contato

- Botão de contato envia pedido (1 por dia no plano Free, ilimitado no Premium)
- Destinatário recebe notificação push + in-app
- Pode **aceitar, recusar ou ignorar**
- Apenas com aceite a conversa é liberada
- Rate limit de 10 solicitações/minuto

### 2.1.8 Chat (conversas presenciais)

Sistema de chat com:
- **Mensagens de texto** com moderação de palavrões automática
- **Áudio gravado direto pelo app** (MediaRecorder API → Supabase Storage)
- **Foto enviada** via câmera nativa ou galeria
- **Sugestões de quebra-gelo** contextuais ("Pergunte sobre o estab onde se conheceram")
- Status de mensagem (enviada/entregue)
- Histórico permanente
- Notificação push em tempo real para mensagens novas
- Rate limit de 30 mensagens/minuto

### 2.1.9 Notificações

- Centro de notificações com filtros (Todas / Não lidas / Social / Sistema)
- Tipos de notificação: check-in match, mensagem nova, contato aceito, cortesia recebida, story postado, alerta de moderação
- **Push notifications via Web Push** (com permissão do usuário)
- Marcar tudo como lido com 1 clique

### 2.1.10 Cortesias

Tela "Minhas Cortesias" lista brindes e descontos que o usuário recebeu de estabelecimentos, com QR code para resgate no local.

### 2.1.11 Visitas (premium)

Tela que mostra quem visualizou o perfil do usuário (recurso pago do plano Premium ou superior).

### 2.1.12 Perfil próprio

Edição completa do perfil:
- Nome, e-mail, WhatsApp, CPF, Instagram
- Data de nascimento (idade calculada automaticamente)
- Gênero, profissão, bio
- Status de visibilidade (open/watching/invisible)
- Foto principal + galeria de 6-12 fotos
- Plano ativo (visualização)
- Salvamento via Server Action

### 2.1.13 Verificação de identidade

- Submissão de selfie segurando documento
- Análise manual pelo time admin
- Selo ✓ azul concedido ao aprovar
- Selo aumenta taxa de aceitação de contato em ~3x (heurística do produto)

### 2.1.14 Quiz de afinidade

- 5 perguntas multipla escolha (vibe, bebida, música, companhia, horário)
- Cálculo de score de afinidade entre pares via função SQL (`calc_quiz_affinity`)
- Score aparece como badge na visualização de outro usuário
- Listagem "Maior afinidade com você" na tela de match-analysis

### 2.1.15 Análise pessoal de match

Painel exclusivo do usuário com:
- Taxa de aceite percentual (com ranking entre usuários)
- Total de contatos enviados / aceitos / recusados / pendentes
- Distribuição de aceites por gênero (gráfico de barras)
- Top 6 usuários com maior afinidade pelo quiz

### 2.1.16 Planos e créditos

- Tela com 3 planos: Free / Básico / Premium / VIP
- Comparativo de features lado-a-lado
- Compra via Efí (PIX ou cartão) com checkout integrado
- Tela de **gestão de créditos** com saldo atual e histórico de compras
- Créditos podem ser usados em features pontuais (ex.: contato extra)

### 2.1.17 Boost pessoal (premium)

Usuário paga créditos para aparecer em destaque por 1h na lista de "Quem está aqui" do estab atual.

---

## 2.2 Estabelecimento (`/estabelecimento`)

### 2.2.1 Dashboard ao vivo

Tela inicial mostra:
- **Quantas pessoas estão no estabelecimento agora**
- Demografia em tempo real (gênero, idade média)
- Comparativo com a mesma hora dos últimos 7 dias
- Notificações pendentes e alertas
- Ranking de frequentadores recentes

### 2.2.2 Perfil do estabelecimento

Cadastro e edição de:
- Nome, tipo, descrição, sobre
- Endereço completo com CEP, número e complemento
- Coordenadas geográficas para o mapa
- Logo, cover, fotos
- Horário de funcionamento
- Tags (rooftop, drinks, vista mar, etc.)
- Instagram, WhatsApp, link de reservas
- Faixa de preço ($/$$/$$$/$$$$)

### 2.2.3 No Momento (stories ao vivo)

Sistema de stories tipo Instagram com:
- **Postagem imediata** com foto + legenda
- **Agendamento** para publicar em data futura (até 30 dias)
- Expiração automática em 4h
- **Notificação push** para frequentadores recentes (últimos 7 dias)
- **Notificação para quem está com check-in ativo agora**
- **Indicador de melhor horário para postar** baseado no histórico de check-ins do estab
- Listagem dos stories ativos com contador de views
- Listagem dos stories agendados com opção de cancelar
- Cron automático a cada 5 min que publica os agendados vencidos

### 2.2.4 Pessoas (CRM noturno)

Listagem de clientes do estabelecimento:
- Quem está agora
- Frequentadores recentes (últimos 7 dias)
- Todos os clientes cadastrados (com filtro por gênero, idade, frequência)
- Cada cliente é clicável → perfil 360 com:
  - Histórico de check-ins
  - Última visita
  - Total gasto estimado
  - Cortesias recebidas
  - Programa de fidelidade
  - Botão para enviar cortesia personalizada

### 2.2.5 Cortesias

- Envio de cortesias individuais (drink grátis, sobremesa, desconto)
- Mensagem personalizada
- Notificação push para o cliente
- QR code para resgate no local
- Histórico de cortesias enviadas com taxa de resgate

### 2.2.6 Programa de fidelidade

- Criação de programa "X check-ins = brinde"
- Acompanhamento de progresso por cliente
- Brindes pré-definidos (drink grátis, desconto, cortesia especial)
- Histórico de recompensas resgatadas
- Métrica de retenção via fidelidade

### 2.2.7 Cardápio digital

- Itens organizados por categoria
- Preço, descrição, foto
- Toggle de disponibilidade
- Ordem customizável por categoria
- **Rota pública QR-friendly** em `/cardapio/[slug]` para acesso direto do cliente
- **Open Graph dinâmico** — quando compartilhado, gera preview com nome do estab + cidade + presentes agora

### 2.2.8 Broadcast (mensagem em massa)

Disparo de mensagem para múltiplos frequentadores:
- Segmentação (todos, últimos 30 dias, primeira visita, etc.)
- Texto + foto opcional
- Custo em créditos
- Histórico de envios com taxa de abertura

### 2.2.9 Boost de visibilidade

- Compra de **1h de destaque no app** por 50 créditos
- Estabelecimento aparece em topo da lista de "Próximos" para usuários dentro do raio
- Múltiplos boosts simultâneos possíveis
- Histórico de boosts contratados com retorno (check-ins gerados)

### 2.2.10 Premium Casa (perks ativos)

Painel de configuração de **benefícios da casa**:
- Wi-Fi grátis, estacionamento, kids-friendly, pet-friendly, acessibilidade, drag show, música ao vivo, etc.
- Cada perk ativo aparece como badge no perfil público do estab

### 2.2.11 Avaliações

- Lista de reviews públicos
- Resposta do estabelecimento (premium)
- Score médio em destaque

### 2.2.12 Relatórios

#### Dashboard de relatórios
Visão geral de métricas:
- Check-ins por dia/semana/mês
- Pico de movimento por hora
- Demografia agregada
- Origem dos clientes (cidade)

#### Funil de conversão
Funil completo de jornada:
1. Quantos viram o estab no app
2. Quantos fizeram check-in
3. Quantos iniciaram conversa no local
4. Quantos voltaram em outra ocasião

Cada estágio mostra absoluto e percentual de conversão.

### 2.2.13 Notificações próprias

Centro de notificações do estabelecimento:
- Nova avaliação
- Cliente atingiu meta de fidelidade
- Cliente VIP fez check-in
- Cobrança da assinatura processada

---

## 2.3 Comercial (`/comercial`)

### 2.3.1 Dashboard pessoal

Visão geral do representante:
- Comissões do mês corrente
- Meta versus realizado
- Estabelecimentos ativos sob sua carteira
- Pipeline em andamento

### 2.3.2 Pipeline (kanban)

Tela de gestão de leads em colunas:
- Lead novo
- Em negociação
- Proposta enviada
- Fechado
- Perdido

Drag-and-drop entre colunas. Cada card mostra estab, contato, valor estimado, próxima ação.

### 2.3.3 Novo lead

Formulário rápido para cadastrar prospect:
- Nome do estab, tipo, cidade
- Contato do dono (nome, e-mail, WhatsApp)
- Origem (indicação, ativa, inbound)
- Observação livre

### 2.3.4 Estabelecimentos sob carteira

Lista de estabs que o comercial fechou:
- Status da assinatura (ativa/inadimplente/cancelada)
- MRR contribuído
- Última interação
- Atalho para entrar em contato

### 2.3.5 Comissões

Extrato detalhado:
- Comissão por mês
- Por estabelecimento
- Status (pago/pendente)
- Total acumulado
- Histórico de pagamentos

### 2.3.6 Notificações

Notificações específicas do comercial: lead novo atribuído, estab inadimplente, pagamento de comissão liberado.

### 2.3.7 Relatórios comerciais

Métricas pessoais:
- Conversão por origem
- Ticket médio fechado
- Ciclo médio de venda
- Comparativo com time

---

## 2.4 Administrador (`/admin`)

### 2.4.1 Dashboard global

Painel de comando do time interno mostrando:
- Total de usuários ativos
- Total de estabs cadastrados
- Receita recorrente mensal (MRR)
- Volume de check-ins do dia
- Taxa de churn
- NPS médio

### 2.4.2 Gestão de estabelecimentos

- Lista completa com busca, filtros (cidade, tipo, plano, status)
- Tela 360 de cada estab:
  - Métricas (check-ins, retorno, MRR)
  - Histórico de logs
  - Cross-links para owner, cardápio, comercial responsável
- Edição completa do estab pelo admin
- Cadastro de novo estab (pré-cadastro antes de o dono assumir)
- Acesso ao cardápio do estab

### 2.4.3 Gestão de usuários

- Lista completa com busca por nome, e-mail, cidade
- Tela 360 do usuário com check-ins, conversas, denúncias, plano
- Edição do perfil
- Cadastro manual de novo usuário (uso interno)
- Banir/reativar conta

### 2.4.4 Gestão de comerciais

- Lista de representantes ativos
- Performance de cada um
- Criação de novo comercial (cria usuário com role `sales`)

### 2.4.5 Moderação

Fila de moderação com:
- Denúncias recebidas (categorias: assédio, spam, perfil fake, ofensivo, segurança, outro)
- Contexto da denúncia (perfil, conversa, mensagem específica)
- Histórico do denunciado (denúncias anteriores)
- Ações: revisar / dispensar / aplicar punição
- Logs de moderação automática (palavrões bloqueados, perfis suspensos)

### 2.4.6 Verificações de identidade

Fila exclusiva para revisão de selfies de verificação:
- Foto do documento + selfie do usuário
- Comparação visual lado-a-lado
- Aprovar (concede selo ✓) ou rejeitar (com motivo)
- Notificação push automática para o usuário

### 2.4.7 Planos

CRUD de planos:
- Nome, tagline, preço mensal e anual
- Lista de features incluídas
- Marcação de "destaque" (badge "Mais popular")
- Ordem de exibição

### 2.4.8 Sistema de créditos

- Configuração de **preços por feature** (quantos créditos custa cada ação)
- Configuração de **pacotes de crédito** vendidos (qtd + preço em centavos)
- Histórico global de transações
- Saldo agregado em circulação

### 2.4.9 Relatórios (suite completa)

#### Mapa
Mapa interativo com Leaflet mostrando todos os estabs georreferenciados e heatmap de densidade de usuários por cidade.

#### Cohorts de retenção
Tabela de cohorts semanais — quantos usuários do cohort X estavam ativos 1, 2, 3... semanas depois. Permite identificar padrões de retenção.

#### Cohort de receita (LTV)
Cohorts mensais de receita acumulada por usuário, calculando LTV ao longo de 6 meses.

#### Análise de match
Aceitação por gênero, faixa etária, cidade. Insights de quem aceita mais quem.

#### Heatmap geográfico
Densidade de check-ins por região, identificando hotspots.

#### Horários de pico
Distribuição de check-ins por hora do dia + dia da semana.

#### Locais (rankings)
- Top estabs por check-in
- Top estabs por retenção
- Top estabs por MRR
- Top cidades
- Top categorias (bar/restaurante/balada)
- Top usuários (mais ativos)

#### Demografia
- Por gênero
- Por faixa etária
- Por cidade

#### Operacional
- Check-ins hoje/semana
- Buscas realizadas (termos mais procurados)
- Contatos enviados/aceitos
- Usuários online agora
- Funil agregado da plataforma

### 2.4.10 Alertas

Sistema de detecção automática de anomalias:
- Pico de denúncias em curto período
- Estab com queda atípica de check-ins
- Usuário com volume anormal de contatos
- Tentativas de login falhadas em massa

Cada alerta tem severidade (baixa/média/alta/crítica) e pode ser marcado como resolvido.

### 2.4.11 Vendas

Painel financeiro:
- Receita por mês
- Assinaturas ativas
- Taxa de upgrade/downgrade
- Receita por plano
- Estabs com problema de cobrança

### 2.4.12 Configurações globais

- Toggles de features
- Configuração de VAPID keys (push)
- Configuração de chaves Efí
- Webhooks
- Manutenção

### 2.4.13 Notificações próprias

Centro de notificações do admin: novo cadastro de estab, denúncia urgente, pagamento falhado, alerta crítico.

---

## 3. Funcionalidades Transversais

### 3.1 Sistema de pagamentos

- **Integração com Efí Bank** (alternativa ao Stripe)
- Suporte a PIX e cartão de crédito
- Cobrança recorrente para assinaturas
- Webhook em `/api/webhooks/efi` processa eventos de pagamento
- Histórico de transações por usuário/estab
- Suporte a estorno e cancelamento

### 3.2 Sistema de créditos

- Saldo individual por usuário (`credit_balances`)
- Histórico completo de transações (`credit_transactions`)
- Pacotes pré-definidos com bônus (compra 100, ganha 110)
- Cobrança automática ao usar feature paga
- Bônus de cadastro para novos usuários

### 3.3 Moderação automática

- **Filtro de palavrões** em mensagens, bios e captions (bloqueia o conteúdo + registra log)
- Mensagens com `status = 'blocked'` ficam ocultas mas registradas para auditoria
- Detecção de perfis duplicados via e-mail / WhatsApp
- Trigger de alerta automático em pico de denúncias

### 3.4 Push notifications

- Web Push padrão W3C com VAPID
- Service Worker em `/sw.js` registra subscription
- Tabela `push_tokens` armazena subscriptions ativas
- Função `sendWebPushTo(profileId, payload)` envia notificação
- Tipos suportados: nova mensagem, contato aceito, story postado, match contextual, alerta de moderação, cortesia recebida, lembrete de fidelidade

### 3.5 Realtime e Presence

- **Supabase Realtime** transmite eventos em tempo real (mensagens novas, check-ins)
- **Presence channels** rastreiam quem está conectado em cada estab agora (badge "X online" no painel do estab)

### 3.6 Storage de mídia

Buckets organizados:
- `user-gallery` — fotos do perfil
- `establishment-cover` — capas dos estabs
- `moments` — fotos dos stories
- `chat-media` — áudios e fotos do chat
- `verification` — selfies de verificação (restrito a admins)
- `menu` — fotos do cardápio

Cada bucket tem políticas de RLS específicas.

### 3.7 Rate limiting

Limites em memória aplicados a:
- Login: 5 tentativas/min
- Cadastro: 3 tentativas/5min
- Reset de senha: 3/15min
- Envio de mensagem: 30/min
- Solicitação de contato: 10/min
- Check-in: 10/min
- Denúncia: 5/5min

### 3.8 PWA (Progressive Web App)

- **Manifest** completo com ícones 192px/512px e cores temáticas
- **Service Worker** com cache offline (network-first em navegação, cache-first em assets)
- **Install prompt** customizado com cooldown de 7 dias após dispensa
- Ícones gerados dinamicamente via `next/og` (192px e 512px)

### 3.9 SEO

- **Sitemap dinâmico** em `/sitemap.xml` incluindo slugs de estabs
- **Robots.txt** liberando rotas públicas e bloqueando admin/app/estabelecimento/comercial
- **Open Graph estático** na landing
- **Open Graph dinâmico** por estabelecimento em `/cardapio/[slug]` com nome, cidade e presentes agora
- **Metadata específica** por página (title, description, keywords)
- Página 404 customizada com CTA de retorno

### 3.10 Análise de afinidade (quiz)

- 5 perguntas multipla escolha (vibe, bebida, música, companhia, horário ideal)
- Função SQL `calc_quiz_affinity(a, b)` retorna score 0-100
- Score visível no perfil do outro usuário e na análise de match pessoal
- Quiz é opcional mas recomendado via CTAs

### 3.11 Sistema de match contextual

Quando um usuário faz check-in, o sistema analisa:
- Outros usuários presentes naquele estab
- Histórico de conversas anteriores
- Compatibilidade demográfica
- Score do quiz

E dispara **notificação push proativa** para os matches potenciais, dizendo "X chegou no [estab], match potencial".

### 3.12 NPS (Net Promoter Score)

- Pergunta de NPS pós-conversa ("De 0 a 10, recomenda o I'm Here?")
- Contexto da pergunta registrado (`post_chat`, `post_checkin`, etc.)
- Histórico individual e agregado
- Cálculo automático do NPS médio para admin

### 3.13 Sistema de leads (pipeline)

- Cada estabelecimento "lead" tem estágio (novo/negociação/fechado/perdido)
- Vínculo com comercial responsável
- Logs de interação (ligação, e-mail, visita)
- Conversão em estabelecimento real quando fechado

### 3.14 Search events

Toda busca feita no app é registrada para analytics:
- Termo buscado
- Resultados clicados
- Quem buscou
- Quando

Permite identificar termos populares e ajustar algoritmo de descoberta.

### 3.15 Press kit público

Página `/imprensa` com material institucional:
- Números da plataforma
- Timeline de releases
- Citações de usuários/estabs
- Paleta de cores e logo para download
- Contato direto

---

## 4. Arquitetura de Segurança

### 4.1 Row Level Security (RLS)

Todas as tabelas sensíveis têm políticas RLS impostas no PostgreSQL. Garantem que:
- Usuário só vê/edita seus próprios dados
- Estabelecimento só vê seus clientes e métricas
- Comercial só vê estabs sob sua carteira
- Admin tem acesso total

### 4.2 Autenticação

- Supabase Auth com email/senha
- Tokens JWT renovados automaticamente
- Sessões persistentes via cookies httpOnly
- Verificação de e-mail opcional (auto-confirm em cadastros internos)

### 4.3 Auditoria

Logs estruturados em:
- `moderation_logs` — toda ação de moderação (manual e automática)
- `admin_alerts` — anomalias detectadas
- `credit_transactions` — toda movimentação financeira
- Search events, profile views

### 4.4 Validação de entrada

- Sanitização em todos os Server Actions
- Validação de tipos via TypeScript
- Limites de tamanho de strings (anti-DoS)
- Rate limiting (descrito em 3.7)

---

## 5. Integrações Externas

### 5.1 Supabase

Backend principal:
- PostgreSQL com 20+ migrations
- PostGIS para queries geográficas
- Auth, Storage, Realtime, Edge Functions
- Backup automático

### 5.2 Efí Bank

Gateway de pagamento brasileiro com:
- PIX (chave + QR code)
- Cartão de crédito recorrente
- Webhook integrado

### 5.3 Web Push (VAPID)

Notificações push nativas em browsers compatíveis sem necessidade de Firebase/APNs.

### 5.4 Unsplash / Pravatar

Imagens demo no ambiente de testes (substituídas por uploads reais em produção).

---

## 6. Deploy e Operação

### 6.1 Ambientes

- **Production:** branch `main` deploy automático na Vercel
- **Preview:** cada PR gera URL de preview
- **Local:** `npm run dev` com Supabase remoto ou local

### 6.2 Cron jobs

Configurados em `vercel.json`:
- `/api/cron/publish-moments` — a cada 5 min, publica stories agendados que venceram

### 6.3 Observabilidade

- Logs estruturados no Vercel
- Console errors capturados em produção
- (Roadmap: Sentry para captura estruturada)

---

## 7. Funcionalidades Pendentes (Roadmap)

### 7.1 Aplicativo móvel nativo

- Projeto Expo (React Native) reaproveitando o backend Supabase
- iOS e Android publicados nas stores
- Push nativos via APNs/FCM
- Geolocalização em background

### 7.2 Testes automatizados

- Playwright e2e cobrindo fluxos críticos
- Sentry para observabilidade em produção
- Auditoria de acessibilidade (a11y)
- Cobertura de unit tests dos helpers

### 7.3 Vídeos demonstrativos

Roteiros prontos em `docs/demo-script.md`:
- Vídeo do usuário (90s)
- Vídeo do estabelecimento (90s)
- Vídeo do comercial (60s)

Pendente: gravação profissional pelo time.

---

## 8. Glossário

- **Check-in:** registro de que o usuário está em determinado estab agora
- **Story / "No Momento":** post visual com expiração de 4h (analogia a Instagram Stories)
- **Match contextual:** notificação proativa quando alguém compatível faz check-in no mesmo estab
- **Cortesia:** brinde/desconto que o estab oferece a um cliente específico
- **Boost:** destaque temporário pago em créditos
- **Cohort:** grupo de usuários que se cadastraram no mesmo período, analisado ao longo do tempo
- **LTV (Lifetime Value):** receita total esperada de um cliente durante seu tempo de uso
- **MRR (Monthly Recurring Revenue):** receita recorrente mensal
- **NPS (Net Promoter Score):** índice de recomendação (% promotores - % detratores)
- **RLS (Row Level Security):** mecanismo do PostgreSQL que restringe acesso a linhas por usuário
- **VAPID:** padrão de chaves criptográficas para Web Push
- **PWA:** Progressive Web App — site que se comporta como app instalável

---

## 9. Resumo executivo

A plataforma I'm Here entrega, em sua versão atual:

- **4 painéis completos** (usuário, estabelecimento, comercial, administrativo)
- **Mais de 80 telas únicas** distribuídas entre os papéis
- **20 migrations** estruturando o banco de dados
- **Sistema completo de monetização** (planos + créditos + pagamentos via Efí)
- **Moderação ativa** (automática + fila manual)
- **Analytics avançada** (cohorts, LTV, funis, mapa geo, match analysis)
- **Notificações em tempo real** (push + in-app + realtime)
- **PWA instalável** com suporte offline
- **SEO completo** com OG dinâmico por estab

O produto está em estado de **MVP completo e funcional**, pronto para demonstração e operação inicial. Roadmap imediato contempla aplicativo mobile nativo (Expo), suíte de testes automatizados e produção de material audiovisual.
