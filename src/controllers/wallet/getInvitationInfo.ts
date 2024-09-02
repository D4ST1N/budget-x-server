import { Request, Response } from "express";

import Invitation from "../../models/Invitation";
import Wallet from "../../models/Wallet";
import { stytchClient } from "../../routes/auth";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, GetInvitationLinkResponse } from "../../types/Response";

export const getInvitationInfo = async (
  req: Request,
  res: Response<GetInvitationLinkResponse | ErrorResponse>
) => {
  const { token } = req.params;
  const invitation = await Invitation.findOne({ token });

  if (!invitation) {
    res.status(404).json({
      errorType: ErrorType.InvitationNotFound,
    });

    return;
  }

  const wallet = await Wallet.findById(invitation.wallet);

  if (!wallet) {
    res.status(404).send({
      errorType: ErrorType.WalletNotFound,
    });

    return;
  }

  const { results } = await stytchClient.users.search({
    query: {
      operator: "AND",
      operands: [
        {
          filter_name: "user_id",
          filter_value: [wallet.creator],
        },
      ],
    },
  });
  const [creator] = results;

  if (!creator) {
    res.status(404).json({
      errorType: ErrorType.UserNotFound,
    });

    return;
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
