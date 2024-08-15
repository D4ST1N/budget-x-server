import mongoose, { Document, Schema } from "mongoose";

export enum AccessLevel {
  View = "View",
  Edit = "Edit",
  AddCategories = "AddCategories",
  AddExpenses = "AddExpenses",
  DeleteCategories = "DeleteCategories",
  Delete = "Delete",
  ShareWallet = "ShareWallet",
  DeleteUsers = "DeleteUsers",
}

export interface IAllowedUser {
  userId: string;
  accessLevels: AccessLevel[];
}

export interface IWallet extends Document {
  name: string;
  creator: string;
  allowedUsers: IAllowedUser[];
}

const AllowedUserSchema = new Schema<IAllowedUser>({
  userId: { type: String, required: true },
  accessLevels: {
    type: [String],
    enum: Object.values(AccessLevel),
    required: true,
  },
});

const WalletSchema = new Schema<IWallet>({
  name: { type: String, required: true },
  creator: { type: String, required: true },
  allowedUsers: [AllowedUserSchema],
});

const Wallet = mongoose.model<IWallet>("Wallet", WalletSchema);

export default Wallet;
