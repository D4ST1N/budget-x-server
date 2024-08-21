import { Request, Response } from "express";
import mongoose from "mongoose";

import Tag, { CreateTagDTO } from "../../models/Tag";
import { ErrorType } from "../../types/ErrorType";

export const createTagsBulk = async (req: Request, res: Response) => {
  const { tags }: { tags: CreateTagDTO[] } = req.body;
  const { walletId } = req.params;

  try {
    const tagsToSave = tags.map((tag) => ({
      name: tag.name,
      walletId: new mongoose.Types.ObjectId(walletId),
    }));

    const savedTags = await Tag.insertMany(tagsToSave);

    res.status(200).json({
      success: true,
      tags: savedTags,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.TagCreationError,
      error,
    });
  }
};
