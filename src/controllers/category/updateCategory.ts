import { Request, Response } from "express";

import Category, { CreateCategoryDTO } from "../../models/Category";
import Expense from "../../models/Expense";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, UpdateCategoryResponse } from "../../types/Response";

export const updateCategory = async (
  req: Request,
  res: Response<UpdateCategoryResponse | ErrorResponse>
) => {
  const { categoryId, walletId } = req.params;
  const {
    name,
    parentCategory: parentCategoryId,
    isIncomeCategory,
  }: CreateCategoryDTO = req.body;

  try {
    const existingCategory = await Category.findOne({
      name,
      walletId,
      parentCategory: parentCategoryId || null,
    });

    if (existingCategory) {
      return res.status(409).json({
        errorType: ErrorType.CategoryAlreadyExists,
      });
    }

    if (parentCategoryId) {
      const parentCategory = await Category.findById(parentCategoryId);

      if (!parentCategory) {
        return res.status(404).json({
          errorType: ErrorType.ParentCategoryNotFound,
        });
      }

      const expensesInParentCategory = await Expense.findOne({
        categoryId: parentCategoryId,
      });

      if (expensesInParentCategory) {
        return res.status(400).json({
          errorType: ErrorType.ParentCategoryHasExpenses,
        });
      }
    }

    const category = await Category.findOneAndUpdate(
      { _id: categoryId },
      { name, parentCategory: parentCategoryId, isIncomeCategory },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        errorType: ErrorType.CategoryNotFound,
      });
    }

    res.status(200).json({
      category,
    });
  } catch (error) {
    res.status(500).send({
      errorType: ErrorType.CategoryEditError,
      error,
    });
  }
};
