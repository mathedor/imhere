import { ChatListClient, type ConversationItem } from "@/components/chat/ChatListClient";
import { listMyConversations } from "@/lib/db/chat-queries";
import { isMockMode } from "@/lib/supabase/config";
import { conversations as mockConversations } from "@/data/conversations";
import { establishments as mockEstabs } from "@/data/establishments";
import { users as mockUsers } from "@/data/users";

export const dynamic = "force-dynamic";

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default async function ChatListPage() {
  let items: ConversationItem[];

  if (isMockMode()) {
    items = mockConversations
      .map((c): ConversationItem | null => {
        const other = mockUsers.find((u) => c.participantIds.includes(u.id) && u.id !== "u-me");
        const place = mockEstabs.find((e) => e.id === c.establishmentId);
        if (!other) return null;
        return {
          id: c.id,
          otherName: other.name,
          otherPhoto: other.photo,
          estabName: place?.name ?? null,
          lastBody: c.lastMessage.body,
          lastType: c.lastMessage.type,
          lastFromMe: c.lastMessage.senderId === "u-me",
          lastTime: c.lastMessage.createdAt,
          unread: c.unread,
        };
      })
      .filter((i): i is ConversationItem => !!i);
  } else {
    const convs = await listMyConversations();
    items = convs.map((c) => ({
      id: c.id,
      otherName: c.otherUser.name,
      otherPhoto: c.otherUser.photo,
      estabName: c.establishment?.name ?? null,
      lastBody: c.lastMessage?.body ?? "Conversa iniciada",
      lastType: c.lastMessage?.type ?? "text",
      lastFromMe: c.lastMessage ? c.lastMessage.senderId !== c.otherUser.id : false,
      lastTime: c.lastMessage ? fmtTime(c.lastMessage.createdAt) : "",
      unread: c.unreadCount,
    }));
  }

  return <ChatListClient items={items} />;
}
