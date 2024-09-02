import { Request, Response } from "express";

import Wallet from "../../models/Wallet";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, LeaveWalletResponse } from "../../types/Response";

export const leaveWallet = async (
  req: Request,
  res: Response<LeaveWalletResponse | ErrorResponse>
) => {
  try {
    const { userId } = req;
    const { walletId } = req.params;
    const wallet = await Wallet.findOne({ _id: walletId });

    if (!wallet) {
      res.status(404).json({
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
      errorType: ErrorType.WalletLeaveError,
      error,
    });
  }
};
