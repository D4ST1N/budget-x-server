import Tag from "../../models/Tag";
import { Request, Response } from "express";
import { ErrorType } from "../../types/ErrorType";

export const deleteTag = async (req: Request, res: Response) => {
  const { tagId } = req.params;

  try {
    const tag = await Tag.findOneAndDelete({ _id: tagId });

    if (!tag) {
      res.status(200).json({
        success: false,
        errorType: ErrorType.TagNotFound,
      });
      return;
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.TagDeleteError,
      error,
    });
  }
};
