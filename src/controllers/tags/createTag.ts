import { Request, Response } from "express";
import mongoose from "mongoose";

import Tag, { CreateTagDTO } from "../../models/Tag";
import { ErrorType } from "../../types/ErrorType";

export const createTag = async (req: Request, res: Response) => {
  const { name }: CreateTagDTO = req.body;
  const { walletId } = req.params;

  try {
    const newTag = new Tag({
      name,
      walletId: new mongoose.Types.ObjectId(walletId),
    });
    const savedTag = await newTag.save();

    res.status(200).json({
      success: true,
      tag: savedTag,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.TagCreationError,
      error,
    });
  }
};
