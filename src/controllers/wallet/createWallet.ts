import { Request, Response } from "express";

import Wallet from "../../models/Wallet";
import { ErrorType } from "../../types/ErrorType";
import { CreateWalletResponse, ErrorResponse } from "../../types/Response";

export const createWallet = async (
  req: Request,
  res: Response<CreateWalletResponse | ErrorResponse>
) => {
  const walletData = req.body;

  const existedWallet = await Wallet.findOne({
    creator: walletData.creator,
    name: walletData.name,
  });

  if (existedWallet) {
    res.status(500).json({
      errorType: ErrorType.WalletExists,
    });

    return;
  }

  const wallet = new Wallet(walletData);

  try {
    const createdWallet = await wallet.save();

    res.status(200).json({
      wallet: createdWallet,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.WalletCreationError,
      error,
    });
  }
};
