import { Request, Response } from "express";
import mongoose from "mongoose";

import {
  createTag,
  createTagsBulk,
  deleteTag,
  updateTag,
} from "../../src/controllers/tags";
import Tag from "../../src/models/Tag";
import { ErrorType } from "../../src/types/ErrorType";

jest.mock("../../src/models/Tag");

describe("Tag Mongo error handling", () => {
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
      params: { tagId: new mongoose.Types.ObjectId().toString() },
    } as unknown as Request;

    res = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };

    jest.clearAllMocks();
  });

  it("should handle error when creating tag", async () => {
    req = {
      params: { walletId: new mongoose.Types.ObjectId().toString() },
      body: {
        name: "Test Category",
      },
    } as unknown as Request;

    (Tag.findOne as jest.Mock).mockRejectedValue(mockError);

    await createTag(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.TagCreationError,
      error: mockError,
    });
  });

  it("should handle error when creating list of tags", async () => {
    req = {
      params: { walletId: new mongoose.Types.ObjectId().toString() },
      body: ["Tag 1", "Tag 2"],
    } as unknown as Request;

    (Tag.find as jest.Mock).mockRejectedValue(mockError);

    await createTagsBulk(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.TagCreationError,
      error: mockError,
    });
  });

  it("should handle error when updating tag", async () => {
    req = {
      params: {
        walletId: new mongoose.Types.ObjectId().toString(),
        tagId: new mongoose.Types.ObjectId().toString(),
      },
      body: {
        name: "Test Tag Updated",
      },
    } as unknown as Request;

    (Tag.findOneAndUpdate as jest.Mock).mockRejectedValue(mockError);

    await updateTag(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.TagUpdateError,
      error: mockError,
    });
  });

  it("should handle error when deleting tag", async () => {
    (Tag.findOneAndDelete as jest.Mock).mockRejectedValue(mockError);

    await deleteTag(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      errorType: ErrorType.TagDeletionError,
      error: mockError,
    });
  });
});
