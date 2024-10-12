import axios from "axios";
import express from "express";
import { Request, Response } from "express";
import stytch from "stytch";

import { authenticate } from "../services/authenticate";
import { ErrorType } from "../types/ErrorType";

import "dotenv/config";
import { findUsers } from "../helpers/findUsers";

const week = 60 * 24 * 7;

const authRouter = express.Router();
export const stytchClient = new stytch.Client({
  project_id: process.env.STYTCH_PID as string,
  secret: process.env.STYTCH_SECRET as string,
});

authRouter.get("/", async (req: Request, res: Response) => {
  const token = String(req.query.token);
  const tokenType = String(req.query.stytch_token_type);

  if (!token && !tokenType) {
    return res.status(400).json({
      success: false,
      errorType: ErrorType.TokenNotProvided,
    });
  }

  try {
    let sessionToken;

    if (tokenType === "oauth") {
      const response = await stytchClient.oauth.authenticate({
        token,
        session_duration_minutes: week,
      });
      sessionToken = response.session_token;
    } else if (tokenType === "magic_links") {
      const response = await stytchClient.magicLinks.authenticate({
        token,
        session_duration_minutes: week,
      });
      sessionToken = response.session_token;
    }

    if (sessionToken) {
      res.cookie("session_token", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: week * 60 * 1000,
        sameSite: process.env.NODE_ENV === "production" ? "none" : undefined,
      });

      res.redirect(`${process.env.CLIENT_URL}`);
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      errorType: ErrorType.AuthorizationFailed,
      error,
    });
  }
});

authRouter.get("/user", async (req, res) => {
  if (!req.cookies) {
    return res.status(401).json({ ErrorType: ErrorType.TokenNotProvided });
  }

  try {
    const result = await authenticate(req);

    if (typeof result === "string") {
      return res.status(401).json({
        errorType: result,
      });
    }

    return res.status(200).json({ user: result });
  } catch (error) {
    return res.status(401).json({
      error,
      errorType: ErrorType.AuthorizationFailed,
    });
  }
});

authRouter.get("/logout", async (req, res) => {
  res.clearCookie("session_token");
  res.status(200).json({ success: true });
});

authRouter.get("/users", async (req, res) => {
  try {
    const results = await findUsers("OR");

    res.status(200).json({
      success: true,
      user: results,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      errorType: ErrorType.AuthorizationFailed,
      error,
    });
  }
});

authRouter.get("/avatar", async (req, res) => {
  const avatarUrl = req.query.url as string;

  try {
    const response = await axios.get(avatarUrl, {
      responseType: "arraybuffer",
    });
    res.set("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching avatar");
  }
});

export default authRouter;
