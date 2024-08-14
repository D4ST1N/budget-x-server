import crypto from "crypto";
import { Request, Response } from "express";
import { ErrorType } from "../../types/ErrorType";
import Invitation from "../../models/Invitation";
import mongoose from "mongoose";

export const createWalletInvitation = async (req: Request, res: Response) => {
  const { walletId } = req.params;
  const { maxUses = 1, expiresIn = 2 * 60 * 60 * 1000 } = req.body;
  const token = crypto.randomBytes(20).toString("hex");
  const expires = new Date(Date.now() + expiresIn);

  try {
    const invitation = new Invitation({
      wallet: new mongoose.Types.ObjectId(walletId),
      token,
      maxUses,
      expires,
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
