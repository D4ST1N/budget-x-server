import { Request, Response } from "express";
import mongoose from "mongoose";

import Category from "../../models/Category";
import Expense from "../../models/Expense";
import Tag from "../../models/Tag";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, GetExpensesResponse } from "../../types/Response";

interface GetExpensesQuery {
  startDate?: string;
  endDate?: string;
  categories?: string;
  tags?: string;
  limit?: string;
}

export const getExpenses = async (
  req: Request,
  res: Response<GetExpensesResponse | ErrorResponse>
) => {
  const { startDate, endDate, categories, tags, limit }: GetExpensesQuery =
    req.query;
  const { walletId } = req.params;

  try {
    const query: any = { walletId: new mongoose.Types.ObjectId(walletId) };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      query.date = {
        $gte: new Date(currentYear, currentMonth, 1),
        $lte: new Date(currentYear, currentMonth + 1, 1),
      };
    }

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

    const expensesQuery = Expense.find(query);

    if (limit) {
      expensesQuery.limit(Number(limit));
    }

    const expenses = await expensesQuery.exec();

    const categoryIds = [...new Set(expenses.map((exp) => exp.categoryId))];
    const tagIds = [...new Set(expenses.flatMap((exp) => exp.tagIds))];

    const usedCategories = await Category.find({ _id: { $in: categoryIds } });
    const usedTags = await Tag.find({ _id: { $in: tagIds } });
    const parentCategories = await Category.find({
      _id: { $in: usedCategories.map((cat) => cat.parentCategory) },
    });

    res.status(200).json({
      expenses,
      categories: [...usedCategories, ...parentCategories],
      tags: usedTags,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.ExpenseFetchError,
      error,
    });
  }
};
