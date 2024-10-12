import mongoose from "mongoose";

import { app } from "../../src/index";
import Invitation from "../../src/models/Invitation";
import Wallet, { IWallet } from "../../src/models/Wallet";
import { AccessLevel } from "../../src/types/AccessLevel";
import { getAuthenticatedRequest, setupTestEnvironment } from "../testSetup";

let authRequest: ReturnType<typeof getAuthenticatedRequest>;
const dummyUserId = "60f7b3b3b3b3b3b3b3b3b3b3";
let userId: string;
let walletId: string;
let invitationToken: string;

async function updateWalletCreator(walletId: string, creator: string) {
  const wallet = (await Wallet.findOne({ _id: walletId })) as IWallet;

  wallet.creator = creator;

  await wallet.save();
}

beforeAll(async () => {
  await setupTestEnvironment();
  authRequest = getAuthenticatedRequest(app);
});

describe("Wallet users tests", () => {
  it("should create invitation link", async () => {
    const userDataResponse = await authRequest.get("/auth/user").expect(200);

    expect(userDataResponse.body).toHaveProperty("user");
    expect(userDataResponse.body.user).toHaveProperty("user_id");

    userId = userDataResponse.body.user.user_id;

    const walletData = {
      name: "Users Test Wallet",
      creator: userId,
      allowedUsers: [],
    };

    const walletResponse = await authRequest
      .post("/api/wallet")
      .send(walletData)
      .expect(200);

    walletId = walletResponse.body.wallet._id;

    const invitationResponse = await authRequest
      .post(`/api/wallet/${walletId}/invite`)
      .send({})
      .expect(200);

    expect(invitationResponse.body).toHaveProperty("token");

    invitationToken = invitationResponse.body.token;
  });

  it("should retrieve invitation link data", async () => {
    const response = await authRequest
      .get(`/api/wallet/join/${invitationToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("walletName", "Users Test Wallet");
    expect(response.body).toHaveProperty("creator");
    expect(response.body.creator).toHaveProperty("user_id", userId);
    expect(response.body.creator).toHaveProperty("name");
    expect(response.body.creator.name).toHaveProperty("first_name", "Test");
    expect(response.body.creator.name).toHaveProperty("last_name", "User");

    await updateWalletCreator(walletId, dummyUserId);
  });

  it("should join wallet with invitation token", async () => {
    const response = await authRequest
      .post(`/api/wallet/join/${invitationToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
  });

  it("should retrieve the list of shared wallets", async () => {
    const response = await authRequest.get("/api/wallet").expect(200);

    expect(response.body.sharedWallets).toBeInstanceOf(Array);
    expect(response.body.sharedWallets.length).toBeGreaterThanOrEqual(1);
  });

  it("should update user access level", async () => {
    await updateWalletCreator(walletId, userId);

    const response = await authRequest
      .patch(`/api/wallet/${walletId}/users/${userId}`)
      .send([AccessLevel.CreateExpense])
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
  });

  it("should return wallet users", async () => {
    const response = await authRequest
      .get(`/api/wallet/${walletId}/users`)
      .expect(200);

    expect(response.body).toHaveProperty("users", expect.any(Array));
    expect(response.body.users.length).toBe(1);
  });

  it("should return updated wallet user access level", async () => {
    const wallet = (await Wallet.findOne({ _id: walletId })) as IWallet;

    const user = wallet.allowedUsers.find((user) => user.userId === userId);

    expect(user).toHaveProperty("accessLevels", [AccessLevel.CreateExpense]);
  });

  it("should delete user from wallet", async () => {
    const wallet = (await Wallet.findOne({ _id: walletId })) as IWallet;

    wallet.allowedUsers.push({
      userId: dummyUserId,
      accessLevels: [AccessLevel.View],
    });

    await wallet.save();

    const response = await authRequest
      .delete(`/api/wallet/${walletId}/users/${dummyUserId}`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
  });

  it("should leave wallet", async () => {
    const response = await authRequest
      .get(`/api/wallet/${walletId}/leave`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
  });

  describe("Wallet User Error Handling", () => {
    it("should fail to create invitation link with invalid data", async () => {
      const invitationLinkPayload = {
        maxUses: "once",
        expiresIn: "an hour",
      };

      const response = await authRequest
        .post(`/api/wallet/${walletId}/invite`)
        .send(invitationLinkPayload)
        .expect(500);

      expect(response.body).toHaveProperty(
        "errorType",
        "InvitationCreationError"
      );
    });

    it("should fail to retrieve invitation link data with invalid invitation token", async () => {
      const response = await authRequest
        .get(`/api/wallet/join/invalid-token`)
        .expect(404);

      expect(response.body).toHaveProperty("errorType", "InvitationNotFound");
    });

    it("should fail to join wallet with invalid invitation token", async () => {
      const response = await authRequest
        .post(`/api/wallet/join/invalid-token`)
        .expect(404);

      expect(response.body).toHaveProperty("errorType", "InvitationNotFound");
    });

    it("should fail to update user access level with invalid userId", async () => {
      const response = await authRequest
        .patch(`/api/wallet/${walletId}/users/wallet-user-id`)
        .send([AccessLevel.CreateExpense])
        .expect(404);

      expect(response.body).toHaveProperty("errorType", "UserNotInWallet");
    });

    it("should fail to join wallet with expired invitation token", async () => {
      const invitationLinkPayload = {
        maxUses: 1,
        expiresIn: -1,
        accessLevels: Object.values(AccessLevel),
      };

      const invitationResponse = await authRequest
        .post(`/api/wallet/${walletId}/invite`)
        .send(invitationLinkPayload)
        .expect(200);

      invitationToken = invitationResponse.body.token;

      const response = await authRequest
        .post(`/api/wallet/join/${invitationToken}`)
        .expect(400);

      expect(response.body).toHaveProperty("errorType", "InvitationExpired");
    });

    it("should fail to join wallet with run out invitation token", async () => {
      const invitation = await Invitation.findOne({ token: invitationToken });

      invitation!.uses = invitation!.maxUses;
      invitation!.expires = new Date(Date.now() + 3600);

      await invitation!.save();

      const response = await authRequest
        .post(`/api/wallet/join/${invitationToken}`)
        .expect(400);

      expect(response.body).toHaveProperty("errorType", "InvitationRunOut");
    });

    it("should fail to join wallet with creator userId", async () => {
      const invitation = await Invitation.findOne({ token: invitationToken });

      invitation!.maxUses = invitation!.maxUses + 2;

      await invitation!.save();

      const response = await authRequest
        .post(`/api/wallet/join/${invitationToken}`)
        .expect(400);

      expect(response.body).toHaveProperty("errorType", "CannotInviteCreator");
    });

    it("should fail to retrieve invitation link data with invalid wallet id", async () => {
      await Invitation.findOneAndUpdate(
        { token: invitationToken },
        { wallet: new mongoose.Types.ObjectId() }
      );

      const response = await authRequest
        .get(`/api/wallet/join/${invitationToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("errorType", "WalletNotFound");
    });

    it("should fail to join wallet with invalid wallet id", async () => {
      const response = await authRequest
        .post(`/api/wallet/join/${invitationToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("errorType", "WalletNotFound");
    });

    it("should fail to retrieve invitation link data with invalid creator userId", async () => {
      await Invitation.findOneAndUpdate(
        { token: invitationToken },
        { wallet: walletId }
      );

      await updateWalletCreator(walletId, dummyUserId);

      const response = await authRequest
        .get(`/api/wallet/join/${invitationToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("errorType", "UserNotFound");
    });

    it("should fail to join same wallet multiple times", async () => {
      await authRequest.post(`/api/wallet/join/${invitationToken}`).expect(200);

      const response = await authRequest
        .post(`/api/wallet/join/${invitationToken}`)
        .expect(400);

      expect(response.body).toHaveProperty("errorType", "UserAlreadyInWallet");
    });
  });
});
