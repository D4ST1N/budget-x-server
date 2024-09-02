import { NextFunction, Request, Response } from "express";

import { authenticate } from "../services/authenticate";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const result = await authenticate(req);

  if (typeof result === "string") {
    return res.status(401).json({
      errorType: result,
    });
  }

  req.userId = result.user_id;

  next();
}
