import mongoose from "mongoose";

import { app } from "../../src/index";
import Wallet from "../../src/models/Wallet";
import { getAuthenticatedRequest, setupTestEnvironment } from "../testSetup";

let authRequest: ReturnType<typeof getAuthenticatedRequest>;

beforeAll(async () => {
  await setupTestEnvironment();
  authRequest = getAuthenticatedRequest(app);
});

describe("Wallet CRUD tests", () => {
  let userId: string;
  let walletId: string;

  it("should return user data", async () => {
    const response = await authRequest.get("/auth/user").expect(200);

    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("user_id");

    userId = response.body.user.user_id;
  });

  it("should create a new wallet", async () => {
    const walletData = {
      name: "Test Wallet",
      creator: userId,
      allowedUsers: [],
    };

    const response = await authRequest
      .post("/api/wallet")
      .send(walletData)
      .expect(200);

    expect(response.body.wallet).toHaveProperty("_id");
    expect(response.body.wallet).toHaveProperty("name", "Test Wallet");
    expect(response.body.wallet).toHaveProperty("creator", userId);
    expect(response.body.wallet).toHaveProperty("allowedUsers", []);

    walletId = response.body.wallet._id;
  });

  it("should retrieve the list of wallets", async () => {
    const response = await authRequest.get("/api/wallet").expect(200);

    expect(response.body.wallets).toBeInstanceOf(Array);
    expect(response.body.wallets.length).toBeGreaterThanOrEqual(1);
  });

  it("should update an existing wallet", async () => {
    const updatedWalletData = {
      name: "Updated Wallet",
    };

    const response = await authRequest
      .patch(`/api/wallet/${walletId}`)
      .send(updatedWalletData)
      .expect(200);

    expect(response.body.wallet).toHaveProperty("_id", walletId);
    expect(response.body.wallet).toHaveProperty("name", "Updated Wallet");
  });

  it("should delete an existing wallet", async () => {
    const response = await authRequest
      .delete(`/api/wallet/${walletId}`)
      .expect(200);

    expect(response.body.success).toBe(true);

    const walletsResponse = await authRequest.get("/api/wallet").expect(200);

    expect(walletsResponse.body.wallets).not.toContainEqual(
      expect.objectContaining({ _id: walletId })
    );
  });

  describe("Wallet CRUD error handling", () => {
    it("should return an error if no data passed", async () => {
      const response = await authRequest
        .post("/api/wallet")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty(
        "errorType",
        "WalletNameNotProvided"
      );
    });

    it("should return an error if no wallet name passed", async () => {
      const response = await authRequest
        .post("/api/wallet")
        .send({ creator: userId })
        .expect(400);

      expect(response.body).toHaveProperty(
        "errorType",
        "WalletNameNotProvided"
      );
    });

    test.each([
      ["null", null],
      ["undefined", undefined],
    ])(
      "should return 400 when creating a wallet with %s as name",
      async (_, invalidName) => {
        const invalidWalletData = {
          name: invalidName,
          creator: "someUserId",
        };

        const response = await authRequest
          .post("/api/wallet")
          .send(invalidWalletData)
          .expect(400);

        expect(response.body).toHaveProperty(
          "errorType",
          "WalletNameNotProvided"
        );
      }
    );

    test.each([
      ["number", 12345],
      ["boolean", true],
    ])(
      "should return 400 when creating a wallet with %s as name",
      async (_, invalidName) => {
        const invalidWalletData = {
          name: invalidName,
          creator: "someUserId",
        };

        const response = await authRequest
          .post("/api/wallet")
          .send(invalidWalletData)
          .expect(400);

        expect(response.body).toHaveProperty(
          "errorType",
          "WalletNameIsInvalid"
        );
      }
    );

    it("should return 400 when creating a wallet with invalid access levels", async () => {
      const invalidWalletData = {
        name: "Invalid Access Levels Wallet",
        creator: userId,
        allowedUsers: ["invalidAccessLevel"],
      };

      const response = await authRequest
        .post("/api/wallet")
        .send(invalidWalletData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "errorType",
        "WalletUserDataIsInvalid"
      );
    });

    it("should return an error if wallet with the same name exists", async () => {
      const walletData = {
        name: "Test Wallet",
        creator: userId,
        allowedUsers: [],
      };

      const response = await authRequest
        .post("/api/wallet")
        .send(walletData)
        .expect(200);
      walletId = response.body.wallet._id;

      const secondResponse = await authRequest
        .post("/api/wallet")
        .send(walletData)
        .expect(409);

      expect(secondResponse.body).toHaveProperty("errorType", "WalletExists");
    });

    it("should return 400 when passing invalid wallet id", async () => {
      const response = await authRequest
        .patch("/api/wallet/invalid-id")
        .send({ name: "Updated Wallet" })
        .expect(400);

      expect(response.body).toHaveProperty("errorType", "WalletIdIsInvalid");
    });

    it("should return 404 when trying to update a non-existent wallet", async () => {
      const response = await authRequest
        .patch(`/api/wallet/${new mongoose.Types.ObjectId()}`)
        .send({ name: "Updated Wallet" })
        .expect(404);

      expect(response.body).toHaveProperty("errorType", "WalletNotFound");
    });

    test.each([["null", null]])(
      "should return 400 when updating a wallet with %s as name",
      async (_, invalidName) => {
        const response = await authRequest
          .patch(`/api/wallet/${walletId}`)
          .send({ name: invalidName })
          .expect(400);

        expect(response.body).toHaveProperty(
          "errorType",
          "WalletNameNotProvided"
        );
      }
    );

    test.each([
      ["number", 12345],
      ["boolean", true],
    ])(
      "should return 400 when updating a wallet with %s as name",
      async (_, invalidName) => {
        const response = await authRequest
          .patch(`/api/wallet/${walletId}`)
          .send({ name: invalidName })
          .expect(400);

        expect(response.body).toHaveProperty(
          "errorType",
          "WalletNameIsInvalid"
        );
      }
    );

    it("should return an error if trying to change creator", async () => {
      const response = await authRequest
        .patch(`/api/wallet/${walletId}`)
        .send({ creator: "newUserId", allowedUsers: [] })
        .expect(400);

      expect(response.body).toHaveProperty(
        "errorType",
        "WalletCreatorIsImmutable"
      );
    });

    it("should return 403 when trying to update a wallet without permission", async () => {
      const walletData = {
        name: "Permission Denied Wallet for Update",
        creator: userId,
        allowedUsers: [],
      };

      const response = await authRequest
        .post("/api/wallet")
        .send(walletData)
        .expect(200);
      walletId = response.body.wallet._id;

      await Wallet.findOneAndUpdate(
        { _id: walletId },
        { creator: "newUserId" }
      );

      const updatedWalletData = {
        name: "Updated Wallet",
      };

      const updateResponse = await authRequest
        .patch(`/api/wallet/${walletId}`)
        .send(updatedWalletData)
        .expect(403);

      expect(updateResponse.body).toHaveProperty("errorType", "AccessDenied");
    });

    it("should return 404 when trying to delete a non-existent wallet", async () => {
      const response = await authRequest
        .delete(`/api/wallet/${new mongoose.Types.ObjectId()}`)
        .expect(404);

      expect(response.body).toHaveProperty("errorType", "WalletNotFound");
    });

    it("should return 403 when trying to delete a wallet without permission", async () => {
      const walletData = {
        name: "Permission Denied Wallet for Delete",
        creator: userId,
        allowedUsers: [],
      };

      const response = await authRequest
        .post("/api/wallet")
        .send(walletData)
        .expect(200);
      const walletId = response.body.wallet._id;

      await Wallet.findOneAndUpdate(
        { _id: walletId },
        { creator: "newUserId" }
      );

      const deleteResponse = await authRequest
        .delete(`/api/wallet/${walletId}`)
        .expect(403);

      expect(deleteResponse.body).toHaveProperty("errorType", "AccessDenied");
    });
  });
});
