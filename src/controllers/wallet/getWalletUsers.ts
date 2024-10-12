import { Request, Response } from "express";

import { findUsers } from "../../helpers/findUsers";
import Wallet, { IWallet } from "../../models/Wallet";
import { stytchClient } from "../../routes/auth";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, FetWalletUsersResponse } from "../../types/Response";

export const getWalletUsers = async (
  req: Request,
  res: Response<FetWalletUsersResponse | ErrorResponse>
) => {
  const { walletId } = req.params;

  try {
    const wallet = (await Wallet.findOne({ _id: walletId })) as IWallet;

    const { allowedUsers } = wallet;

    const results = await findUsers(
      "OR",
      allowedUsers.map(({ userId }) => userId)
    );

    const users = results.map(({ name, providers, user_id }) => ({
      name,
      providers,
      user_id,
    }));

    res.status(200).json({
      users,
    });
  } catch (error) {
    res.status(500).json({
      errorType: ErrorType.UserFetchError,
      error,
    });
  }
};
