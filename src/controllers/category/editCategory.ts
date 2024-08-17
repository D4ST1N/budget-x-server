import { Request, Response } from "express";

import Category, { CreateCategoryDTO } from "../../models/Category";
import { ErrorType } from "../../types/ErrorType";

export const editCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const { name, parentCategory }: CreateCategoryDTO = req.body;

  try {
    const category = await Category.findOneAndUpdate(
      { _id: categoryId },
      { name, parentCategory },
      { new: true }
    );

    if (!category) {
      res.status(200).json({
        success: false,
        errorType: ErrorType.CategoryNotFound,
      });

      return;
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(200).send({
      success: false,
      errorType: ErrorType.CategoryEditError,
      error,
    });
  }
};
