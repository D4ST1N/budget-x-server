import { Request, Response } from "express";

import Category from "../../models/Category";
import { ErrorResponse, GetCategoriesResponse } from "../../types/Response";

export const getCategories = async (
  req: Request,
  res: Response<GetCategoriesResponse | ErrorResponse>
) => {
  const { walletId } = req.params;

  const categories = await Category.find({ walletId });

  res.status(200).json({
    categories,
  });
};
