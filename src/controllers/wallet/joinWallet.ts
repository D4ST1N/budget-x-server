import { Request, Response } from "express";
import { ErrorType } from "../../types/ErrorType";
import Invitation from "../../models/Invitation";
import Wallet from "../../models/Wallet";

export const joinWallet = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { userId } = req.body;

  const invitation = await Invitation.findOne({ token });

  if (!invitation) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.InvitationNotFound,
    });

    return;
  }

  if (invitation.expires < new Date(Date.now())) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.InvitationExpired,
    });

    return;
  }

  if (invitation.uses >= invitation.maxUses) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.InvitationRunOut,
    });

    return;
  }

  const wallet = await Wallet.findById(invitation.wallet);

  if (!wallet) {
    res.status(200).send({
      success: false,
      errorType: ErrorType.WalletNotFound,
    });

    return;
  }

  if (!wallet.allowedUsers.includes(userId) && userId !== wallet.creator) {
    wallet.allowedUsers.push(userId);
    invitation.uses += 1;
  }

  await invitation.save();
  await wallet.save();

  res.status(200).json({
    success: true,
  });
};
