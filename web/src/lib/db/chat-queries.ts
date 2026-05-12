import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export interface ConversationListItem {
  id: string;
  otherUser: {
    id: string;
    name: string;
    photo: string | null;
  };
  establishment: {
    id: string;
    name: string;
    city: string;
    state: string;
  } | null;
  lastMessage: {
    body: string;
    type: string;
    senderId: string;
    createdAt: string;
    status: string;
  } | null;
  unreadCount: number;
}

export async function listMyConversations(): Promise<ConversationListItem[]> {
  if (isMockMode()) return [];
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return [];

  const { data: convs } = await sb
    .from("conversations")
    .select(`
      id,
      participants,
      establishment_id,
      last_message_at,
      establishments(id, name, city, state)
    `)
    .contains("participants", [user.id])
    .order("last_message_at", { ascending: false })
    .limit(50);

  if (!convs || convs.length === 0) return [];

  // Carrega outras informações em paralelo
  const otherIds = convs
    .map((c) => (c.participants as string[]).find((p) => p !== user.id))
    .filter((id): id is string => !!id);

  const [{ data: profiles }, { data: lastMessages }] = await Promise.all([
    sb.from("profiles").select("id, name, photo_url").in("id", otherIds),
    sb
      .from("messages")
      .select("conversation_id, body, type, sender_id, created_at, status")
      .in(
        "conversation_id",
        convs.map((c) => c.id)
      )
      .order("created_at", { ascending: false }),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const lastMsgMap = new Map<string, (typeof lastMessages)[number]>();
  for (const m of lastMessages ?? []) {
    if (!lastMsgMap.has(m.conversation_id)) lastMsgMap.set(m.conversation_id, m);
  }

  return convs.map((c) => {
    const otherId = (c.participants as string[]).find((p) => p !== user.id) ?? "";
    const other = profileMap.get(otherId);
    const last = lastMsgMap.get(c.id);
    const estab = c.establishments as { id: string; name: string; city: string; state: string } | null;

    return {
      id: c.id,
      otherUser: {
        id: otherId,
        name: other?.name ?? "Usuário",
        photo: other?.photo_url ?? null,
      },
      establishment: estab,
      lastMessage: last
        ? {
            body: last.body ?? "",
            type: last.type,
            senderId: last.sender_id,
            createdAt: last.created_at,
            status: last.status,
          }
        : null,
      unreadCount: 0,
    };
  });
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: string;
  body: string | null;
  media_url: string | null;
  status: string;
  created_at: string;
}

export interface ConversationContext {
  id: string;
  otherUser: {
    id: string;
    name: string;
    photo: string | null;
    profession: string | null;
  };
  establishment: { id: string; name: string; city: string; state: string } | null;
  messages: ChatMessage[];
  currentUserId: string;
}

export async function getConversationContext(conversationId: string): Promise<ConversationContext | null> {
  if (isMockMode()) return null;
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data: conv } = await sb
    .from("conversations")
    .select(`id, participants, establishments(id, name, city, state)`)
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv) return null;

  const otherId = (conv.participants as string[]).find((p) => p !== user.id) ?? "";
  const { data: other } = await sb
    .from("profiles")
    .select("id, name, photo_url, profession")
    .eq("id", otherId)
    .maybeSingle();

  const { data: messages } = await sb
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at");

  return {
    id: conv.id,
    otherUser: {
      id: otherId,
      name: other?.name ?? "Usuário",
      photo: other?.photo_url ?? null,
      profession: other?.profession ?? null,
    },
    establishment: (conv.establishments as ConversationContext["establishment"]) ?? null,
    messages: (messages as ChatMessage[] | null) ?? [],
    currentUserId: user.id,
  };
}
