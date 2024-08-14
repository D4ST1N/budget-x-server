import express from "express";

import {
  createWallet,
  createWalletInvitation,
  deleteWallet,
  deleteWalletUser,
  getInvitationInfo,
  getUserWallets,
  getWalletUsers,
  joinWallet,
  updateWallet,
} from "../../controllers/wallet";
import {
  checkBodyUserId,
  checkInvitationToken,
  checkUserId,
  checkWalletData,
  checkWalletId,
} from "../../middlewares";

const walletRouter = express.Router();

walletRouter.get("/by-user/:userId", checkUserId, getUserWallets);

walletRouter.post("/", checkWalletData, createWallet);

walletRouter.patch("/:walletId", checkWalletData, checkWalletId, updateWallet);

walletRouter.delete("/:walletId", checkWalletId, deleteWallet);

walletRouter.post("/:walletId/invite", checkWalletId, createWalletInvitation);

walletRouter.get("/join/:token", checkInvitationToken, getInvitationInfo);

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
