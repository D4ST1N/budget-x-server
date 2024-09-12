import request from "supertest";

import { app } from "../../src/index";
import { getAuthenticatedRequest, setupTestEnvironment } from "../testSetup";

let authRequest: ReturnType<typeof getAuthenticatedRequest>;

beforeAll(async () => {
  await setupTestEnvironment();
  authRequest = getAuthenticatedRequest(app);
});

describe("Authorization Tests", () => {
  it("should authenticate and set session token in cookies", async () => {
    const token = "hdPVZHHX0UoRa7hJTuuPHi1vlddffSnoweRbVFf5-H8g";
    const stytchTokenType = "oauth";

    const response = await request(app)
      .get("/auth")
      .query({ token, stytch_token_type: stytchTokenType })
      .expect(302)
      .expect("Set-Cookie", /session_token/);

    const cookies = response.headers["set-cookie"] as unknown as string[];
    const sessionCookie = cookies?.find((cookie: string) =>
      cookie.includes("session_token")
    );
    expect(sessionCookie).toBeDefined();
  });

  it("should access protected route with session token", async () => {
    const response = await authRequest.get("/api/wallet").expect(200);

    expect(response.body).toHaveProperty("wallets");
    expect(response.body).toHaveProperty("sharedWallets");
  });

  it("should fail to access protected route without session token", async () => {
    const response = await request(app).get("/api/wallet").expect(401);
    expect(response.body).toHaveProperty("errorType", "TokenNotProvided");
  });
});
