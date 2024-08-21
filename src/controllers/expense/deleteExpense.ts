import { Request, Response } from "express";

import Expense from "../../models/Expense";
import { ErrorType } from "../../types/ErrorType";

export const deleteExpense = async (req: Request, res: Response) => {
  const { expenseId } = req.params;

  try {
    const deletedTag = await Expense.findByIdAndDelete(expenseId);

    if (!deletedTag) {
      res.status(200).json({
        success: false,
        errorType: ErrorType.ExpenseNotFound,
      });

      return;
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.ExpenseDeletionError,
      error,
    });
  }
};
