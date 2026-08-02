import type { UserProfile } from "@/shared/types/domain";

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function generateDailyParticipantCode(user: UserProfile, date = new Date()) {
  const source = `achat-member-v1:${user.id}:${user.createdAt}:${getLocalDateKey(date)}`;
  let hash = 2166136261;

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return String((hash >>> 0) % 100_000_000).padStart(8, "0");
}

export function millisecondsUntilNextLocalDay(date = new Date()) {
  const nextDay = new Date(date);
  nextDay.setHours(24, 0, 0, 250);
  return Math.max(250, nextDay.getTime() - date.getTime());
}
