import { Request, Response } from "express";

import Wallet from "../../models/Wallet";
import { stytchClient } from "../../routes/auth";
import { ErrorType } from "../../types/ErrorType";
import { ErrorResponse, FetWalletUsersResponse } from "../../types/Response";

export const getWalletUsers = async (
  req: Request,
  res: Response<FetWalletUsersResponse | ErrorResponse>
) => {
  const { walletId } = req.params;

  try {
    const wallet = await Wallet.findOne({ _id: walletId });

    if (!wallet) {
      res.status(404).json({
        errorType: ErrorType.WalletNotFound,
      });

      return;
    }

    const { allowedUsers } = wallet;

    const { results } = await stytchClient.users.search({
      query: {
        operator: "OR",
        operands: [
          {
            filter_name: "user_id",
            filter_value: allowedUsers.map(({ userId }) => userId),
          },
        ],
      },
    });

    const users = results.map(({ name, providers, user_id }) => ({
      name,
      providers,
      user_id,
    }));

    res.status(200).json({
      users,
    });
  } catch (error) {
    res.status(500).send({
      errorType: ErrorType.UserFetchError,
      error,
    });
  }
};
