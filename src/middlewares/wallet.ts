import { NextFunction, Request, Response } from "express";

import Wallet, { AccessLevel, IWallet } from "../models/Wallet";
import { ErrorType } from "../types/ErrorType";

export const checkUserId = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { userId } = req.params;

  if (!userId) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.UserIdNotProvided,
    });
  } else {
    next();
  }
};

export const checkBodyUserId = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { userId } = req.body;

  if (!userId) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.UserIdNotProvided,
    });
  } else {
    next();
  }
};

export const checkWalletId = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { walletId } = req.params;

  if (!walletId) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.WalletIdNotProvided,
    });
  } else {
    next();
  }
};

export const checkWalletData = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const walletData = req.body;

  if (!walletData) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.NoWalletData,
    });
  } else {
    next();
  }
};

export const checkInvitationToken = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { token } = req.params;

  if (!token) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.InvitationTokenNotProvided,
    });
  } else {
    next();
  }
};

export const checkUserAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const userId = req.headers["userid"] as string;
  const { walletId } = req.params;

  if (!userId) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.UserIdNotProvided,
    });
  }

  const wallet = (await Wallet.findOne({ _id: walletId })) as IWallet;

  if (
    wallet.creator !== userId &&
    !wallet.allowedUsers.some((user) => user.userId !== userId)
  ) {
    res.status(200).json({
      success: false,
      errorType: ErrorType.AccessDenied,
    });
  } else {
    next();
  }
};

export const checkWalletAccess = (requiredAccessLevel: AccessLevel[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.headers["userid"] as string;
      const { walletId } = req.params;

      if (!userId) {
        res.status(200).json({
          success: false,
          errorType: ErrorType.UserIdNotProvided,
        });

        return;
      }

      const wallet = (await Wallet.findById(walletId)) as IWallet;

      let userAccess;

      if (wallet.creator === userId) {
        userAccess = { accessLevels: [...Object.values(AccessLevel)] };
      } else {
        userAccess = wallet.allowedUsers.find((user) => user.userId === userId);
      }

      if (
        !userAccess ||
        !requiredAccessLevel.every((level) =>
          userAccess.accessLevels.includes(level)
        )
      ) {
        res.status(200).json({
          success: false,
          errorType: ErrorType.AccessDenied,
        });

        return;
      }

      next();
    } catch (error) {
      res.status(200).json({
        success: false,
        errorType: ErrorType.AccessCheckFailed,
        error,
      });
    }
  };
};
