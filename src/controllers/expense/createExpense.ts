import { Request, Response } from "express";

import Expense, { CreateExpenseDTO } from "../../models/Expense";
import { ErrorType } from "../../types/ErrorType";

export const createExpense = async (req: Request, res: Response) => {
  const { categoryId, tagIds, amount, date }: CreateExpenseDTO = req.body;
  const { walletId } = req.params;

  const expense = new Expense({
    walletId,
    categoryId,
    tagIds,
    amount,
    date,
  });

  try {
    const savedExpense = await expense.save();

    res.status(200).json({
      success: true,
      expense: savedExpense,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.ExpenseCreationError,
      error,
    });
  }
};
