import { Request, Response } from "express";

import Invitation from "../../models/Invitation";
import Wallet, { IWallet } from "../../models/Wallet";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, JoinWallerResponse } from "../../types/Response";

export const joinWallet = async (
  req: Request,
  res: Response<JoinWallerResponse | ErrorResponse>
) => {
  const { token } = req.params;
  const { userId } = req;

  const invitation = await Invitation.findOne({ token });

  if (!invitation) {
    return res.status(404).json({
      errorType: ErrorType.InvitationNotFound,
    });
  }

  if (invitation.expires < new Date(Date.now())) {
    return res.status(400).json({
      errorType: ErrorType.InvitationExpired,
    });
  }

  if (invitation.uses >= invitation.maxUses) {
    return res.status(400).json({
      errorType: ErrorType.InvitationRunOut,
    });
  }

  const wallet = (await Wallet.findById(invitation.wallet)) as IWallet;

  if (!wallet) {
    return res.status(404).json({
      errorType: ErrorType.WalletNotFound,
    });
  }

  if (userId === wallet.creator) {
    return res.status(400).json({
      errorType: ErrorType.CannotInviteCreator,
    });
  }

  const existedUser = wallet.allowedUsers.find(
    (user) => user.userId === userId
  );

  if (!existedUser) {
    wallet.allowedUsers.push({
      userId: userId!,
      accessLevels: invitation.accessLevels,
    });
    invitation.uses += 1;
  } else {
    return res.status(400).json({
      errorType: ErrorType.UserAlreadyInWallet,
    });
  }

  await invitation.save();
  await wallet.save();

  res.status(200).json({
    success: true,
  });
};
