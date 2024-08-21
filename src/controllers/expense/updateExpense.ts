import { Request, Response } from "express";

import Expense, { CreateExpenseDTO } from "../../models/Expense";
import { ErrorType } from "../../types/ErrorType";

export const updateExpense = async (req: Request, res: Response) => {
  const { expenseId } = req.params;
  const { categoryId, tagIds, amount, date }: CreateExpenseDTO = req.body;

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { categoryId, tagIds, amount, date },
      { new: true }
    );

    if (!updatedExpense) {
      res.status(200).json({
        success: false,
        errorType: ErrorType.ExpenseNotFound,
      });

      return;
    }

    res.status(200).json({
      success: true,
      expense: updatedExpense,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.ExpenseUpdateError,
      error,
    });
  }
};
