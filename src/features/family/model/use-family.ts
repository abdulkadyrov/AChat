import { useMemo } from "react";
import { demoMembers, demoUsers } from "@/shared/mocks/demo-data";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";

export function useFamily() {
  const currentUser = useAuthStore((state: AuthState) => state.user);

  return useMemo(() => {
    if (!currentUser) return { family: null, members: [] };
    const members = demoMembers.map((member, index) => ({
      ...member,
      userId: index === 0 ? currentUser.id : member.userId,
      user: index === 0 ? currentUser : demoUsers.find((user) => user.id === member.userId)
    }));
    return {
      family: {
        id: "family-main",
        name: "Семья",
        ownerId: currentUser.id,
        inviteCode: "F7M2Q9"
      },
      members
    };
  }, [currentUser]);
}
