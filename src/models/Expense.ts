import mongoose, { Document, Schema } from "mongoose";

export interface IExpense extends Document {
  walletId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  tagIds: mongoose.Types.ObjectId[];
  amount: number;
  date: Date;
  isIncome: boolean;
}

export interface CreateExpenseDTO {
  categoryId: string;
  tagIds: string[];
  amount: number;
  date: Date;
  isIncome: boolean;
}

const ExpenseSchema = new Schema<IExpense>({
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  tagIds: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Tag", required: true },
  ],
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now, required: true },
  isIncome: { type: Boolean, default: false },
});

const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
