import express from "express";

import {
  createCategory,
  deleteCategory,
  editCategory,
  getCategories,
} from "../../controllers/category";
import {
  createWallet,
  createWalletInvitation,
  deleteWallet,
  deleteWalletUser,
  editWalletUserAccess,
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
  checkWalletAccess,
  checkWalletData,
  checkWalletId,
} from "../../middlewares";
import { AccessLevel } from "../../models/Wallet";

const walletRouter = express.Router();

walletRouter.get("/by-user/:userId", checkUserId, getUserWallets);

walletRouter.post("/", checkWalletData, createWallet);

walletRouter.patch(
  "/:walletId",
  checkWalletData,
  checkWalletId,
  checkWalletAccess([AccessLevel.Edit]),
  updateWallet
);

walletRouter.delete(
  "/:walletId",
  checkWalletId,
  checkWalletAccess([AccessLevel.Delete]),
  deleteWallet
);

walletRouter.post(
  "/:walletId/invite",
  checkWalletId,
  checkWalletAccess([AccessLevel.ShareWallet]),
  createWalletInvitation
);

walletRouter.get("/join/:token", checkInvitationToken, getInvitationInfo);

walletRouter.post(
  "/join/:token",
  checkInvitationToken,
  checkBodyUserId,
  joinWallet
);

walletRouter.get(
  "/:walletId/users",
  checkWalletId,
  checkWalletAccess([AccessLevel.View]),
  getWalletUsers
);

walletRouter.patch(
  "/:walletId/users/:userId",
  checkWalletId,
  checkUserId,
  checkWalletAccess([AccessLevel.Edit]),
  editWalletUserAccess
);

walletRouter.delete(
  "/:walletId/users/:userId",
  checkWalletId,
  checkUserId,
  checkWalletAccess([AccessLevel.DeleteUsers]),
  deleteWalletUser
);

walletRouter.get(
  "/:walletId/category",
  checkWalletId,
  checkWalletAccess([AccessLevel.View]),
  getCategories
);

walletRouter.post(
  "/:walletId/category",
  checkWalletId,
  checkWalletAccess([AccessLevel.AddCategories]),
  createCategory
);

walletRouter.patch(
  "/:walletId/category/:categoryId",
  checkWalletId,
  checkWalletAccess([AccessLevel.AddCategories]),
  editCategory
);

walletRouter.delete(
  "/:walletId/category/:categoryId",
  checkWalletId,
  checkWalletAccess([AccessLevel.DeleteCategories]),
  deleteCategory
);

export default walletRouter;
