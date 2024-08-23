import { Request, Response } from "express";

import Category from "../../models/Category";
import { ErrorType } from "../../types/ErrorType";
import { DeleteCategoryResponse, ErrorResponse } from "../../types/Response";

export const deleteCategory = async (
  req: Request,
  res: Response<DeleteCategoryResponse | ErrorResponse>
) => {
  const { categoryId } = req.params;

  try {
    const category = await Category.findOneAndDelete({ _id: categoryId });

    if (!category) {
      res.status(500).json({
        errorType: ErrorType.CategoryNotFound,
      });

      return;
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
