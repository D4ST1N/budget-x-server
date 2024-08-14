import express from "express";

import {
  checkBodyUserId,
  checkInvitationToken,
  checkUserId,
  checkWalletData,
  checkWalletId,
} from "../../middlewares";
import {
  createWallet,
  createWalletInvitation,
  deleteWallet,
  getUserWallets,
  getWalletUsers,
  updateWallet,
  joinWallet,
  deleteWalletUser,
} from "../../controllers/wallet";

const walletRouter = express.Router();

walletRouter.get("/by-user/:userId", checkUserId, getUserWallets);

walletRouter.post("/", checkWalletData, createWallet);

walletRouter.patch("/:walletId", checkWalletData, checkWalletId, updateWallet);

walletRouter.delete("/:walletId", checkWalletId, deleteWallet);

walletRouter.post("/:walletId/invite", checkWalletId, createWalletInvitation);

walletRouter.post(
  "/join/:token",
  checkInvitationToken,
  checkBodyUserId,
  joinWallet
);

walletRouter.get("/:walletId/users", checkWalletId, getWalletUsers);

walletRouter.delete(
  "/:walletId/users/:userId",
  checkUserId,
  checkWalletId,
  deleteWalletUser
);

export default walletRouter;
