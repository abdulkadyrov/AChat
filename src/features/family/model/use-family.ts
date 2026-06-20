import { demoFamily, demoMembers } from "@/shared/mocks/demo-data";
import { getUserById } from "@/entities/user/model/selectors";

export function useFamily() {
  return {
    family: demoFamily,
    members: demoMembers.map((member) => ({
      ...member,
      user: getUserById(member.userId)
    }))
  };
}
