import { Request, Response } from "express";
import Category from "../../models/Category";
import { ErrorType } from "../../types/ErrorType";

export const deleteCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  try {
    const category = await Category.findOneAndDelete({ _id: categoryId });

    if (!category) {
      res.status(200).json({
        success: false,
        errorType: ErrorType.CategoryNotFound,
      });

      return;
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(200).send({
      success: false,
      errorType: ErrorType.CategoryDeleteError,
      error,
    });
  }
};
