import { Request, Response } from "express";

import Invitation from "../../models/Invitation";
import Wallet from "../../models/Wallet";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, GetInvitationLinkResponse } from "../../types/Response";
import { findUsers } from "../../helpers/findUsers";

export const getInvitationInfo = async (
  req: Request,
  res: Response<GetInvitationLinkResponse | ErrorResponse>
) => {
  const { token } = req.params;
  const invitation = await Invitation.findOne({ token });

  if (!invitation) {
    return res.status(404).json({
      errorType: ErrorType.InvitationNotFound,
    });
  }

  const wallet = await Wallet.findById(invitation.wallet);

  if (!wallet) {
    return res.status(404).send({
      errorType: ErrorType.WalletNotFound,
    });
  }

  const results = await findUsers("AND", [wallet.creator]);
  const [creator] = results;

  if (!creator) {
    return res.status(404).json({
      errorType: ErrorType.UserNotFound,
    });
  }

  res.status(200).json({
    walletName: wallet.name,
    creator: {
      name: creator.name,
      user_id: creator.user_id,
      providers: creator.providers,
    },
  });
};
