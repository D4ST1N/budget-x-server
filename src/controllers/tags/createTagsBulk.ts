import { Request, Response } from "express";
import mongoose from "mongoose";

import Tag from "../../models/Tag";
import { ErrorType } from "../../types/ErrorType";
import { CreateTagsBulkResponse, ErrorResponse } from "../../types/Response";

export const createTagsBulk = async (
  req: Request,
  res: Response<CreateTagsBulkResponse | ErrorResponse>
) => {
  const { tags }: { tags: string[] } = req.body;
  const { walletId } = req.params;

  try {
    const existingTags = await Tag.find({
      walletId: new mongoose.Types.ObjectId(walletId),
      name: { $in: tags },
    });
    const existingTagNames = existingTags.map((tag) => tag.name);
    const newTagNames = tags.filter((name) => !existingTagNames.includes(name));
    const createdTags = await Tag.insertMany(
      newTagNames.map((name) => ({ name }))
    );

    res.status(200).json({
      createdTags,
      existingTags,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.TagCreationError,
      error,
    });
  }
};
