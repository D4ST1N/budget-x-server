import { Request, Response } from "express";
import mongoose from "mongoose";

import Category, { CreateCategoryDTO } from "../../models/Category";
import { ErrorType } from "../../types/ErrorType";

export const createCategory = async (req: Request, res: Response) => {
  const { name, parentCategory }: CreateCategoryDTO = req.body;
  const { walletId } = req.params;

  try {
    if (parentCategory) {
      const parentCategoryExists = await Category.findById(parentCategory);

      if (!parentCategoryExists) {
        res.status(200).json({
          success: false,
          errorType: ErrorType.ParentCategoryNotFound,
        });
        return;
      }
    }

    const newCategory = new Category({
      name,
      walletId: new mongoose.Types.ObjectId(walletId),
      parentCategory: parentCategory
        ? new mongoose.Types.ObjectId(parentCategory)
        : null,
    });

    const savedCategory = await newCategory.save();

    res.status(200).json({
      success: true,
      category: savedCategory,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.CategoryCreationError,
      error,
    });
  }
};
