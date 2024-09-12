import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import connection from "./db/connection";
import walletRouter from "./routes/api/walletRouter";
import authRouter from "./routes/auth";

import "dotenv/config";

const app = express();
const port = process.env.SERVER_PORT;

connection.on("connected", () => console.log("Connected to Mongodb Atlas"));

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/wallet", walletRouter);
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});

let server: ReturnType<typeof app.listen> | null = null;

export const startServer = () => {
  return new Promise<void>((resolve) => {
    server = app.listen(port, () => {
      console.log(`Server is running on ${port} port`);
      resolve();
    });
  });
};

export const stopServer = () => {
  return new Promise<void>((resolve) => {
    if (server) {
      server.close(() => {
        console.log("Server stopped");
        resolve();
      });
    } else {
      resolve();
    }
  });
};

if (require.main === module) {
  startServer();
}

export { app, server };
