import express from "express";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../controllers/category";
import {
  createExpense,
  createExpensesBulk,
  deleteExpense,
  deleteExpensesBulk,
  getExpenses,
  transferExpenses,
  updateExpense,
} from "../../controllers/expense";
import {
  createTag,
  createTagsBulk,
  deleteTag,
  getTags,
  updateTag,
} from "../../controllers/tags";
import {
  createWallet,
  createWalletInvitation,
  deleteWallet,
  deleteWalletUser,
  getInvitationInfo,
  getUserWallets,
  getWalletUsers,
  joinWallet,
  leaveWallet,
  updateWallet,
  updateWalletUserAccess,
} from "../../controllers/wallet";
import {
  checkBodyUserId,
  checkInvitationToken,
  checkUserId,
  checkWalletAccess,
  checkWalletCreator,
  checkWalletCreatorForUpdate,
  checkWalletData,
  checkWalletId,
  checkWalletName,
  checkWalletNameForUpdate,
} from "../../middlewares";
import { authenticateUser } from "../../middlewares/auth";
import { AccessLevel } from "../../models/Wallet";

const walletRouter = express.Router();

walletRouter.use(authenticateUser);

walletRouter.get("/", getUserWallets);

walletRouter.post(
  "/",
  checkWalletData,
  checkWalletName,
  checkWalletCreator,
  createWallet
);

walletRouter.patch(
  "/:walletId",
  checkWalletData,
  checkWalletNameForUpdate,
  checkWalletCreatorForUpdate,
  checkWalletId,
  checkWalletAccess([AccessLevel.Update]),
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
  checkWalletAccess([AccessLevel.AddUser]),
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
  checkWalletAccess([AccessLevel.UpdateUser]),
  updateWalletUserAccess
);

walletRouter.delete(
  "/:walletId/users/:userId",
  checkWalletId,
  checkUserId,
  checkWalletAccess([AccessLevel.DeleteUser]),
  deleteWalletUser
);

walletRouter.get(
  "/:walletId/leave",
  checkWalletId,
  checkWalletAccess([AccessLevel.View]),
  leaveWallet
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
  checkWalletAccess([AccessLevel.CreateCategory]),
  createCategory
);

walletRouter.patch(
  "/:walletId/category/:categoryId",
  checkWalletId,
  checkWalletAccess([AccessLevel.UpdateCategory]),
  updateCategory
);

walletRouter.delete(
  "/:walletId/category/:categoryId",
  checkWalletId,
  checkWalletAccess([AccessLevel.DeleteCategory]),
  deleteCategory
);

walletRouter.delete(
  "/:walletId/category/:categoryId/expense",
  checkWalletId,
  checkWalletAccess([AccessLevel.DeleteExpense]),
  deleteExpensesBulk
);

walletRouter.get(
  "/:walletId/tag",
  checkWalletId,
  checkWalletAccess([AccessLevel.View]),
  getTags
);

walletRouter.post(
  "/:walletId/tag",
  checkWalletId,
  checkWalletAccess([AccessLevel.CreateTag]),
  createTag
);

walletRouter.post(
  "/:walletId/tag/bulk",
  checkWalletId,
  checkWalletAccess([AccessLevel.CreateTag]),
  createTagsBulk
);

walletRouter.patch(
  "/:walletId/tag/:tagId",
  checkWalletId,
  checkWalletAccess([AccessLevel.UpdateTag]),
  updateTag
);

walletRouter.delete(
  "/:walletId/tag/:tagId",
  checkWalletId,
  checkWalletAccess([AccessLevel.DeleteTag]),
  deleteTag
);

walletRouter.get(
  "/:walletId/expense",
  checkWalletId,
  checkWalletAccess([AccessLevel.View]),
  getExpenses
);

walletRouter.post(
  "/:walletId/expense",
  checkWalletId,
  checkWalletAccess([AccessLevel.CreateExpense]),
  createExpense
);

walletRouter.post(
  "/:walletId/expense/bulk",
  checkWalletId,
  checkWalletAccess([AccessLevel.CreateExpense]),
  createExpensesBulk
);

walletRouter.patch(
  "/:walletId/expense/:expenseId",
  checkWalletId,
  checkWalletAccess([AccessLevel.UpdateExpense]),
  updateExpense
);

walletRouter.delete(
  "/:walletId/expense/:expenseId",
  checkWalletId,
  checkWalletAccess([AccessLevel.DeleteExpense]),
  deleteExpense
);

walletRouter.post(
  "/:walletId/expense/transfer",
  checkWalletId,
  checkWalletAccess([AccessLevel.UpdateExpense]),
  transferExpenses
);

export default walletRouter;
