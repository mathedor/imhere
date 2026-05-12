import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export interface MenuItem {
  id: string;
  establishment_id: string;
  category: string;
  name: string;
  description: string | null;
  price_cents: number | null;
  image_url: string | null;
  position: number;
  available: boolean;
}

const MOCK_MENU: Record<string, MenuItem[]> = {
  "bravo-mar-beach-club": [
    { id: "m1", establishment_id: "bravo-mar-beach-club", category: "Drinks autorais", name: "Pôr do Sol", description: "Gin tônica com flor de hibisco, lichia e tônica artesanal", price_cents: 4800, image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80", position: 0, available: true },
    { id: "m2", establishment_id: "bravo-mar-beach-club", category: "Drinks autorais", name: "Bravo Spritz", description: "Aperol, prosecco, soda e laranja desidratada", price_cents: 4500, image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", position: 1, available: true },
    { id: "m3", establishment_id: "bravo-mar-beach-club", category: "Drinks autorais", name: "Caipirinha de Maracujá", description: "Cachaça envelhecida, polpa fresca e açúcar mascavo", price_cents: 3900, image_url: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&q=80", position: 2, available: true },
    { id: "m4", establishment_id: "bravo-mar-beach-club", category: "Pratos principais", name: "Polvo grelhado", description: "Polvo, batatas confitadas, pimentões e azeite trufado", price_cents: 12800, image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80", position: 10, available: true },
    { id: "m5", establishment_id: "bravo-mar-beach-club", category: "Pratos principais", name: "Risoto de camarão", description: "Camarões VG, arroz arbóreo, manteiga noisette", price_cents: 9800, image_url: "https://images.unsplash.com/photo-1633237308525-cd587cf71926?w=600&q=80", position: 11, available: true },
    { id: "m6", establishment_id: "bravo-mar-beach-club", category: "Pratos principais", name: "Pesca do dia", description: "Robalo grelhado, purê de couve-flor, alcaparras", price_cents: 11500, image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80", position: 12, available: true },
    { id: "m7", establishment_id: "bravo-mar-beach-club", category: "Petiscos", name: "Ceviche de peixe branco", description: "Lima, pimenta dedo-de-moça, batata-doce roxa", price_cents: 5800, image_url: "https://images.unsplash.com/photo-1574484184081-afea8a62f9c4?w=600&q=80", position: 20, available: true },
    { id: "m8", establishment_id: "bravo-mar-beach-club", category: "Petiscos", name: "Bolinho de bacalhau", description: "6 unidades, alioli de pimentão", price_cents: 4200, image_url: "https://images.unsplash.com/photo-1606756790138-261d2b21cd57?w=600&q=80", position: 21, available: true },
    { id: "m9", establishment_id: "bravo-mar-beach-club", category: "Sobremesas", name: "Crème brûlée de coco", description: "Creme de coco fresco, açúcar caramelizado", price_cents: 3200, image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80", position: 30, available: true },
    { id: "m10", establishment_id: "bravo-mar-beach-club", category: "Sobremesas", name: "Tortinha de limão", description: "Massa amanteigada, curd de limão e suspiro", price_cents: 2800, image_url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80", position: 31, available: true },
  ],
};

export async function listMenuByEstablishment(establishmentId: string): Promise<MenuItem[]> {
  if (isMockMode()) return MOCK_MENU[establishmentId] ?? [];

  const sb = await supabaseServer();
  const { data } = await sb
    .from("menu_items")
    .select("*")
    .eq("establishment_id", establishmentId)
    .eq("available", true)
    .order("position");
  return (data as MenuItem[] | null) ?? [];
}

export async function listMenuBySlug(slug: string): Promise<{
  establishment: { id: string; name: string; cover_url: string | null; instagram: string | null; city: string; state: string } | null;
  items: MenuItem[];
}> {
  if (isMockMode()) {
    return {
      establishment: {
        id: slug,
        name: slug === "bravo-mar-beach-club" ? "Bravo Mar Beach Club" : "Estabelecimento",
        cover_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
        instagram: "@bravomar.itajai",
        city: "Itajaí",
        state: "SC",
      },
      items: MOCK_MENU[slug] ?? [],
    };
  }

  const sb = await supabaseServer();
  const { data: estab } = await sb
    .from("establishments")
    .select("id, name, cover_url, instagram, city, state")
    .or(`id.eq.${slug},slug.eq.${slug}`)
    .maybeSingle();
  if (!estab) return { establishment: null, items: [] };

  const { data: items } = await sb
    .from("menu_items")
    .select("*")
    .eq("establishment_id", estab.id)
    .eq("available", true)
    .order("position");

  return { establishment: estab, items: (items as MenuItem[] | null) ?? [] };
}
