import { Request, Response } from "express";

import Invitation from "../../models/Invitation";
import Wallet from "../../models/Wallet";
import { client } from "../../routes/auth";
import { ErrorType } from "../../types/ErrorType";

export const getInvitationInfo = async (req: Request, res: Response) => {
  const { token } = req.params;
  const invitation = await Invitation.findOne({ token });

  if (!invitation) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.InvitationNotFound,
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

  const { results } = await client.users.search({
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
    res.status(200).json({
      success: false,
      errorType: ErrorType.UserNotFound,
    });

    return;
  }

  res.status(200).json({
    success: true,
    walletName: wallet.name,
    creator: {
      name: creator.name,
      user_id: creator.user_id,
      providers: creator.providers,
    },
  });
};
