import { Request, Response } from "express";

import Wallet from "../../models/Wallet";
import { ErrorType } from "../../types/ErrorType";

export const getUserWallets = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const wallets = await Wallet.find({ creator: userId });
    const sharedWallets = await Wallet.find({ "allowedUsers.userId": userId });

    res.status(200).json({
      success: true,
      wallets,
      sharedWallets,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.WalletFetchError,
      error,
    });
  }
};
