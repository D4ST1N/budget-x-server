import { Request, Response } from "express";
import mongoose from "mongoose";

import Expense, { CreateExpenseDTO } from "../../models/Expense";
import { ErrorType } from "../../types/ErrorType";
import { CreateExpensesResponse, ErrorResponse } from "../../types/Response";

export const createExpensesBulk = async (
  req: Request,
  res: Response<CreateExpensesResponse | ErrorResponse>
) => {
  const { walletId } = req.params;
  const { expenses }: { expenses: CreateExpenseDTO[] } = req.body;

  try {
    const expensesToSave = expenses.map((expense) => ({
      walletId: new mongoose.Types.ObjectId(walletId),
      categoryId: new mongoose.Types.ObjectId(expense.categoryId),
      tagIds: expense.tagIds.map((tagId) => new mongoose.Types.ObjectId(tagId)),
      amount: expense.amount,
      date: new Date(expense.date),
      isIncome: expense.isIncome,
    }));

    const savedExpenses = await Expense.insertMany(expensesToSave);

    res.status(200).json({
      expenses: savedExpenses,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.ExpenseCreationError,
      error,
    });
  }
};
