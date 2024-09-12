import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";

import { app, startServer, stopServer } from "../src/index";

let sessionCookie: string;

export const setupTestEnvironment = async () => {
  console.log("Setting up test environment...");
  await startServer();

  const token = "hdPVZHHX0UoRa7hJTuuPHi1vlddffSnoweRbVFf5-H8g";
  const stytchTokenType = "oauth";

  const response = await request(app)
    .get("/auth")
    .query({ token, stytch_token_type: stytchTokenType })
    .expect(302)
    .expect("Set-Cookie", /session_token/);

  const cookies = response.headers["set-cookie"] as unknown as string[];
  sessionCookie = cookies.find((cookie: string) =>
    cookie.includes("session_token")
  ) as string;
};

export const clearDatabase = async () => {
  console.log("Clearing database...");
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    console.log(collection.collectionName);
    await collection.deleteMany({});
  }
  console.log("Database cleared.");
};

export const teardownTestEnvironment = async () => {
  console.log("Tearing down test environment...");
  await stopServer();
  await mongoose.connection.close();
  console.log("Test environment tear down complete.");
};

export const getAuthenticatedRequest = (app: Express) => {
  return {
    get: (url: string) => request(app).get(url).set("Cookie", sessionCookie),
    post: (url: string) => request(app).post(url).set("Cookie", sessionCookie),
    patch: (url: string) =>
      request(app).patch(url).set("Cookie", sessionCookie),
    delete: (url: string) =>
      request(app).delete(url).set("Cookie", sessionCookie),
  };
};

// Це буде використовуватися як глобальний setup
export default async (): Promise<void> => {
  console.log("Running global setup...");
  await setupTestEnvironment();
  await clearDatabase();
  console.log("Global setup completed.");
};
