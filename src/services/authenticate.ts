import { Request } from "express";
import { User } from "stytch";

import { stytchClient } from "../routes/auth";
import { ErrorType } from "../types/ErrorType";

export async function authenticate(req: Request): Promise<User | ErrorType> {
  const sessionToken = req.cookies.session_token;

  if (!sessionToken) {
    return ErrorType.NoTokenProvided;
  }

  const session = await stytchClient.sessions.authenticate({
    session_token: sessionToken,
  });

  if (!session) {
    return ErrorType.InvalidToken;
  }

  const user = session.user;

  return user;
}
