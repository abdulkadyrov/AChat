import type { UserProfile } from "@/shared/types/domain";
import { demoUsers } from "@/shared/mocks/demo-data";

export function getUserById(userId: string, currentUser?: UserProfile | null) {
  if (currentUser?.id === userId) {
    return currentUser;
  }

  return demoUsers.find((user) => user.id === userId);
}
