export type EstablishmentType = "bar" | "restaurant" | "club" | "show" | "lounge";

export interface Establishment {
  id: string;
  name: string;
  type: EstablishmentType;
  city: string;
  state: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  cover: string;
  presentNow: number;
  presentByGender: { male: number; female: number; other: number };
  tags: string[];
  priceLevel: 1 | 2 | 3 | 4;
  openNow: boolean;
  instagram?: string;
  hasMomento?: boolean;
}

export interface MomentoPost {
  id: string;
  establishmentId: string;
  imageUrl: string;
  caption?: string;
  postedAt: string;
  expiresInMin: number;
  views: number;
}

export const momentoByEstablishment: Record<string, MomentoPost[]> = {
  "lume-rooftop": [
    {
      id: "mt-1",
      establishmentId: "lume-rooftop",
      imageUrl: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80",
      caption: "Pista lateral lotada agora 🔥",
      postedAt: "22:18",
      expiresInMin: 142,
      views: 84,
    },
    {
      id: "mt-2",
      establishmentId: "lume-rooftop",
      imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80",
      caption: "DJ Lara no comando",
      postedAt: "22:42",
      expiresInMin: 178,
      views: 32,
    },
  ],
  "noir-club": [
    {
      id: "mt-3",
      establishmentId: "noir-club",
      imageUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&q=80",
      caption: "Open bar liberado até 1h",
      postedAt: "23:05",
      expiresInMin: 220,
      views: 215,
    },
  ],
  "neon-after": [
    {
      id: "mt-4",
      establishmentId: "neon-after",
      imageUrl: "https://images.unsplash.com/photo-1571266028243-de17a1d7c98c?w=800&q=80",
      caption: "After começando agora",
      postedAt: "23:40",
      expiresInMin: 250,
      views: 188,
    },
  ],
  "bravo-mar-beach-club": [
    {
      id: "mt-5",
      establishmentId: "bravo-mar-beach-club",
      imageUrl: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=800&q=80",
      caption: "Pôr do sol no Bravo Mar 🌅",
      postedAt: "18:42",
      expiresInMin: 215,
      views: 312,
    },
    {
      id: "mt-6",
      establishmentId: "bravo-mar-beach-club",
      imageUrl: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80",
      caption: "DJ Lara comandando a pista 🎧",
      postedAt: "21:08",
      expiresInMin: 175,
      views: 184,
    },
  ],
};

export const establishments: Establishment[] = [
  {
    id: "lume-rooftop",
    name: "Lume Rooftop",
    type: "lounge",
    city: "São Paulo",
    state: "SP",
    address: "R. Oscar Freire, 837 — Jardins",
    distanceKm: 0.4,
    rating: 4.8,
    reviewCount: 1284,
    cover: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
    presentNow: 187,
    presentByGender: { male: 84, female: 99, other: 4 },
    tags: ["Rooftop", "Drinks autorais", "DJ ao vivo"],
    priceLevel: 4,
    openNow: true,
    instagram: "@lume.rooftop",
  },
  {
    id: "noir-club",
    name: "Noir Club",
    type: "club",
    city: "São Paulo",
    state: "SP",
    address: "R. Augusta, 2690 — Consolação",
    distanceKm: 1.2,
    rating: 4.6,
    reviewCount: 3421,
    cover: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80",
    presentNow: 412,
    presentByGender: { male: 198, female: 205, other: 9 },
    tags: ["Techno", "Open bar", "After"],
    priceLevel: 3,
    openNow: true,
    instagram: "@lume.rooftop",
  },
  {
    id: "boteco-da-vila",
    name: "Boteco da Vila",
    type: "bar",
    city: "São Paulo",
    state: "SP",
    address: "R. Fradique Coutinho, 1154 — Vila Madalena",
    distanceKm: 0.8,
    rating: 4.7,
    reviewCount: 892,
    cover: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80",
    presentNow: 64,
    presentByGender: { male: 38, female: 24, other: 2 },
    tags: ["Chopp gelado", "Petiscos", "Samba"],
    priceLevel: 2,
    openNow: true,
    instagram: "@lume.rooftop",
  },
  {
    id: "kazoku-omakase",
    name: "Kazoku Omakase",
    type: "restaurant",
    city: "São Paulo",
    state: "SP",
    address: "Al. Lorena, 1234 — Jardins",
    distanceKm: 0.6,
    rating: 4.9,
    reviewCount: 567,
    cover: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
    presentNow: 28,
    presentByGender: { male: 14, female: 13, other: 1 },
    tags: ["Japonesa", "Omakase", "Sake bar"],
    priceLevel: 4,
    openNow: true,
    instagram: "@lume.rooftop",
  },
  {
    id: "palco-arena",
    name: "Palco Arena",
    type: "show",
    city: "São Paulo",
    state: "SP",
    address: "Av. das Nações Unidas, 17955 — Vila Almeida",
    distanceKm: 4.3,
    rating: 4.5,
    reviewCount: 2104,
    cover: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&q=80",
    presentNow: 1842,
    presentByGender: { male: 904, female: 901, other: 37 },
    tags: ["Show ao vivo", "Hoje: Tribalistas"],
    priceLevel: 3,
    openNow: true,
    instagram: "@lume.rooftop",
  },
  {
    id: "mar-azul",
    name: "Mar Azul Cocktails",
    type: "bar",
    city: "Florianópolis",
    state: "SC",
    address: "Av. Beira Mar Norte, 2300 — Centro",
    distanceKm: 2.1,
    rating: 4.4,
    reviewCount: 712,
    cover: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80",
    presentNow: 92,
    presentByGender: { male: 48, female: 42, other: 2 },
    tags: ["Vista pro mar", "Drinks", "Pôr do sol"],
    priceLevel: 3,
    openNow: true,
    instagram: "@lume.rooftop",
  },
  {
    id: "subsolo-bar",
    name: "Subsolo Bar",
    type: "bar",
    city: "São Paulo",
    state: "SP",
    address: "R. Aspicuelta, 645 — Vila Madalena",
    distanceKm: 1.0,
    rating: 4.3,
    reviewCount: 1023,
    cover: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80",
    presentNow: 145,
    presentByGender: { male: 78, female: 64, other: 3 },
    tags: ["Indie rock", "Cervejaria", "Vinil"],
    priceLevel: 2,
    openNow: true,
    instagram: "@lume.rooftop",
  },
  {
    id: "trattoria-fellini",
    name: "Trattoria Fellini",
    type: "restaurant",
    city: "São Paulo",
    state: "SP",
    address: "R. dos Pinheiros, 590 — Pinheiros",
    distanceKm: 1.5,
    rating: 4.7,
    reviewCount: 856,
    cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    presentNow: 42,
    presentByGender: { male: 19, female: 22, other: 1 },
    tags: ["Italiana", "Família", "Vinhos"],
    priceLevel: 3,
    openNow: true,
    instagram: "@lume.rooftop",
  },
  {
    id: "neon-after",
    name: "Neon After",
    type: "club",
    city: "São Paulo",
    state: "SP",
    address: "R. Pamplona, 1473 — Jardim Paulista",
    distanceKm: 2.4,
    rating: 4.2,
    reviewCount: 2890,
    cover: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&q=80",
    presentNow: 624,
    presentByGender: { male: 312, female: 298, other: 14 },
    tags: ["After hours", "House", "LGBTQ+"],
    priceLevel: 3,
    openNow: true,
    instagram: "@lume.rooftop",
  },
  {
    id: "bravo-mar-beach-club",
    name: "Bravo Mar Beach Club",
    type: "lounge",
    city: "Itajaí",
    state: "SC",
    address: "Av. José Medeiros Vieira, 100 — Praia Brava",
    distanceKm: 0.8,
    rating: 4.8,
    reviewCount: 612,
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
    presentNow: 248,
    presentByGender: { male: 124, female: 118, other: 6 },
    tags: ["Beach Club", "Pôr do sol", "DJ ao vivo", "Drinks autorais"],
    priceLevel: 4,
    openNow: true,
    instagram: "@bravomar.itajai",
  },
  {
    id: "horto-cafe",
    name: "Horto Café",
    type: "restaurant",
    city: "São Paulo",
    state: "SP",
    address: "R. Harmonia, 234 — Vila Madalena",
    distanceKm: 1.1,
    rating: 4.6,
    reviewCount: 421,
    cover: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
    presentNow: 38,
    presentByGender: { male: 16, female: 21, other: 1 },
    tags: ["Brunch", "Cafeteria", "Pet friendly"],
    priceLevel: 2,
    openNow: true,
    instagram: "@lume.rooftop",
  },
];

export const typeLabel: Record<EstablishmentType, string> = {
  bar: "Bar",
  restaurant: "Restaurante",
  club: "Balada",
  show: "Casa de show",
  lounge: "Lounge",
};
