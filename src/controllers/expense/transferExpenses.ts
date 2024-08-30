import { Request, Response } from "express";

import Category, { ICategory } from "../../models/Category";
import Expense from "../../models/Expense";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, TransferExpensesResponse } from "../../types/Response";
import mongoose from "mongoose";

export const transferExpenses = async (
  req: Request,
  res: Response<TransferExpensesResponse | ErrorResponse>
) => {
  const { walletId } = req.params;
  const { fromCategoryId } = req.body;

  try {
    const fromCategory = await Category.findById(fromCategoryId);
    let targetCategoryId = "";

    if (!fromCategory) {
      return res.status(500).json({
        errorType: ErrorType.SourceCategoryNotFound,
      });
    }

    if ("categoryName" in req.body) {
      const { categoryName, parentCategory } = req.body as {
        categoryName: string;
        parentCategory: string | null;
      };

      const existingCategory = await Category.findOne({
        name: categoryName,
        walletId,
        parentCategory: parentCategory || null,
      });

      if (existingCategory) {
        res.status(500).json({
          errorType: ErrorType.CategoryAlreadyExists,
        });

        return;
      }

      const newCategory = new Category({
        name: categoryName,
        walletId: new mongoose.Types.ObjectId(walletId),
        parentCategory: new mongoose.Types.ObjectId(parentCategory as string),
      });
      const savedCategory: ICategory = await newCategory.save();

      targetCategoryId = savedCategory._id as string;
    } else {
      const { toCategoryId } = req.body as { toCategoryId: string };
      const toCategory = await Category.findById(toCategoryId);

      if (!toCategory) {
        return res.status(500).json({
          errorType: ErrorType.TargetCategoryNotFound,
        });
      }

      targetCategoryId = toCategoryId;
    }

    const updatedExpenses = await Expense.updateMany(
      { categoryId: fromCategoryId },
      { categoryId: targetCategoryId }
    );

    res.status(200).json({
      expensesCount: updatedExpenses.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.ExpenseTransferError,
      error,
    });
  }
};
