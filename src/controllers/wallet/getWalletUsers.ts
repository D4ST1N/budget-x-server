import { Request, Response } from "express";
import { ErrorType } from "../../types/ErrorType";
import Wallet from "../../models/Wallet";
import { client } from "../../routes/auth";

export const getWalletUsers = async (req: Request, res: Response) => {
  const { walletId } = req.params;

  try {
    const wallet = await Wallet.findOne({ _id: walletId });

    if (!wallet) {
      res.status(200).json({
        success: false,
        errorType: ErrorType.WalletNotFound,
      });

      return;
    }

    const { allowedUsers } = wallet;

    const { results } = await client.users.search({
      query: {
        operator: "OR",
        operands: [
          {
            filter_name: "user_id",
            filter_value: allowedUsers,
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
      success: true,
      users,
    });
  } catch (error) {
    res.status(200).send({
      success: false,
      errorType: ErrorType.UserFetchError,
      error,
    });
  }
};
