import { Request, Response } from "express";

import Expense, { CreateExpenseDTO } from "../../models/Expense";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, UpdateExpenseResponse } from "../../types/Response";

export const updateExpense = async (
  req: Request,
  res: Response<UpdateExpenseResponse | ErrorResponse>
) => {
  const { expenseId } = req.params;
  const { categoryId, tagIds, amount, date, isIncome }: CreateExpenseDTO =
    req.body;

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { categoryId, tagIds, amount, date, isIncome },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        errorType: ErrorType.ExpenseNotFound,
      });
    }

    res.status(200).json({
      expense: updatedExpense,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.ExpenseUpdateError,
      error,
    });
  }
};
