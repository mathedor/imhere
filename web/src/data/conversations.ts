export type MessageType = "text" | "image" | "audio" | "link";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  body: string;
  imageUrl?: string;
  audioDurationSec?: number;
  linkPreview?: { title: string; url: string };
  createdAt: string;
  status: "sent" | "delivered" | "read";
}

export interface Conversation {
  id: string;
  participantIds: string[];
  establishmentId: string;
  startedAt: string;
  lastMessage: Message;
  unread: number;
}

export const conversations: Conversation[] = [
  {
    id: "conv-mari",
    participantIds: ["u-me", "u-mari"],
    establishmentId: "lume-rooftop",
    startedAt: "21:48",
    unread: 2,
    lastMessage: {
      id: "m1",
      conversationId: "conv-mari",
      senderId: "u-mari",
      type: "text",
      body: "Que cara legal! Esse drink que você pediu é o que?",
      createdAt: "22:14",
      status: "delivered",
    },
  },
  {
    id: "conv-rafa",
    participantIds: ["u-me", "u-rafa"],
    establishmentId: "noir-club",
    startedAt: "22:02",
    unread: 0,
    lastMessage: {
      id: "m2",
      conversationId: "conv-rafa",
      senderId: "u-me",
      type: "audio",
      body: "Áudio · 0:14",
      audioDurationSec: 14,
      createdAt: "22:08",
      status: "read",
    },
  },
  {
    id: "conv-julia",
    participantIds: ["u-me", "u-julia"],
    establishmentId: "palco-arena",
    startedAt: "23:01",
    unread: 1,
    lastMessage: {
      id: "m3",
      conversationId: "conv-julia",
      senderId: "u-julia",
      type: "image",
      body: "Foto enviada",
      imageUrl: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=400&q=70",
      createdAt: "23:12",
      status: "delivered",
    },
  },
  {
    id: "conv-carol",
    participantIds: ["u-me", "u-carol"],
    establishmentId: "kazoku-omakase",
    startedAt: "20:30",
    unread: 0,
    lastMessage: {
      id: "m4",
      conversationId: "conv-carol",
      senderId: "u-carol",
      type: "text",
      body: "Pode ser semana que vem! Onde você sugere?",
      createdAt: "21:15",
      status: "read",
    },
  },
];

export const messagesByConversation: Record<string, Message[]> = {
  "conv-mari": [
    {
      id: "mm1",
      conversationId: "conv-mari",
      senderId: "u-me",
      type: "text",
      body: "Oi Mariana! Vi que você também tá no Lume hoje 🍸",
      createdAt: "21:50",
      status: "read",
    },
    {
      id: "mm2",
      conversationId: "conv-mari",
      senderId: "u-mari",
      type: "text",
      body: "Oi! Sim, primeira vez aqui. Tá lotado hein",
      createdAt: "21:53",
      status: "read",
    },
    {
      id: "mm3",
      conversationId: "conv-mari",
      senderId: "u-me",
      type: "text",
      body: "Bastante! Tô sentado perto da pista lateral, ambiente bom",
      createdAt: "21:55",
      status: "read",
    },
    {
      id: "mm4",
      conversationId: "conv-mari",
      senderId: "u-mari",
      type: "text",
      body: "Vou dar uma volta por aí daqui a pouco",
      createdAt: "22:02",
      status: "read",
    },
    {
      id: "mm5",
      conversationId: "conv-mari",
      senderId: "u-me",
      type: "image",
      body: "Foto",
      imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=70",
      createdAt: "22:08",
      status: "read",
    },
    {
      id: "mm6",
      conversationId: "conv-mari",
      senderId: "u-mari",
      type: "text",
      body: "Que cara legal! Esse drink que você pediu é o que?",
      createdAt: "22:14",
      status: "delivered",
    },
  ],
};
