export type EstablishmentType = "bar" | "restaurant" | "club" | "show" | "lounge";

export interface MobileEstablishment {
  id: string;
  name: string;
  type: EstablishmentType;
  city: string;
  state: string;
  address: string;
  distanceKm: number;
  rating: number;
  cover: string;
  presentNow: number;
  presentMale: number;
  presentFemale: number;
  tags: string[];
  openNow: boolean;
  hasMomento: boolean;
  instagram?: string;
}

export const typeLabel: Record<EstablishmentType, string> = {
  bar: "Bar",
  restaurant: "Restaurante",
  club: "Balada",
  show: "Casa de show",
  lounge: "Lounge",
};

export const mobileEstablishments: MobileEstablishment[] = [
  {
    id: "lume-rooftop",
    name: "Lume Rooftop",
    type: "lounge",
    city: "São Paulo",
    state: "SP",
    address: "R. Oscar Freire, 837",
    distanceKm: 0.4,
    rating: 4.8,
    cover: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
    presentNow: 187,
    presentMale: 84,
    presentFemale: 99,
    tags: ["Rooftop", "DJ ao vivo"],
    openNow: true,
    hasMomento: true,
    instagram: "@lume.rooftop",
  },
  {
    id: "noir-club",
    name: "Noir Club",
    type: "club",
    city: "São Paulo",
    state: "SP",
    address: "R. Augusta, 2690",
    distanceKm: 1.2,
    rating: 4.6,
    cover: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80",
    presentNow: 412,
    presentMale: 198,
    presentFemale: 205,
    tags: ["Techno", "After"],
    openNow: true,
    hasMomento: true,
  },
  {
    id: "boteco-da-vila",
    name: "Boteco da Vila",
    type: "bar",
    city: "São Paulo",
    state: "SP",
    address: "R. Fradique Coutinho, 1154",
    distanceKm: 0.8,
    rating: 4.7,
    cover: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80",
    presentNow: 64,
    presentMale: 38,
    presentFemale: 24,
    tags: ["Chopp", "Samba"],
    openNow: true,
    hasMomento: false,
  },
  {
    id: "palco-arena",
    name: "Palco Arena",
    type: "show",
    city: "São Paulo",
    state: "SP",
    address: "Av. das Nações Unidas, 17955",
    distanceKm: 4.3,
    rating: 4.5,
    cover: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&q=80",
    presentNow: 1842,
    presentMale: 904,
    presentFemale: 901,
    tags: ["Show ao vivo"],
    openNow: true,
    hasMomento: false,
  },
  {
    id: "neon-after",
    name: "Neon After",
    type: "club",
    city: "São Paulo",
    state: "SP",
    address: "R. Pamplona, 1473",
    distanceKm: 2.4,
    rating: 4.2,
    cover: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&q=80",
    presentNow: 624,
    presentMale: 312,
    presentFemale: 298,
    tags: ["After", "House"],
    openNow: true,
    hasMomento: true,
  },
  {
    id: "kazoku-omakase",
    name: "Kazoku Omakase",
    type: "restaurant",
    city: "São Paulo",
    state: "SP",
    address: "Al. Lorena, 1234",
    distanceKm: 0.6,
    rating: 4.9,
    cover: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
    presentNow: 28,
    presentMale: 14,
    presentFemale: 13,
    tags: ["Japonesa", "Omakase"],
    openNow: true,
    hasMomento: false,
  },
];

export interface MobileUser {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  status: "open" | "watching" | "invisible";
  photo: string;
  bio: string;
  profession: string;
  instagram?: string;
  checkedInAt?: string;
}

export const mobileUsers: MobileUser[] = [
  { id: "u-mari", name: "Mariana Costa", age: 27, gender: "female", status: "open", photo: "https://i.pravatar.cc/300?img=47", bio: "Designer UX. Adoro rooftops e drinks autorais.", profession: "Designer UX", instagram: "@maricostac", checkedInAt: "21:34" },
  { id: "u-lucas", name: "Lucas Andrade", age: 31, gender: "male", status: "open", photo: "https://i.pravatar.cc/300?img=12", bio: "Founder Tech, viajante.", profession: "Founder", instagram: "@lucas.andr", checkedInAt: "22:10" },
  { id: "u-bea", name: "Beatriz Lima", age: 25, gender: "female", status: "watching", photo: "https://i.pravatar.cc/300?img=44", bio: "Fotógrafa autônoma.", profession: "Fotógrafa", checkedInAt: "20:58" },
  { id: "u-rafa", name: "Rafael Mendes", age: 29, gender: "male", status: "open", photo: "https://i.pravatar.cc/300?img=33", bio: "DJ e dev backend.", profession: "Dev Backend", checkedInAt: "21:47" },
  { id: "u-carol", name: "Carolina Reis", age: 26, gender: "female", status: "open", photo: "https://i.pravatar.cc/300?img=48", bio: "Médica, enogastronomia.", profession: "Médica", instagram: "@carolreis_", checkedInAt: "22:22" },
  { id: "u-julia", name: "Júlia Carvalho", age: 24, gender: "female", status: "open", photo: "https://i.pravatar.cc/300?img=49", bio: "Jornalista, livros e festas.", profession: "Jornalista", instagram: "@juhcrv", checkedInAt: "22:55" },
];

export const presentByEstab: Record<string, string[]> = {
  "lume-rooftop": ["u-mari", "u-lucas", "u-bea", "u-rafa", "u-carol", "u-julia"],
  "noir-club": ["u-rafa", "u-lucas"],
  "boteco-da-vila": ["u-lucas", "u-rafa"],
  "neon-after": ["u-rafa", "u-julia"],
  "palco-arena": ["u-mari", "u-julia", "u-bea"],
  "kazoku-omakase": ["u-carol"],
};
