import { Request, Response } from "express";

import Wallet, { IAllowedUser, IWallet } from "../../models/Wallet";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, UpdateWalletUserResponse } from "../../types/Response";

export const updateWalletUserAccess = async (
  req: Request,
  res: Response<UpdateWalletUserResponse | ErrorResponse>
) => {
  const { walletId, userId } = req.params;
  const accessLevels = req.body;

  const wallet = (await Wallet.findOne({ _id: walletId })) as IWallet;

  if (!wallet.allowedUsers.find((user) => user.userId === userId)) {
    res.status(404).json({
      errorType: ErrorType.UserNotInWallet,
    });

    return;
  }

  const user = wallet.allowedUsers.find(
    (allowedUser) => allowedUser.userId === userId
  ) as IAllowedUser;

  user.accessLevels = accessLevels;

  await wallet.save();

  res.status(200).json({
    success: true,
  });
};
