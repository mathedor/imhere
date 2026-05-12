#!/usr/bin/env node
/**
 * Seed massivo: 20 estabelecimentos no litoral norte de SC + cardápios.
 * Rota geográfica: Itajaí — Praia Brava — Balneário Camboriú — Meia Praia — Itapema
 *
 * Requer: variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env
 * Uso: node scripts/seed-litoral-sc.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ENV_PATH = path.resolve("web/.env.local");
const envContent = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : "";
const envVars = Object.fromEntries(
  envContent.split("\n").filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => {
    const idx = l.indexOf("=");
    return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
  })
);

const SUPA_URL = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPA_URL || !KEY) {
  console.error("Falta NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

// Cidades base + coordenadas aproximadas
const ESTABS = [
  // ITAJAÍ
  { slug: "praia-do-atalaia-bar", name: "Atalaia Bar & Beach", type: "bar", city: "Itajaí", state: "SC", address: "Av. Vereador Abrahão João, 1280 — Atalaia", lat: -26.9456, lng: -48.6580, cep: "88306-100", instagram: "@atalaia.bar", cover: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1200&q=80", tags: ["Beira-mar", "Drinks", "Chopp"], price: 3, rating: 4.6 },
  { slug: "casa-de-praia-itajai", name: "Casa de Praia", type: "restaurant", city: "Itajaí", state: "SC", address: "R. Brusque, 200 — Praia Brava", lat: -26.9650, lng: -48.6295, cep: "88306-330", instagram: "@casadepraia.sc", cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80", tags: ["Frutos do mar", "Mediterrânea"], price: 4, rating: 4.7 },
  { slug: "porto-quatorze", name: "Porto Quatorze", type: "lounge", city: "Itajaí", state: "SC", address: "Av. Marginal, 740 — Centro", lat: -26.9100, lng: -48.6620, cep: "88301-000", instagram: "@portoquatorze", cover: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1200&q=80", tags: ["Lounge", "Cocktails", "Vista porto"], price: 4, rating: 4.5 },
  { slug: "kiosk-do-fred", name: "Kiosk do Fred", type: "bar", city: "Itajaí", state: "SC", address: "Praia Brava, Quiosque 14", lat: -26.9670, lng: -48.6310, cep: "88306-300", instagram: "@kioskdofred", cover: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&q=80", tags: ["Pé na areia", "Petiscos"], price: 2, rating: 4.3 },

  // PRAIA BRAVA / ITAJAÍ
  { slug: "deck-brava", name: "Deck Brava Beach Club", type: "lounge", city: "Itajaí", state: "SC", address: "Av. José Medeiros Vieira, 320 — Praia Brava", lat: -26.9620, lng: -48.6285, cep: "88306-000", instagram: "@deckbrava", cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80", tags: ["Beach Club", "DJ", "Pôr do sol"], price: 4, rating: 4.8 },
  { slug: "brava-burger-house", name: "Brava Burger House", type: "restaurant", city: "Itajaí", state: "SC", address: "R. Madre Maria Vilac, 980", lat: -26.9690, lng: -48.6320, cep: "88306-200", instagram: "@bravaburger", cover: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80", tags: ["Burger", "Craft beer"], price: 2, rating: 4.6 },
  { slug: "sereia-do-mar", name: "Sereia do Mar", type: "restaurant", city: "Itajaí", state: "SC", address: "R. das Conchas, 145 — Praia Brava", lat: -26.9645, lng: -48.6258, cep: "88306-100", instagram: "@sereiadomar", cover: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80", tags: ["Peixaria", "Frutos do mar"], price: 4, rating: 4.7 },

  // BALNEÁRIO CAMBORIÚ
  { slug: "green-valley-bc", name: "Green Valley", type: "club", city: "Balneário Camboriú", state: "SC", address: "R. 3500, 1147 — Centro", lat: -26.9900, lng: -48.6320, cep: "88330-300", instagram: "@greenvalleybr", cover: "https://images.unsplash.com/photo-1571266028243-d220bc183c00?w=1200&q=80", tags: ["Eletrônica", "Top 100 club do mundo"], price: 4, rating: 4.9 },
  { slug: "warung-beach-club", name: "Warung Beach Club (sede BC)", type: "club", city: "Balneário Camboriú", state: "SC", address: "Av. Atlântica, 4910 — Praia Brava sul", lat: -27.0080, lng: -48.6090, cep: "88339-000", instagram: "@warungclub", cover: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=1200&q=80", tags: ["Beach Club", "Eletrônica"], price: 4, rating: 4.9 },
  { slug: "cabana-da-praia-bc", name: "Cabana da Praia", type: "bar", city: "Balneário Camboriú", state: "SC", address: "Av. Atlântica, 1200 — Centro", lat: -26.9920, lng: -48.6280, cep: "88330-201", instagram: "@cabanadapraia.bc", cover: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200&q=80", tags: ["Pé na areia", "Chopp"], price: 2, rating: 4.4 },
  { slug: "sushi-yuko", name: "Sushi Yukô", type: "restaurant", city: "Balneário Camboriú", state: "SC", address: "R. 1500, 480", lat: -26.9940, lng: -48.6360, cep: "88330-410", instagram: "@sushiyuko", cover: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80", tags: ["Japonesa", "Sushi", "Omakase"], price: 4, rating: 4.8 },
  { slug: "moliere-music-bar", name: "Molière Music Bar", type: "show", city: "Balneário Camboriú", state: "SC", address: "R. 4000, 822 — Centro", lat: -26.9870, lng: -48.6300, cep: "88330-512", instagram: "@molierebc", cover: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=1200&q=80", tags: ["Música ao vivo", "MPB"], price: 3, rating: 4.5 },
  { slug: "barra-sul-cafe", name: "Barra Sul Café", type: "restaurant", city: "Balneário Camboriú", state: "SC", address: "R. 1001, 18 — Barra Sul", lat: -26.9990, lng: -48.6150, cep: "88339-470", instagram: "@barrasulcafe", cover: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80", tags: ["Brunch", "Café especial"], price: 2, rating: 4.7 },
  { slug: "neon-bc", name: "Neon Camboriú", type: "club", city: "Balneário Camboriú", state: "SC", address: "Av. das Flores, 230", lat: -26.9960, lng: -48.6260, cep: "88330-330", instagram: "@neon.bc", cover: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=1200&q=80", tags: ["After", "House"], price: 3, rating: 4.3 },

  // MEIA PRAIA / ITAPEMA
  { slug: "meia-praia-rooftop", name: "Meia Praia Rooftop", type: "lounge", city: "Itapema", state: "SC", address: "Av. Nereu Ramos, 920 — Meia Praia", lat: -27.1010, lng: -48.6120, cep: "88220-000", instagram: "@meiapraia.rooftop", cover: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80", tags: ["Rooftop", "Pôr do sol", "Drinks autorais"], price: 4, rating: 4.8 },
  { slug: "barra-do-camboriu", name: "Barra do Camboriú Bar", type: "bar", city: "Itapema", state: "SC", address: "Av. Vereador Antônio Boos, 2100", lat: -27.0960, lng: -48.6080, cep: "88220-100", instagram: "@barradocamboriu", cover: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&q=80", tags: ["Bar de praia", "Chopp"], price: 2, rating: 4.5 },
  { slug: "vila-mariscos", name: "Vila Mariscos", type: "restaurant", city: "Itapema", state: "SC", address: "R. Reinoldo Carlos Brand, 122 — Centro", lat: -27.0900, lng: -48.6100, cep: "88220-200", instagram: "@vilamariscos", cover: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80", tags: ["Mariscos", "Frutos do mar"], price: 3, rating: 4.6 },
  { slug: "praia-mansa-club", name: "Praia Mansa Club", type: "lounge", city: "Itapema", state: "SC", address: "Av. Beira Mar, 555 — Praia do Estaleiro", lat: -27.0480, lng: -48.6080, cep: "88330-940", instagram: "@praiamansa", cover: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1200&q=80", tags: ["Beach Club", "Família"], price: 4, rating: 4.7 },

  // BC ADICIONAIS
  { slug: "tropical-pier", name: "Tropical Pier", type: "bar", city: "Balneário Camboriú", state: "SC", address: "Av. Atlântica, 200 — Barra Norte", lat: -26.9750, lng: -48.6320, cep: "88330-120", instagram: "@tropicalpier", cover: "https://images.unsplash.com/photo-1574484184081-afea8a62f9c4?w=1200&q=80", tags: ["Pier", "Drinks", "Família"], price: 3, rating: 4.5 },
  { slug: "havana-club-bc", name: "Havana Music Club", type: "club", city: "Balneário Camboriú", state: "SC", address: "R. 1100, 60", lat: -26.9900, lng: -48.6240, cep: "88330-220", instagram: "@havanabc", cover: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200&q=80", tags: ["Latin", "Salsa", "Reggaeton"], price: 3, rating: 4.6 },
];

// Cardápios genéricos por tipo
const MENU_TEMPLATES = {
  bar: [
    { category: "Cerveja", name: "Chopp Pilsen 300ml", description: "Artesanal da casa", price: 1200 },
    { category: "Cerveja", name: "IPA 600ml", description: "Lúpulo intenso", price: 2400 },
    { category: "Drinks", name: "Caipirinha", description: "Cachaça artesanal e limão", price: 2200 },
    { category: "Drinks", name: "Moscow Mule", description: "Vodka, gengibre, limão", price: 2800 },
    { category: "Petiscos", name: "Batata frita", description: "Crispy com aioli", price: 2200 },
    { category: "Petiscos", name: "Iscas de tilápia", description: "Limão e tártaro", price: 4500 },
  ],
  restaurant: [
    { category: "Entradas", name: "Carpaccio de salmão", description: "Alcaparras e limão", price: 4800 },
    { category: "Entradas", name: "Ceviche", description: "Peixe branco do dia", price: 5800 },
    { category: "Pratos principais", name: "Risoto de camarão", description: "Camarão VG, arbóreo", price: 9800 },
    { category: "Pratos principais", name: "Peixe grelhado", description: "Pesca do dia, purê de batata-doce", price: 11500 },
    { category: "Pratos principais", name: "Massa al funghi", description: "Cogumelos frescos, parmesão", price: 6800 },
    { category: "Sobremesas", name: "Petit gâteau", description: "Sorvete de creme", price: 3200 },
  ],
  club: [
    { category: "Drinks", name: "Vodka energético", description: "Dose dupla", price: 3500 },
    { category: "Drinks", name: "Open de gin", description: "Gin tônica autoral", price: 4500 },
    { category: "Drinks", name: "Champagne", description: "Garrafa 750ml", price: 38000 },
    { category: "Shots", name: "Tequila dose", description: "Sal e limão", price: 1800 },
    { category: "Shots", name: "Jagermeister", description: "Gelado", price: 2200 },
  ],
  lounge: [
    { category: "Drinks autorais", name: "Pôr do Sol", description: "Gin, hibisco, lichia", price: 4800 },
    { category: "Drinks autorais", name: "Mar Brilho", description: "Vodka, blue curaçao, limão", price: 4500 },
    { category: "Drinks autorais", name: "Caipirinha gourmet", description: "Cachaça envelhecida", price: 3900 },
    { category: "Pratos principais", name: "Polvo grelhado", description: "Batatas confitadas", price: 12800 },
    { category: "Petiscos", name: "Ceviche", description: "Peixe branco, lima", price: 5800 },
    { category: "Sobremesas", name: "Brûlée de coco", description: "Açúcar caramelizado", price: 3200 },
  ],
  show: [
    { category: "Drinks", name: "Caipirinha", description: "Cachaça e limão", price: 2200 },
    { category: "Drinks", name: "Combo cerveja + dose", description: "Long neck + dose vodka", price: 3500 },
    { category: "Petiscos", name: "Mix de queijos", description: "Tábua pra 2", price: 5800 },
    { category: "Petiscos", name: "Bolinho de bacalhau", description: "6 unidades", price: 4200 },
  ],
};

async function run() {
  console.log(`\n📍 Inseridndo ${ESTABS.length} estabelecimentos...\n`);

  for (const e of ESTABS) {
    // 1. INSERT establishment
    const insertRes = await fetch(`${SUPA_URL}/rest/v1/establishments`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        slug: e.slug,
        name: e.name,
        type: e.type,
        city: e.city,
        state: e.state,
        address: e.address,
        cep: e.cep,
        rating: e.rating,
        review_count: Math.floor(Math.random() * 800) + 200,
        cover_url: e.cover,
        instagram: e.instagram,
        whatsapp: `(47) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        price_level: e.price,
        open_now: true,
        tags: e.tags,
        about: `${e.name} é um dos lugares mais queridos de ${e.city}.`,
      }),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      if (errText.includes("duplicate") || errText.includes("23505")) {
        console.log(`  ⏭️  ${e.name} já existe`);
        continue;
      }
      console.log(`  ❌ ${e.name}: ${insertRes.status} ${errText.slice(0, 100)}`);
      continue;
    }

    const [estab] = await insertRes.json();
    const id = estab.id;

    // 2. Seta geo
    await fetch(`${SUPA_URL}/rest/v1/rpc/set_establishment_geo`, {
      method: "POST",
      headers,
      body: JSON.stringify({ estab_id: id, lat: e.lat, lng: e.lng }),
    });

    // 3. Cardápio (template por tipo)
    const items = (MENU_TEMPLATES[e.type] || MENU_TEMPLATES.bar).map((m, i) => ({
      establishment_id: id,
      category: m.category,
      name: m.name,
      description: m.description,
      price_cents: m.price,
      position: i * 10,
      image_url: e.cover,
      available: true,
    }));

    await fetch(`${SUPA_URL}/rest/v1/menu_items`, {
      method: "POST",
      headers,
      body: JSON.stringify(items),
    });

    console.log(`  ✅ ${e.name.padEnd(40)} (${e.city}, ${items.length} itens)`);
  }

  console.log("\n🎉 Seed concluído!\n");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
