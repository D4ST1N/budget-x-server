import { Request, Response } from "express";

import Tag, { CreateTagDTO } from "../../models/Tag";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, UpdateTagResponse } from "../../types/Response";

export const updateTag = async (
  req: Request,
  res: Response<UpdateTagResponse | ErrorResponse>
) => {
  const { name }: CreateTagDTO = req.body;
  const { tagId } = req.params;

  try {
    const tag = await Tag.findOneAndUpdate(
      { _id: tagId },
      { name },
      { new: true }
    );

    if (!tag) {
      return res.status(404).json({
        errorType: ErrorType.TagNotFound,
      });
    }

    tag.name = name;

    const savedTag = await tag.save();

    res.status(200).json({
      tag: savedTag,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.TagUpdateError,
      error,
    });
  }
};
