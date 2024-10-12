import { Request, Response } from "express";
import mongoose from "mongoose";

import {
  createWallet,
  deleteWallet,
  deleteWalletUser,
  getUserWallets,
  getWalletUsers,
  leaveWallet,
  updateWallet,
  updateWalletUserAccess,
} from "../../src/controllers/wallet";
import Wallet from "../../src/models/Wallet";
import { ErrorType } from "../../src/types/ErrorType";

jest.mock("../../src/models/Wallet");

describe("Wallet Mongo error handling", () => {
  const mockError = new Error("Database error");
  let req: Request;
  let res: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn();
    mockSend = jest.fn();

    req = {
      params: { walletId: new mongoose.Types.ObjectId().toString() },
    } as unknown as Request;

    res = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };

    jest.clearAllMocks();
  });

  it("should handle error when creating wallet", async () => {
    req = {
      body: {
        name: "Test Wallet",
        creator: new mongoose.Types.ObjectId().toString(),
      },
    } as unknown as Request;

    (Wallet.findOne as jest.Mock).mockResolvedValue(null);
    (Wallet as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(mockError),
    }));

    await createWallet(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.WalletCreationError,
      error: mockError,
    });
  });

  it("should handle error when deleting wallet", async () => {
    (Wallet.deleteOne as jest.Mock).mockRejectedValue(mockError);

    await deleteWallet(req, res as Response);

    expect(Wallet.deleteOne).toHaveBeenCalledWith({ _id: req.params.walletId });
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.WalletDeletionError,
      error: mockError,
    });
  });

  it("should handle error when deleting wallet user", async () => {
    req = {
      params: {
        walletId: new mongoose.Types.ObjectId().toString(),
        userId: new mongoose.Types.ObjectId().toString(),
      },
    } as unknown as Request;

    (Wallet.findOne as jest.Mock).mockResolvedValue({
      allowedUsers: [{ userId: req.params.userId }],
      save: jest.fn().mockRejectedValue(mockError),
    });

    await deleteWalletUser(req, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.WalletUserDeletionError,
      error: mockError,
    });
  });

  it("should handle error when getting user wallets", async () => {
    (Wallet.find as jest.Mock).mockRejectedValue(mockError);

    await getUserWallets(req, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.WalletFetchError,
      error: mockError,
    });
  });

  it("should handle error when getting wallet users", async () => {
    (Wallet.findOne as jest.Mock).mockRejectedValue(mockError);

    await getWalletUsers(req, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.UserFetchError,
      error: mockError,
    });
  });

  it("should handle error when leaving the wallet", async () => {
    req = {
      params: {
        walletId: new mongoose.Types.ObjectId().toString(),
      },
    } as unknown as Request;

    (Wallet.findOne as jest.Mock).mockResolvedValue({
      allowedUsers: [{ userId: req.params.userId }],
      save: jest.fn().mockRejectedValue(mockError),
    });

    await leaveWallet(req, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.WalletLeaveError,
      error: mockError,
    });
  });

  it("should handle error when updating wallet", async () => {
    req = {
      params: {
        walletId: new mongoose.Types.ObjectId().toString(),
      },
      body: {
        name: "Test Wallet",
      },
    } as unknown as Request;

    (Wallet.findOne as jest.Mock).mockResolvedValue({
      allowedUsers: [{ userId: req.params.userId }],
      save: jest.fn().mockRejectedValue(mockError),
    });

    await updateWallet(req, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.WalletUpdateError,
      error: mockError,
    });
  });

  it("should handle error when updating wallet user access", async () => {
    req = {
      params: {
        walletId: new mongoose.Types.ObjectId().toString(),
        userId: new mongoose.Types.ObjectId().toString(),
      },
      body: {
        access: "read",
      },
    } as unknown as Request;

    (Wallet.findOne as jest.Mock).mockResolvedValue({
      allowedUsers: [{ userId: req.params.userId }],
      save: jest.fn().mockRejectedValue(mockError),
    });

    await updateWalletUserAccess(req, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.WalletUserUpdateError,
      error: mockError,
    });
  });
});
