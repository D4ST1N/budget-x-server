import { Request, Response } from "express";
import { ErrorType } from "../../types/ErrorType";
import Wallet from "../../models/Wallet";

export const deleteWalletUser = async (req: Request, res: Response) => {
  try {
    const { walletId, userId } = req.params;
    const wallet = await Wallet.findOne({ _id: walletId });

    if (!wallet) {
      res.status(200).json({
        success: false,
        errorType: ErrorType.WalletNotFound,
      });

      return;
    }

    wallet.allowedUsers = wallet.allowedUsers.filter(
      (allowedUserId) => allowedUserId !== userId
    );

    await wallet.save();

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(200).send({
      success: false,
      errorType: ErrorType.WalletDeletionError,
      error,
    });
  }
};
