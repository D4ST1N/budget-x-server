import { Request, Response } from "express";

import Tag from "../../models/Tag";

export const getTags = async (req: Request, res: Response) => {
  const { walletId } = req.params;

  const tags = await Tag.find({ walletId });

  res.status(200).json({
    success: true,
    tags,
  });
};
