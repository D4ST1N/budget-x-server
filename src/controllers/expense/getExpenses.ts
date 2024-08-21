import { Request, Response } from "express";
import mongoose from "mongoose";

import Category from "../../models/Category";
import Expense from "../../models/Expense";
import Tag from "../../models/Tag";
import { ErrorType } from "../../types/ErrorType";

interface GetExpensesQuery {
  month?: string;
  year?: string;
  categories?: string;
  tags?: string;
}

export const getExpenses = async (req: Request, res: Response) => {
  const { month, year, categories, tags }: GetExpensesQuery = req.query;
  const { walletId } = req.params;

  try {
    const query: any = { walletId: new mongoose.Types.ObjectId(walletId) };

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    query.date = {
      $gte: new Date(
        Number(year || currentYear),
        Number(month || currentMonth),
        1
      ),
      $lte: new Date(
        Number(year || currentYear),
        Number(month || currentMonth) + 1,
        1
      ),
    };

    if (categories) {
      const categoryIds = (categories as string)
        .split(",")
        .map((id) => new mongoose.Types.ObjectId(id));
      query.category = { $in: categoryIds };
    }

    if (tags) {
      const tagIds = (tags as string)
        .split(",")
        .map((id) => new mongoose.Types.ObjectId(id));
      query.tags = { $in: tagIds };
    }

    const expenses = await Expense.find(query);

    const categoryIds = [...new Set(expenses.map((exp) => exp.categoryId))];
    const tagIds = [...new Set(expenses.flatMap((exp) => exp.tagIds))];

    const usedCategories = await Category.find({ _id: { $in: categoryIds } });
    const usedTags = await Tag.find({ _id: { $in: tagIds } });

    res.status(200).json({
      success: true,
      expenses,
      categories: usedCategories,
      tags: usedTags,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.ExpenseFetchError,
      error,
    });
  }
};
