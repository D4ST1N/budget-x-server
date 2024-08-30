import { Request, Response } from "express";

import Expense from "../../models/Expense";
import { ErrorType } from "../../types/ErrorType";
import { DeleteExpensesBulkResponse, ErrorResponse } from "../../types/Response";

export const deleteExpensesBulk = async (
  req: Request,
  res: Response<DeleteExpensesBulkResponse | ErrorResponse>
) => {
  const { categoryId } = req.params;

  try {
    const result = await Expense.deleteMany({ category: categoryId });

    if (result.deletedCount === 0) {
      res.status(500).json({
        errorType: ErrorType.ExpensesNotFound,
      });
      return;
    }

    res.status(200).json({
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.ExpenseDeletionError,
      error,
    });
  }
};
