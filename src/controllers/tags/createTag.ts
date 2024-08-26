import { Request, Response } from "express";
import mongoose from "mongoose";

import Tag, { CreateTagDTO } from "../../models/Tag";
import { ErrorType } from "../../types/ErrorType";
import { CreateTagResponse, ErrorResponse } from "../../types/Response";

export const createTag = async (
  req: Request,
  res: Response<CreateTagResponse | ErrorResponse>
) => {
  const { name }: CreateTagDTO = req.body;
  const { walletId } = req.params;

  try {
    const existingTag = await Tag.findOne({
      name,
      walletId,
    });

    if (existingTag) {
      res.status(500).json({
        errorType: ErrorType.TagAlreadyExists,
      });

      return;
    }

    const newTag = new Tag({
      name,
      walletId: new mongoose.Types.ObjectId(walletId),
    });
    const savedTag = await newTag.save();

    res.status(200).json({
      tag: savedTag,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.TagCreationError,
      error,
    });
  }
};
