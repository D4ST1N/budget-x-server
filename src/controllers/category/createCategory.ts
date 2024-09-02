import { Request, Response } from "express";
import mongoose from "mongoose";

import Category, { CreateCategoryDTO } from "../../models/Category";
import Expense from "../../models/Expense";
import { ErrorType } from "../../types/ErrorType";
import { CreateCategoryResponse, ErrorResponse } from "../../types/Response";

export const createCategory = async (
  req: Request,
  res: Response<CreateCategoryResponse | ErrorResponse>
) => {
  const { name, parentCategory, isIncomeCategory }: CreateCategoryDTO =
    req.body;
  const { walletId } = req.params;

  try {
    const existingCategory = await Category.findOne({
      name,
      walletId,
      parentCategory: parentCategory || null,
    });

    if (existingCategory) {
      return res.status(409).json({
        errorType: ErrorType.CategoryAlreadyExists,
      });
    }

    if (parentCategory) {
      const parentCategoryExists = await Category.findById(parentCategory);

      if (!parentCategoryExists) {
        return res.status(404).json({
          errorType: ErrorType.ParentCategoryNotFound,
        });
      }

      const expensesInParentCategory = await Expense.findOne({
        categoryId: parentCategory,
      });

      if (expensesInParentCategory) {
        return res.status(400).json({
          errorType: ErrorType.ParentCategoryHasExpenses,
        });
      }
    }

    const newCategory = new Category({
      name,
      walletId: new mongoose.Types.ObjectId(walletId),
      parentCategory: parentCategory
        ? new mongoose.Types.ObjectId(parentCategory)
        : null,
      isIncomeCategory,
    });

    const savedCategory = await newCategory.save();

    res.status(200).json({
      category: savedCategory,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.CategoryCreationError,
      error,
    });
  }
};
