import mongoose, { Document, Schema } from "mongoose";

export enum AccessLevel {
  View = "View",
  Update = "Update",
  Delete = "Delete",
  CreateCategory = "CreateCategory",
  UpdateCategory = "UpdateCategory",
  DeleteCategory = "DeleteCategory",
  AddUser = "AddUser",
  UpdateUser = "UpdateUser",
  DeleteUser = "DeleteUser",
  CreateTag = "CreateTag",
  UpdateTag = "UpdateTag",
  DeleteTag = "DeleteTag",
  CreateExpense = "CreateExpense",
  UpdateExpense = "UpdateExpense",
  DeleteExpense = "DeleteExpense",
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
