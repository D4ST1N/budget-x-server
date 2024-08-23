import { Request, Response } from "express";

import Expense, { CreateExpenseDTO } from "../../models/Expense";
import { ErrorType } from "../../types/ErrorType";
import { CreateExpenseResponse, ErrorResponse } from "../../types/Response";

export const createExpense = async (
  req: Request,
  res: Response<CreateExpenseResponse | ErrorResponse>
) => {
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
      expense: savedExpense,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.ExpenseCreationError,
      error,
    });
  }
};
