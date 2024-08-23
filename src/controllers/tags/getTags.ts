import { Request, Response } from "express";

import Tag from "../../models/Tag";
import { ErrorResponse, GetTagsResponse } from "../../types/Response";

export const getTags = async (
  req: Request,
  res: Response<GetTagsResponse | ErrorResponse>
) => {
  const { walletId } = req.params;

  const tags = await Tag.find({ walletId });

  res.status(200).json({
    tags,
  });
};
