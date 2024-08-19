import Tag, { CreateTagDTO } from "../../models/Tag";
import { Request, Response } from "express";
import { ErrorType } from "../../types/ErrorType";

export const updateTag = async (req: Request, res: Response) => {
  const { name }: CreateTagDTO = req.body;
  const { tagId } = req.params;

  try {
    const tag = await Tag.findOneAndUpdate(
      { _id: tagId },
      { name },
      { new: true }
    );

    if (!tag) {
      res.status(200).json({
        success: false,
        errorType: ErrorType.TagNotFound,
      });
      return;
    }

    tag.name = name;

    const savedTag = await tag.save();

    res.status(200).json({
      success: true,
      tag: savedTag,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.TagUpdateError,
      error,
    });
  }
};
