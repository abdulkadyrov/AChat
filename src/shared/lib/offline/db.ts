import { openDB } from "idb";
import type { Message } from "@/shared/types/domain";

const DB_NAME = "achat-offline";
const DB_VERSION = 1;
const QUEUE_STORE = "outbox";
const CACHE_STORE = "messages";

export async function getOfflineDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        const cache = db.createObjectStore(CACHE_STORE, { keyPath: "id" });
        cache.createIndex("chatId", "chatId");
      }
    }
  });
}

export async function queueOutgoingMessage(message: Message) {
  const db = await getOfflineDb();
  await db.put(QUEUE_STORE, message);
}

export async function cacheMessages(messages: Message[]) {
  const db = await getOfflineDb();
  const tx = db.transaction(CACHE_STORE, "readwrite");

  for (const message of messages) {
    tx.store.put(message);
  }

  await tx.done;
}

export async function deleteOfflineDb() {
  const { deleteDB } = await import("idb");
  await deleteDB(DB_NAME);
}
