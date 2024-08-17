import { Request, Response } from "express";

import Category from "../../models/Category";

export const getCategories = async (req: Request, res: Response) => {
  const { walletId } = req.params;

  const categories = await Category.find({ walletId });

  res.status(200).json({
    success: true,
    categories,
  });
};
