# Roteiro dos vídeos demo · I'm Here

Três vídeos curtos, estilo Loom narrado. Sugestão de gravação: OBS ou Loom em 1080p, tela do navegador em fullscreen, voz over com tom amigável e direto. Sem música ou com fundo bem discreto. Cada vídeo deve servir para landing, Instagram (corta em 60s) e pitch deck.

---

## Vídeo 1 · Pra usuário (90s)

**Objetivo:** mostrar que é fácil descobrir lugar movimentado e conectar com quem está lá.

### Roteiro

| Tempo | Tela | Voz over |
|---|---|---|
| 0-5s | Logo I'm Here animando | "I'm Here. O app que mostra quem está no seu lugar favorito agora." |
| 5-15s | Home com mapa + lista de bares próximos | "Abre o app. Você vê os lugares mais movimentados perto de você em tempo real." |
| 15-25s | Click num estab → cover + present count | "Toque num lugar. Veja quantas pessoas estão lá agora, o clima, fotos ao vivo." |
| 25-40s | Aba "Quem tá aqui" + filtro por idade/interesse | "Quem mais está? Galera com perfil aberto a conversa. Você filtra por idade, interesse, status." |
| 40-55s | Tela de perfil → botão "Iniciar conversa" → modal de envio | "Bate o olho num perfil que combina. Manda uma mensagem. Se a pessoa aceitar, vocês conversam ali mesmo." |
| 55-70s | Chat com áudio + foto + ice-breakers | "Áudio, foto, e até sugestões de quebra-gelo. Tudo no momento certo, no lugar certo." |
| 70-85s | Tela de notificações + push real | "Recebe push quando alguém compatível chegar no lugar onde você tá." |
| 85-90s | CTA: "I'm Here. Cadastro grátis. imhere.app" | (mesma) |

### Cenas críticas que precisam estar funcionais durante gravação:
- Home com pelo menos 3 estabs (use seed-demo data)
- 1 estab com 5+ check-ins ativos
- Conversa com pelo menos uma troca de áudio + foto

---

## Vídeo 2 · Pra estabelecimento (90s)

**Objetivo:** vender pro dono de bar/restaurante que o I'm Here é um CRM noturno, não só listagem.

### Roteiro

| Tempo | Tela | Voz over |
|---|---|---|
| 0-7s | Logo + frase "Mais que cadastro. Um CRM noturno." | "Se você tem um bar, restaurante ou balada, o I'm Here não é só mais um app de listagem." |
| 7-20s | Dashboard estab: presentes agora + última hora | "É um painel ao vivo. Veja quem está no seu lugar agora — idade, gênero, se já voltou, se é a primeira vez." |
| 20-35s | Editor de momento: postar foto + caption | "Poste um Story do clima ao vivo. A galera que frequenta recebe notificação na hora." |
| 35-50s | Tela de relatórios: cohorts + funnel + LTV | "Análise séria: cohort de retenção, funil de conversão, LTV de cada cliente. Para de chutar promoção." |
| 50-65s | Fidelidade: 5 check-ins = brinde + cortesia | "Programa de fidelidade automático. Cliente faz 5 check-ins, ganha brinde. Você dispara cortesias segmentadas." |
| 65-80s | Tela de boost (50 créditos = 1h destaque) | "Dia parado? Compre boost por 1h e seu lugar vira destaque no app pra quem tá perto." |
| 80-90s | CTA: "14 dias grátis. Sem fidelidade. imhere.app/cadastro" | (mesma) |

### Cenas críticas:
- Dashboard com 8+ presentes ativos
- Pelo menos um story ativo
- Cohort com 6+ semanas de dados (seed-demo cobre)
- Tela de boost com explicação clara dos 50 créditos

---

## Vídeo 3 · Pra comercial/parceiro (60s)

**Objetivo:** explicar a operação de vendas — abre estab, gerencia, recebe comissão.

### Roteiro

| Tempo | Tela | Voz over |
|---|---|---|
| 0-7s | Logo + "Programa de comerciais" | "I'm Here cresce com você. O programa de comerciais funciona assim." |
| 7-20s | Tela de pipeline: leads, em negociação, fechados | "Você cadastra estabelecimentos na sua região. Acompanha cada lead pelo painel." |
| 20-35s | Tela de comissões: percentual + extrato + pago/pendente | "Cada estabelecimento que assina, você ganha comissão recorrente. Mês a mês, enquanto ele continuar pagando." |
| 35-50s | Cadastro de estab pelo comercial (form rápido) | "O cadastro é simples. Você preenche dados básicos, manda o link, o estab finaliza assinatura." |
| 50-60s | CTA: "Quer ser comercial? Fala com a gente. imhere.app/comercial" | (mesma) |

### Cenas críticas:
- Pipeline com 5+ leads em estágios diferentes
- Tela de comissões com pelo menos 3 pagamentos histórico
- Form de novo estab

---

## Notas técnicas pra gravação

- **Resolução:** 1920×1080 (1080p)
- **FPS:** 30
- **Audio:** USB mic decente (Yeti, MV7) ou AirPods Pro mesmo. Sem hum/echo.
- **Voz:** tom amigável, fala normal, sem teleprompter visível. Pode ter 2-3 tomadas e escolher a melhor.
- **Edição:** corta cenas mortas. Acelera transições entre telas. Adiciona zoom suave nos elementos que estiver narrando.
- **Música:** opcional, deixa em -25dB pra não competir com voz. Use "Lofi Background" royalty-free do Pixabay/Epidemic Sound.

## Distribuição

- **Landing:** vídeo 1 no hero (autoplay muted, com botão "Ouvir")
- **Cadastro de estab:** vídeo 2 no topo da página
- **Página /comercial:** vídeo 3
- **Instagram Reels:** versão de 60s de cada um
- **Pitch deck:** link pra todos os 3 no slide "Como funciona"

---

## Checklist antes de gravar

- [ ] Seed demo data rodado (`supabase/seed-demo.sql`) — garante presença de dados realistas
- [ ] Login com user demo `mateus@imhere.app` (sender), `leticia@imhere.app` (receiver)
- [ ] Login com estab demo `lume@imhere.app`
- [ ] Login com comercial demo `comercial@imhere.app`
- [ ] Mobile preview do navegador (Chrome devtools, modo iPhone 14 Pro)
- [ ] Notificações desativadas no sistema (sem pop-ups indesejados)
- [ ] Aba "Quem tá aqui" populada (pelo menos 3 perfis abertos)
