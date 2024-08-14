import { Request, Response } from "express";
import { ErrorType } from "../../types/ErrorType";
import Wallet from "../../models/Wallet";

export const createWallet = async (req: Request, res: Response) => {
  const walletData = req.body;

  const existedWallet = await Wallet.findOne({
    creator: walletData.creator,
    name: walletData.name,
  });

  if (existedWallet) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.WalletExists,
    });

    return;
  }

  const wallet = new Wallet(walletData);

  try {
    const createdWallet = await wallet.save();

    res.status(200).json({
      success: true,
      walletId: createdWallet._id,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.WalletCreationError,
      error,
    });
  }
};
