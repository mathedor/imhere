import { notFound } from "next/navigation";
import { ChatClient } from "@/components/chat/ChatClient";
import { getConversationContext } from "@/lib/db/chat-queries";
import { isMockMode } from "@/lib/supabase/config";
import { conversations, messagesByConversation } from "@/data/conversations";
import { users as mockUsers } from "@/data/users";
import { establishments as mockEstabs } from "@/data/establishments";
import type { Message as DBMessage } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (isMockMode()) {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) notFound();
    const other = mockUsers.find((u) => conv.participantIds.includes(u.id) && u.id !== "u-me");
    if (!other) notFound();
    const place = mockEstabs.find((e) => e.id === conv.establishmentId) ?? null;
    const initialMessages: DBMessage[] = (messagesByConversation[conv.id] ?? []).map((m) => ({
      id: m.id,
      conversation_id: m.conversationId,
      sender_id: m.senderId,
      type: m.type,
      body: m.body,
      media_url: m.imageUrl ?? null,
      audio_duration_sec: m.audioDurationSec ?? null,
      link_url: null,
      link_title: null,
      status: m.status,
      blocked_reason: null,
      created_at: new Date().toISOString(),
    }));

    return (
      <ChatClient
        conversationId={conv.id}
        currentUserId="u-me"
        otherUser={{
          id: other.id,
          name: other.name,
          photo: other.photo,
          profession: other.profession,
        }}
        establishment={
          place ? { id: place.id, name: place.name, city: place.city, state: place.state } : null
        }
        initialMessages={initialMessages}
        startedAt={`às ${conv.startedAt}`}
      />
    );
  }

  const ctx = await getConversationContext(id);
  if (!ctx) notFound();

  return (
    <ChatClient
      conversationId={ctx.id}
      currentUserId={ctx.currentUserId}
      otherUser={ctx.otherUser}
      establishment={ctx.establishment}
      initialMessages={ctx.messages as DBMessage[]}
    />
  );
}
