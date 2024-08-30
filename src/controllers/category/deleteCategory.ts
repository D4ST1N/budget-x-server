import { Request, Response } from "express";

import Category from "../../models/Category";
import Expense from "../../models/Expense";
import { ErrorType } from "../../types/ErrorType";
import { DeleteCategoryResponse, ErrorResponse } from "../../types/Response";

export const deleteCategory = async (
  req: Request,
  res: Response<DeleteCategoryResponse | ErrorResponse>
) => {
  const { categoryId } = req.params;

  try {
    const expenses = await Expense.find({ categoryId });

    if (expenses.length > 0) {
      return res.status(500).json({
        errorType: ErrorType.CategoryHasExpenses,
      });
    }

    const category = await Category.findOneAndDelete({ _id: categoryId });

    if (!category) {
      return res.status(500).json({
        errorType: ErrorType.CategoryNotFound,
      });
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      errorType: ErrorType.CategoryDeleteError,
      error,
    });
  }
};
