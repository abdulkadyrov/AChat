import { demoUsers } from "@/shared/mocks/demo-data";
import type { UserProfile } from "@/shared/types/domain";

export function getUserById(userId: string, currentUser?: UserProfile | null) {
  if (currentUser?.id === userId) {
    return currentUser;
  }

  return demoUsers.find((user) => user.id === userId);
}
