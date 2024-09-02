import { Request, Response } from "express";

import Tag from "../../models/Tag";
import { ErrorType } from "../../types/ErrorType";
import { DeleteTagResponse, ErrorResponse } from "../../types/Response";

export const deleteTag = async (
  req: Request,
  res: Response<DeleteTagResponse | ErrorResponse>
) => {
  const { tagId } = req.params;

  try {
    const tag = await Tag.findOneAndDelete({ _id: tagId });

    if (!tag) {
      return res.status(404).json({
        errorType: ErrorType.TagNotFound,
      });
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.TagDeleteError,
      error,
    });
  }
};
