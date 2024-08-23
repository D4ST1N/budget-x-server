import { Request, Response } from "express";

import Wallet from "../../models/Wallet";
import { ErrorType } from "../../types/ErrorType";
import { DeleteWalletUserResponse, ErrorResponse } from "../../types/Response";

export const deleteWalletUser = async (
  req: Request,
  res: Response<DeleteWalletUserResponse | ErrorResponse>
) => {
  try {
    const { walletId, userId } = req.params;
    const wallet = await Wallet.findOne({ _id: walletId });

    if (!wallet) {
      res.status(500).json({
        errorType: ErrorType.WalletNotFound,
      });

      return;
    }

    wallet.allowedUsers = wallet.allowedUsers.filter(
      (allowedUser) => allowedUser.userId !== userId
    );

    await wallet.save();

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      errorType: ErrorType.WalletDeletionError,
      error,
    });
  }
};
