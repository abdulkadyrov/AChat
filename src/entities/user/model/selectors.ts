import type { UserProfile } from "@/shared/types/domain";

export function getUserById(userId: string, currentUser?: UserProfile | null) {
  if (currentUser?.id === userId) {
    return currentUser;
  }

  return undefined;
}
