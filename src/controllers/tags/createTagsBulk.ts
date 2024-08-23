import { Request, Response } from "express";
import mongoose from "mongoose";

import Tag, { CreateTagDTO } from "../../models/Tag";
import { ErrorType } from "../../types/ErrorType";
import { CreateTagsBulkResponse, ErrorResponse } from "../../types/Response";

export const createTagsBulk = async (
  req: Request,
  res: Response<CreateTagsBulkResponse | ErrorResponse>
) => {
  const { tags }: { tags: CreateTagDTO[] } = req.body;
  const { walletId } = req.params;

  try {
    const tagsToSave = tags.map((tag) => ({
      name: tag.name,
      walletId: new mongoose.Types.ObjectId(walletId),
    }));

    const savedTags = await Tag.insertMany(tagsToSave);

    res.status(200).json({
      tags: savedTags,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.TagCreationError,
      error,
    });
  }
};
