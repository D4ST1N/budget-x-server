import { Request, Response } from "express";
import { ErrorType } from "../../types/ErrorType";
import Wallet from "../../models/Wallet";

export const deleteWallet = async (req: Request, res: Response) => {
  try {
    const { walletId } = req.params;
    const result = await Wallet.deleteOne({ _id: walletId });

    if (result.deletedCount === 0) {
      return res.status(200).json({
        success: false,
        errorType: ErrorType.WalletNotFound,
      });
    }

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
