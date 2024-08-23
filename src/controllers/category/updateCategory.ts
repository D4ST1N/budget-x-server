import { Request, Response } from "express";

import Category, { CreateCategoryDTO } from "../../models/Category";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, UpdateCategoryResponse } from "../../types/Response";

export const updateCategory = async (
  req: Request,
  res: Response<UpdateCategoryResponse | ErrorResponse>
) => {
  const { categoryId } = req.params;
  const { name, parentCategory }: CreateCategoryDTO = req.body;

  try {
    const category = await Category.findOneAndUpdate(
      { _id: categoryId },
      { name, parentCategory },
      { new: true }
    );

    if (!category) {
      res.status(500).json({
        errorType: ErrorType.CategoryNotFound,
      });

      return;
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
