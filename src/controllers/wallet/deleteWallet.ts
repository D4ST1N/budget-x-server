import { Request, Response } from "express";

import Wallet from "../../models/Wallet";
import { ErrorType } from "../../types/ErrorType";
import { DeleteWalletResponse, ErrorResponse } from "../../types/Response";

export const deleteWallet = async (
  req: Request,
  res: Response<DeleteWalletResponse | ErrorResponse>
) => {
  try {
    const { walletId } = req.params;
    await Wallet.deleteOne({ _id: walletId });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.WalletDeletionError,
      error,
    });
  }
};
