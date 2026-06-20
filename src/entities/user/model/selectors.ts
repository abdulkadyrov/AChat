import { demoUsers } from "@/shared/mocks/demo-data";

export function getUserById(userId: string) {
  return demoUsers.find((user) => user.id === userId);
}
