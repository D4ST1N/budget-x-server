import { Request, Response } from "express";
import { ErrorType } from "../../types/ErrorType";
import Wallet from "../../models/Wallet";
import { WalletData } from "../../types/Wallet";

export const updateWallet = async (req: Request, res: Response) => {
  const walletData: WalletData = req.body;

  const { walletId } = req.params;
  let wallet = await Wallet.findOne({ _id: walletId });

  if (!wallet) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.WalletNotFound,
    });

    return;
  }

  wallet = Object.assign(wallet, walletData);

  try {
    wallet.save();

    res.status(200).json({
      success: true,
      walletId: wallet._id,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.WalletCreationError,
      error,
    });
  }
};
