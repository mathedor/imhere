/**
 * Tipos gerados a partir do schema Supabase (versão simplificada).
 * Em produção, regenere com: npx supabase gen types typescript --project-id=XYZ > types.ts
 */

export type UserRole = "user" | "establishment" | "sales" | "admin";
export type UserStatus = "open" | "watching" | "invisible";
export type UserGender = "male" | "female" | "other" | "na";
export type EstablishmentType = "bar" | "restaurant" | "club" | "show" | "lounge";
export type CheckinStatus = "active" | "left" | "expired";
export type MessageType = "text" | "image" | "audio" | "link" | "system";
export type MessageStatus = "sent" | "delivered" | "read" | "blocked";
export type ContactRequestStatus = "pending" | "accepted" | "rejected" | "expired";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "unpaid";
export type SubscriptionTarget = "user" | "establishment";
export type PaymentMethod = "pix" | "credit_card" | "debit_card" | "boleto";
export type CourtesyStatus = "sent" | "delivered" | "redeemed" | "expired";

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  birth_date: string | null;
  gender: UserGender | null;
  profession: string | null;
  bio: string | null;
  photo_url: string | null;
  status: UserStatus;
  city: string | null;
  state: string | null;
  current_plan_id: string | null;
  verified_at: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Establishment {
  id: string;
  owner_id: string | null;
  sales_agent_id: string | null;
  slug: string | null;
  name: string;
  type: EstablishmentType;
  city: string;
  state: string;
  address: string;
  cep: string | null;
  cnpj: string | null;
  capacity: number | null;
  rating: number;
  review_count: number;
  cover_url: string | null;
  whatsapp: string | null;
  instagram: string | null;
  reservation_url: string | null;
  menu_url: string | null;
  about: string | null;
  price_level: number;
  open_now: boolean;
  tags: string[];
  perks_active: string[];
  created_at: string;
  updated_at: string;
}

export interface Checkin {
  id: string;
  profile_id: string;
  establishment_id: string;
  status: CheckinStatus;
  checked_in_at: string;
  checked_out_at: string | null;
  expires_at: string;
}

export interface Moment {
  id: string;
  establishment_id: string;
  image_url: string;
  caption: string | null;
  views_count: number;
  posted_at: string;
  expires_at: string;
}

export interface ContactRequest {
  id: string;
  from_profile_id: string;
  to_profile_id: string;
  establishment_id: string;
  status: ContactRequestStatus;
  created_at: string;
  responded_at: string | null;
}

export interface Conversation {
  id: string;
  establishment_id: string | null;
  contact_request_id: string | null;
  participants: string[];
  started_at: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: MessageType;
  body: string | null;
  media_url: string | null;
  audio_duration_sec: number | null;
  link_url: string | null;
  link_title: string | null;
  status: MessageStatus;
  blocked_reason: string | null;
  created_at: string;
}

export interface Plan {
  id: string;
  target: SubscriptionTarget;
  code: string;
  name: string;
  tagline: string | null;
  monthly_price_cents: number;
  annual_price_cents: number;
  features: { label: string; included: boolean }[];
  highlight: boolean;
  active: boolean;
  sort_order: number;
}

export interface Subscription {
  id: string;
  profile_id: string | null;
  establishment_id: string | null;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: "monthly" | "annual";
  amount_cents: number;
  method: PaymentMethod | null;
  efi_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  subscription_id: string | null;
  profile_id: string | null;
  establishment_id: string | null;
  amount_cents: number;
  method: PaymentMethod;
  status: string;
  efi_charge_id: string | null;
  efi_pix_qr: string | null;
  efi_pix_code: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface Courtesy {
  id: string;
  establishment_id: string;
  to_profile_id: string;
  kind: string;
  title: string;
  message: string | null;
  status: CourtesyStatus;
  expires_at: string | null;
  redeemed_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NearbyEstablishment extends Omit<Establishment, "geo" | "created_at" | "updated_at"> {
  distance_km: number | null;
  present_count: number;
  present_male: number;
  present_female: number;
  has_momento: boolean;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; email: string; name: string }; Update: Partial<Profile> };
      establishments: { Row: Establishment; Insert: Partial<Establishment> & { name: string; city: string; state: string; address: string }; Update: Partial<Establishment> };
      checkins: { Row: Checkin; Insert: Partial<Checkin> & { profile_id: string; establishment_id: string }; Update: Partial<Checkin> };
      moments: { Row: Moment; Insert: Partial<Moment> & { establishment_id: string; image_url: string }; Update: Partial<Moment> };
      contact_requests: { Row: ContactRequest; Insert: Partial<ContactRequest> & { from_profile_id: string; to_profile_id: string; establishment_id: string }; Update: Partial<ContactRequest> };
      conversations: { Row: Conversation; Insert: Partial<Conversation> & { participants: string[] }; Update: Partial<Conversation> };
      messages: { Row: Message; Insert: Partial<Message> & { conversation_id: string; sender_id: string }; Update: Partial<Message> };
      plans: { Row: Plan; Insert: Partial<Plan> & { code: string; name: string; target: SubscriptionTarget; monthly_price_cents: number; annual_price_cents: number }; Update: Partial<Plan> };
      subscriptions: { Row: Subscription; Insert: Partial<Subscription> & { plan_id: string; amount_cents: number; billing_cycle: "monthly" | "annual" }; Update: Partial<Subscription> };
      payments: { Row: Payment; Insert: Partial<Payment> & { amount_cents: number; method: PaymentMethod }; Update: Partial<Payment> };
      courtesies: { Row: Courtesy; Insert: Partial<Courtesy> & { establishment_id: string; to_profile_id: string; kind: string; title: string }; Update: Partial<Courtesy> };
      notifications: { Row: Notification; Insert: Partial<Notification> & { profile_id: string; kind: string; title: string }; Update: Partial<Notification> };
    };
    Views: {};
    Functions: {
      nearby_establishments: { Args: { user_lat: number; user_lng: number; radius_km?: number; sort?: string }; Returns: NearbyEstablishment[] };
      do_checkin: { Args: { estab_id: string }; Returns: string };
      do_checkout: { Args: Record<string, never>; Returns: void };
      respond_contact_request: { Args: { req_id: string; accept: boolean }; Returns: string | null };
      redeem_courtesy: { Args: { courtesy_id: string }; Returns: void };
    };
    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
      user_gender: UserGender;
      establishment_type: EstablishmentType;
    };
  };
}
