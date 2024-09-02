import { Request, Response } from "express";

import Expense from "../../models/Expense";
import { ErrorType } from "../../types/ErrorType";
import { DeleteExpenseResponse, ErrorResponse } from "../../types/Response";

export const deleteExpense = async (
  req: Request,
  res: Response<DeleteExpenseResponse | ErrorResponse>
) => {
  const { expenseId } = req.params;

  try {
    const deletedTag = await Expense.findByIdAndDelete(expenseId);

    if (!deletedTag) {
      return res.status(404).json({
        errorType: ErrorType.ExpenseNotFound,
      });
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.ExpenseDeletionError,
      error,
    });
  }
};
