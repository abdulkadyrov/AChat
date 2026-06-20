import { getUserById } from "@/entities/user/model/selectors";
import { demoFamily, demoMembers } from "@/shared/mocks/demo-data";
import { useAuthStore } from "@/shared/model/auth-store";

export function useFamily() {
  const currentUser = useAuthStore((state) => state.user);

  return {
    family: demoFamily,
    members: demoMembers.map((member) => ({
      ...member,
      user:
        member.role === "owner" && currentUser
          ? currentUser
          : getUserById(member.userId, currentUser)
    }))
  };
}
