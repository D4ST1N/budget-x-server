import express from "express";
import stytch from "stytch";

import { ErrorType } from "../types/ErrorType";

import "dotenv/config";
import axios from "axios";

const authRouter = express.Router();
export const client = new stytch.Client({
  project_id: process.env.STYTCH_PID as string,
  secret: process.env.STYTCH_SECRET as string,
});

authRouter.get("/", async (req, res) => {
  const token = String(req.query.token);
  const tokenType = String(req.query.stytch_token_type);

  if (!token && !tokenType) {
    res.status(400).json({
      success: false,
      errorType: ErrorType.NoTokenProvided,
    });
  }

  try {
    if (tokenType === "oauth") {
      const response = await client.oauth.authenticate({
        token,
        session_duration_minutes: 240,
      });

      res.redirect(
        `${process.env.CLIENT_URL}?session_token=${response.session_token}`
      );
    } else if (tokenType === "magic_links") {
      const response = await client.magicLinks.authenticate({
        token,
        session_duration_minutes: 240,
      });

      res.redirect(
        `${process.env.CLIENT_URL}?session_token=${response.session_token}`
      );
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      errorType: ErrorType.AuthorizationFailed,
      error,
    });
  }
});

authRouter.post("/verify", async (req, res) => {
  const token = String(req.body.token);

  try {
    const response = await client.sessions.authenticate({
      session_token: token,
    });

    res.status(200).json({
      success: true,
      user: response.user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      errorType: ErrorType.AuthorizationFailed,
      error,
    });
  }
});

authRouter.get("/users", async (req, res) => {
  try {
    const response = await client.users.search({
      query: { operator: "OR", operands: [] },
    });
    res.status(200).json({
      success: true,
      user: response.results,
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
