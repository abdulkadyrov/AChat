import type {
  AuthSession,
  Chat,
  ChatInvite,
  Family,
  FamilyMember,
  Message,
  UserProfile
} from "@/shared/types/domain";
import { buildInviteToken } from "@/shared/lib/invite/token";

export const demoUsers: UserProfile[] = [
  {
    id: "user-papa",
    name: "Папа",
    avatarUrl: "https://i.pravatar.cc/120?img=15",
    phone: "+7 900 123-45-67",
    about: "Всем добра! 😊",
    createdAt: "2026-06-10T09:00:00.000Z"
  },
  {
    id: "user-mama",
    name: "Мама",
    avatarUrl: "https://i.pravatar.cc/120?img=32",
    phone: "+7 900 333-12-90",
    about: "Спасибо, сынок! ❤️",
    createdAt: "2026-06-10T09:00:00.000Z"
  },
  {
    id: "user-brother",
    name: "Брат",
    avatarUrl: "https://i.pravatar.cc/120?img=12",
    phone: "+7 900 700-11-22",
    about: "Хорошо 👍",
    createdAt: "2026-06-10T09:00:00.000Z"
  },
  {
    id: "user-sister",
    name: "Сестра",
    avatarUrl: "https://i.pravatar.cc/120?img=5",
    phone: "+7 900 555-61-88",
    about: "На связи",
    createdAt: "2026-06-10T09:00:00.000Z"
  }
];

export const currentUser = demoUsers[0];

export const demoSession: AuthSession = {
  accessToken: "demo-access-token",
  refreshToken: "demo-refresh-token",
  expiresAt: Date.now() + 1000 * 60 * 60
};

export const demoFamily: Family = {
  id: "family-main",
  name: "Семья",
  ownerId: currentUser.id,
  inviteCode: "ACHAT-FAMILY-2026"
};

export const demoMembers: FamilyMember[] = [
  {
    id: "member-1",
    familyId: demoFamily.id,
    userId: currentUser.id,
    role: "owner",
    status: "online"
  },
  {
    id: "member-2",
    familyId: demoFamily.id,
    userId: "user-mama",
    role: "member",
    status: "online"
  },
  {
    id: "member-3",
    familyId: demoFamily.id,
    userId: "user-brother",
    role: "member",
    status: "recently"
  },
  {
    id: "member-4",
    familyId: demoFamily.id,
    userId: "user-sister",
    role: "member",
    status: "online"
  }
];

export const demoChats: Chat[] = [
  {
    id: "chat-family",
    familyId: demoFamily.id,
    type: "group",
    title: "Семья",
    subtitle: "Мама: Привет! Как дела?",
    avatarGroup: [
      "https://i.pravatar.cc/80?img=15",
      "https://i.pravatar.cc/80?img=32",
      "https://i.pravatar.cc/80?img=12"
    ],
    unreadCount: 2,
    lastMessageAt: "2026-06-20T12:30:00.000Z",
    ownerId: currentUser.id,
    participantIds: [currentUser.id, "user-mama", "user-brother"],
    participantPhones: ["79001234567", "79003331290", "79007001122"],
    memberLimit: 4,
    inviteId: "invite-family",
    targetPhone: null,
    messageTtl: "7d"
  },
  {
    id: "chat-mama",
    familyId: demoFamily.id,
    type: "direct",
    title: "Мама",
    subtitle: "Спасибо, сынок! ❤️",
    avatarGroup: ["https://i.pravatar.cc/80?img=32"],
    unreadCount: 1,
    lastMessageAt: "2026-06-20T11:20:00.000Z",
    ownerId: currentUser.id,
    participantIds: [currentUser.id, "user-mama"],
    participantPhones: ["79001234567", "79003331290"],
    memberLimit: 1,
    inviteId: "invite-mama",
    targetPhone: "+79003331290",
    messageTtl: "7d"
  },
  {
    id: "chat-brother",
    familyId: demoFamily.id,
    type: "direct",
    title: "Брат",
    subtitle: "Хорошо 👍",
    avatarGroup: ["https://i.pravatar.cc/80?img=12"],
    unreadCount: 0,
    lastMessageAt: "2026-06-20T10:05:00.000Z",
    ownerId: currentUser.id,
    participantIds: [currentUser.id, "user-brother"],
    participantPhones: ["79001234567", "79007001122"],
    memberLimit: 1,
    inviteId: "invite-brother",
    targetPhone: "+79007001122",
    messageTtl: "7d"
  },
  {
    id: "chat-sister",
    familyId: demoFamily.id,
    type: "direct",
    title: "Сестра",
    subtitle: "Отправила фото",
    avatarGroup: ["https://i.pravatar.cc/80?img=5"],
    unreadCount: 0,
    lastMessageAt: "2026-06-20T09:30:00.000Z",
    ownerId: currentUser.id,
    participantIds: [currentUser.id, "user-sister"],
    participantPhones: ["79001234567", "79005556188"],
    memberLimit: 1,
    inviteId: "invite-sister",
    targetPhone: "+79005556188",
    messageTtl: "30d"
  },
  {
    id: "chat-grandma",
    familyId: demoFamily.id,
    type: "direct",
    title: "Бабушка",
    subtitle: "До встречи вечером",
    avatarGroup: ["https://i.pravatar.cc/80?img=47"],
    unreadCount: 0,
    lastMessageAt: "2026-06-19T18:20:00.000Z",
    ownerId: currentUser.id,
    participantIds: [currentUser.id, "user-grandma"],
    participantPhones: ["79001234567", "79004442111"],
    memberLimit: 1,
    inviteId: "invite-grandma",
    targetPhone: "+79004442111",
    messageTtl: "off"
  }
];

export const demoMessages: Record<string, Message[]> = {
  "chat-family": [
    {
      id: "msg-1",
      chatId: "chat-family",
      senderId: "user-mama",
      ciphertext: "cipher-1",
      iv: "iv-1",
      type: "text",
      createdAt: "2026-06-20T12:30:00.000Z",
      expiresAt: "2026-06-27T12:30:00.000Z",
      replyTo: null,
      preview: "Привет! Как дела?",
      status: "read"
    },
    {
      id: "msg-2",
      chatId: "chat-family",
      senderId: currentUser.id,
      ciphertext: "cipher-2",
      iv: "iv-2",
      type: "text",
      createdAt: "2026-06-20T12:31:00.000Z",
      expiresAt: "2026-06-27T12:31:00.000Z",
      replyTo: "msg-1",
      preview: "Всё хорошо, спасибо! А у вас как?",
      status: "read"
    },
    {
      id: "msg-3",
      chatId: "chat-family",
      senderId: "user-brother",
      ciphertext: "cipher-3",
      iv: "iv-3",
      type: "text",
      createdAt: "2026-06-20T12:32:00.000Z",
      expiresAt: "2026-06-27T12:32:00.000Z",
      replyTo: null,
      preview: "Всё отлично 👍",
      status: "read"
    },
    {
      id: "msg-4",
      chatId: "chat-family",
      senderId: currentUser.id,
      ciphertext: "cipher-4",
      iv: "iv-4",
      type: "text",
      createdAt: "2026-06-20T12:33:00.000Z",
      expiresAt: "2026-06-27T12:33:00.000Z",
      replyTo: null,
      preview: "Отлично! Тогда увидимся вечером 🙂",
      status: "read"
    },
    {
      id: "msg-5",
      chatId: "chat-family",
      senderId: "user-mama",
      ciphertext: "cipher-5",
      iv: "iv-5",
      type: "voice",
      createdAt: "2026-06-20T12:34:00.000Z",
      expiresAt: "2026-06-27T12:34:00.000Z",
      replyTo: null,
      preview: "Голосовое сообщение",
      durationSec: 8,
      mediaDataUrl: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
      status: "sent"
    },
    {
      id: "msg-6",
      chatId: "chat-family",
      senderId: currentUser.id,
      ciphertext: "cipher-6",
      iv: "iv-6",
      type: "image",
      createdAt: "2026-06-20T12:35:00.000Z",
      expiresAt: "2026-06-27T12:35:00.000Z",
      replyTo: null,
      preview: "Фото",
      mediaPath: "chat-family/msg-6/lake.enc",
      mediaDataUrl:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=960&q=82",
      status: "read"
    }
  ],
  "chat-mama": [
    {
      id: "msg-7",
      chatId: "chat-mama",
      senderId: "user-mama",
      ciphertext: "cipher-7",
      iv: "iv-7",
      type: "text",
      createdAt: "2026-06-20T11:20:00.000Z",
      expiresAt: "2026-06-27T11:20:00.000Z",
      replyTo: null,
      preview: "Спасибо, сынок! ❤️",
      status: "sent"
    }
  ],
  "chat-brother": [
    {
      id: "msg-8",
      chatId: "chat-brother",
      senderId: "user-brother",
      ciphertext: "cipher-8",
      iv: "iv-8",
      type: "text",
      createdAt: "2026-06-20T10:05:00.000Z",
      expiresAt: "2026-06-27T10:05:00.000Z",
      replyTo: null,
      preview: "Хорошо 👍",
      status: "sent"
    }
  ],
  "chat-sister": [
    {
      id: "msg-9",
      chatId: "chat-sister",
      senderId: "user-sister",
      ciphertext: "cipher-9",
      iv: "iv-9",
      type: "image",
      createdAt: "2026-06-20T09:30:00.000Z",
      expiresAt: "2026-07-20T09:30:00.000Z",
      replyTo: null,
      preview: "Смотри, как красиво!",
      mediaDataUrl:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=960&q=82",
      status: "delivered"
    }
  ],
  "chat-grandma": [
    {
      id: "msg-10",
      chatId: "chat-grandma",
      senderId: "user-grandma",
      ciphertext: "cipher-10",
      iv: "iv-10",
      type: "text",
      createdAt: "2026-06-19T18:20:00.000Z",
      expiresAt: null,
      replyTo: null,
      preview: "До встречи вечером",
      status: "read"
    }
  ]
};

function todayAt(hour: number, minute: number) {
  const value = new Date();
  value.setHours(hour, minute, 0, 0);
  return value.toISOString();
}

export function createDemoChats(user: UserProfile): Chat[] {
  const chatTimes = [
    todayAt(12, 35),
    todayAt(11, 20),
    todayAt(10, 5),
    todayAt(9, 30),
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  ];

  return demoChats.map((chat, index) => ({
    ...chat,
    ownerId: user.id,
    participantIds: chat.participantIds.map((id) => (id === currentUser.id ? user.id : id)),
    participantPhones: chat.participantPhones.map((phone, phoneIndex) =>
      phoneIndex === 0 ? user.phone.replace(/\D/g, "") : phone
    ),
    lastMessageAt: chatTimes[index] ?? chat.lastMessageAt
  }));
}

export function createDemoMessages(user: UserProfile): Record<string, Message[]> {
  return Object.fromEntries(
    Object.entries(demoMessages).map(([chatId, messages]) => [
      chatId,
      messages.map((message, index) => ({
        ...message,
        senderId: message.senderId === currentUser.id ? user.id : message.senderId,
        createdAt:
          chatId === "chat-grandma"
            ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            : todayAt(12 + Math.floor(index / 10), 30 + (index % 10)),
        expiresAt:
          message.expiresAt === null
            ? null
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }))
    ])
  );
}

export function createDemoInvites(user: UserProfile): ChatInvite[] {
  return createDemoChats(user).map((chat) => {
    const draft = {
      id: chat.inviteId ?? `invite-${chat.id}`,
      chatId: chat.id,
      kind: chat.type,
      title: chat.title,
      createdBy: user.id,
      createdByPhone: user.phone.replace(/\D/g, ""),
      accessCode:
        chat.id === "chat-family" ? "F7M2Q9" : `A${chat.id.slice(-4).toUpperCase()}7`.slice(0, 6),
      allowedPhones: chat.participantPhones.slice(1),
      allowedPhone: chat.participantPhones[1] ?? null,
      maxParticipants: Math.max(chat.participantIds.length - 1, 1),
      createdAt: new Date().toISOString(),
      chatSecret: ""
    };
    return { ...draft, token: buildInviteToken(draft) };
  });
}
