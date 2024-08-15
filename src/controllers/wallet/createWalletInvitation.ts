import crypto from "crypto";
import { Request, Response } from "express";
import mongoose from "mongoose";

import Invitation from "../../models/Invitation";
import { AccessLevel } from "../../models/Wallet";
import { ErrorType } from "../../types/ErrorType";

export const createWalletInvitation = async (req: Request, res: Response) => {
  const { walletId } = req.params;
  const {
    maxUses = 1,
    expiresIn = 2 * 60 * 60 * 1000,
    accessLevels = [AccessLevel.View],
  } = req.body;
  const token = crypto.randomBytes(20).toString("hex");
  const expires = new Date(Date.now() + expiresIn);

  try {
    const invitation = new Invitation({
      wallet: new mongoose.Types.ObjectId(walletId),
      token,
      maxUses,
      expires,
      accessLevels,
    });

    await invitation.save();

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(200).send({
      success: false,
      errorType: ErrorType.InvitationCreationError,
      error,
    });
  }
};
