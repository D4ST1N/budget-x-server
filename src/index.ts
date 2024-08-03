import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import stytch from "stytch";
import categoryRouter from "./routes/api/category";

const app = express();
const port = process.env.SERVER_PORT;
const connectionString: string = process.env.MONGO_DB_CONNECTION_URL as string;

const connectToDB = async () => {
  try {
    await mongoose.connect(connectionString, {
      autoIndex: true,
    });
    console.log("Connected to Mongodb Atlas");
  } catch (error) {
    console.error(error);
  }
};

connectToDB();

const client = new stytch.Client({
  project_id: process.env.STYTCH_PID as string,
  secret: process.env.STYTCH_SECRET as string,
});

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", categoryRouter);

app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});

app.get("/auth", async (req, res) => {
  const token = String(req.query.token);
  const tokenType = String(req.query.stytch_token_type);

  if (!token && !tokenType) {
    res.status(400).json({
      success: false,
      message: "Authentication failed",
      error: "Authentication failed",
    });
  }

  if (tokenType === "oauth") {
    try {
      const response = await client.oauth.authenticate({
        token,
        session_duration_minutes: 60,
      });

      res.redirect(
        `${process.env.CLIENT_URL}?session_token=${response.session_token}`
      );
    } catch (e) {
      res.status(400).json({
        success: false,
        message: "Authentication failed",
        error: e,
      });
    }
  } else if (tokenType === "magic_links") {
    try {
      const response = await client.magicLinks.authenticate({
        token,
        session_duration_minutes: 60,
      });

      res.redirect(
        `${process.env.CLIENT_URL}?session_token=${response.session_token}`
      );
    } catch (e) {
      res.status(400).json({
        success: false,
        message: "Authentication failed",
        error: e,
      });
    }
  }
});

app.post("/auth/verify", async (req, res) => {
  const token = String(req.body.token);

  try {
    await client.sessions.authenticate({
      session_token: token,
    });

    res.status(200).json({
      success: true,
      message: "Session token is valid",
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: "Authentication failed",
      error: e,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on ${port} port`);
});
