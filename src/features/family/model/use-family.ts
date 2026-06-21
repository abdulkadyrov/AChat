import { useAuthStore } from "@/shared/model/auth-store";

export function useFamily() {
  const currentUser = useAuthStore((state) => state.user);

  return {
    family: currentUser
      ? {
          id: "family-main",
          name: currentUser.name,
          ownerId: currentUser.id,
          inviteCode: "LOCAL-FAMILY"
        }
      : null,
    members: currentUser
      ? [
          {
            id: `member-${currentUser.id}`,
            familyId: "family-main",
            userId: currentUser.id,
            role: "owner" as const,
            status: "online" as const,
            user: currentUser
          }
        ]
      : []
  };
}
