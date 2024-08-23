import { Request, Response } from "express";

import Invitation from "../../models/Invitation";
import Wallet from "../../models/Wallet";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, JoinWallerResponse } from "../../types/Response";

export const joinWallet = async (
  req: Request,
  res: Response<JoinWallerResponse | ErrorResponse>
) => {
  const { token } = req.params;
  const { userId } = req.body;

  const invitation = await Invitation.findOne({ token });

  if (!invitation) {
    res.status(500).json({
      errorType: ErrorType.InvitationNotFound,
    });

    return;
  }

  if (invitation.expires < new Date(Date.now())) {
    res.status(500).json({
      errorType: ErrorType.InvitationExpired,
    });

    return;
  }

  if (invitation.uses >= invitation.maxUses) {
    res.status(500).json({
      errorType: ErrorType.InvitationRunOut,
    });

    return;
  }

  const wallet = await Wallet.findById(invitation.wallet);

  if (!wallet) {
    res.status(500).send({
      errorType: ErrorType.WalletNotFound,
    });

    return;
  }

  if (!wallet.allowedUsers.includes(userId) && userId !== wallet.creator) {
    wallet.allowedUsers.push({
      userId,
      accessLevels: invitation.accessLevels,
    });
    invitation.uses += 1;
  }

  await invitation.save();
  await wallet.save();

  res.status(200).json({
    success: true,
  });
};
