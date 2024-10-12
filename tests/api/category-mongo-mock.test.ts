import { Request, Response } from "express";
import mongoose from "mongoose";

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../../src/controllers/category";
import Category from "../../src/models/Category";
import Expense from "../../src/models/Expense";
import { ErrorType } from "../../src/types/ErrorType";

jest.mock("../../src/models/Category");
jest.mock("../../src/models/Expense");

describe("Category Mongo error handling", () => {
  const mockError = new Error("Database error");
  let req: Request;
  let res: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn();
    mockSend = jest.fn();

    req = {
      params: { walletId: new mongoose.Types.ObjectId().toString() },
    } as unknown as Request;

    res = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };

    jest.clearAllMocks();
  });

  it("should handle error when creating category", async () => {
    req = {
      params: { walletId: new mongoose.Types.ObjectId().toString() },
      body: {
        name: "Test Category",
      },
    } as unknown as Request;

    (Category.findOne as jest.Mock).mockResolvedValue(null);
    (Category as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(mockError),
    }));

    await createCategory(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.CategoryCreationError,
      error: mockError,
    });
  });

  it("should handle error when updating category", async () => {
    req = {
      params: { walletId: new mongoose.Types.ObjectId().toString() },
      body: {
        name: "Test Category Updated",
      },
    } as unknown as Request;

    (Category.findOne as jest.Mock).mockRejectedValue(mockError);

    await updateCategory(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.CategoryUpdateError,
      error: mockError,
    });
  });

  it("should handle error when deleting category", async () => {
    req = {
      params: {
        walletId: new mongoose.Types.ObjectId().toString(),
        categoryId: new mongoose.Types.ObjectId().toString(),
      },
    } as unknown as Request;

    (Expense.find as jest.Mock).mockResolvedValue([]);
    (Category.findOneAndDelete as jest.Mock).mockRejectedValue(mockError);

    await deleteCategory(req, res as Response);

    expect(Category.findOneAndDelete).toHaveBeenCalledWith({
      _id: req.params.categoryId,
    });
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.CategoryDeletionError,
      error: mockError,
    });
  }, 20000);
});
