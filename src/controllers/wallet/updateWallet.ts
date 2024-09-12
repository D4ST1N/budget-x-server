import { Request, Response } from "express";

import Wallet, { IWallet } from "../../models/Wallet";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, UpdateWalletResponse } from "../../types/Response";
import { WalletData } from "../../types/Wallet";

export const updateWallet = async (
  req: Request,
  res: Response<UpdateWalletResponse | ErrorResponse>
) => {
  const walletData: WalletData = req.body;

  const { walletId } = req.params;
  let wallet = (await Wallet.findOne({ _id: walletId })) as IWallet;

  if (walletData.creator && wallet.creator !== walletData.creator) {
    return res.status(400).json({
      errorType: ErrorType.WalletCreatorIsImmutable,
    });
  }

  wallet = Object.assign(wallet, walletData);

  try {
    const updatedWallet = await wallet.save();

    res.status(200).json({
      wallet: updatedWallet,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.WalletCreationError,
      error,
    });
  }
};
