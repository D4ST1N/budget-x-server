import { Request, Response } from "express";

import Wallet from "../../models/Wallet";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, GetUserWalletsResponse } from "../../types/Response";

export const getUserWallets = async (
  req: Request,
  res: Response<GetUserWalletsResponse | ErrorResponse>
) => {
  try {
    const { userId } = req.params;
    const wallets = await Wallet.find({ creator: userId });
    const sharedWallets = await Wallet.find({ "allowedUsers.userId": userId });

    res.status(200).json({
      wallets,
      sharedWallets,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.WalletFetchError,
      error,
    });
  }
};
