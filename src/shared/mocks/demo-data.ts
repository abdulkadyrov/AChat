import type {
  AuthSession,
  Chat,
  Family,
  FamilyMember,
  Message,
  UserProfile
} from "@/shared/types/domain";

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
  ]
};
