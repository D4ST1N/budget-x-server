import { ICategory } from "../models/Category";
import { IExpense } from "../models/Expense";
import { ITag } from "../models/Tag";
import { IWallet } from "../models/Wallet";
import { ErrorType } from "./ErrorType";
import { UserData } from "./User";

export interface ErrorResponse {
  errorType: ErrorType;
  error?: any;
}

export interface GetUserWalletsResponse {
  wallets: IWallet[];
  sharedWallets: IWallet[];
}

export interface CreateWalletResponse {
  wallet: IWallet;
}

export interface CreateWalletInvitationResponse {
  token: string;
}

export interface DeleteWalletResponse {
  success: boolean;
}

export interface DeleteWalletUserResponse {
  success: boolean;
}

export interface LeaveWalletResponse {
  success: boolean;
}

export interface GetInvitationLinkResponse {
  walletName: string;
  creator: UserData;
}

export interface FetWalletUsersResponse {
  users: UserData[];
}

export interface JoinWallerResponse {
  success: boolean;
}

export interface UpdateWalletResponse {
  wallet: IWallet;
}

export interface UpdateWalletUserResponse {
  success: boolean;
}

export interface CreateCategoryResponse {
  category: ICategory;
}

export interface DeleteCategoryResponse {
  success: boolean;
}

export interface GetCategoriesResponse {
  categories: ICategory[];
}

export interface UpdateCategoryResponse {
  category: ICategory;
}

export interface CreateExpenseResponse {
  expense: IExpense;
}

export interface DeleteExpenseResponse {
  success: boolean;
}

export interface GetExpensesResponse {
  expenses: IExpense[];
  categories: ICategory[];
  tags: ITag[];
}

export interface UpdateExpenseResponse {
  expense: IExpense;
}

export interface CreateTagResponse {
  tag: ITag;
}

export interface CreateTagsBulkResponse {
  tags: ITag[];
}

export interface DeleteTagResponse {
  success: boolean;
}

export interface GetTagsResponse {
  tags: ITag[];
}

export interface UpdateTagResponse {
  tag: ITag;
}
