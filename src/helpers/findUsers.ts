import { SearchUsersQueryOperand } from "stytch";
import { stytchClient } from "../routes/auth";
import { UserData } from "../types/User";

const testUserId = "user-test-e3795c81-f849-4167-bfda-e4a6e9c280fd";

export async function findUsers(
  operator: "OR" | "AND",
  userIds?: string[]
): Promise<UserData[]> {
  if (process.env.NODE_ENV === "test" && userIds?.includes(testUserId)) {
    return [
      {
        name: {
          first_name: "Test",
          last_name: "User",
        },
        user_id: testUserId,
        providers: [],
      },
    ];
  }

  const operands: SearchUsersQueryOperand[] = userIds
    ? [
        {
          filter_name: "user_id",
          filter_value: userIds,
        },
      ]
    : [];

  try {
    const { results } = await stytchClient.users.search({
      query: {
        operator,
        operands: operands,
      },
    });

    return results;
  } catch (error) {
    return [];
  }
}
