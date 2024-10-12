import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import Wallet, { IAllowedUser, IWallet } from "../models/Wallet";
import { AccessLevel } from "../types/AccessLevel";
import { ErrorType } from "../types/ErrorType";

export const checkUserId = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      errorType: ErrorType.UserIdNotProvided,
    });
  }

  next();
};

export const checkBodyUserId = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      errorType: ErrorType.UserIdNotProvided,
    });
  }

  next();
};

export const checkWalletId = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { walletId } = req.params;

  if (!walletId) {
    return res.status(400).json({
      success: false,
      errorType: ErrorType.WalletIdNotProvided,
    });
  }

  if (!mongoose.Types.ObjectId.isValid(walletId)) {
    return res.status(400).json({
      success: false,
      errorType: ErrorType.WalletIdIsInvalid,
    });
  }

  next();
};

export const checkWalletUsers = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const walletData = req.body;

  if (!Array.isArray(walletData.allowedUsers)) {
    return res.status(400).json({
      errorType: ErrorType.WalletUserDataIsInvalid,
    });
  }

  const users: unknown[] = walletData.allowedUsers;

  if (!users.every((user) => isValidAllowedUser(user))) {
    return res.status(400).json({
      errorType: ErrorType.WalletUserDataIsInvalid,
    });
  }

  next();
};

function isValidAllowedUser(user: unknown): user is IAllowedUser {
  if (typeof user !== "object" || user === null) {
    return false;
  }

  const { userId, accessLevels } = user as IAllowedUser;

  if (typeof userId !== "string" || userId.trim() === "") {
    return false;
  }

  if (!Array.isArray(accessLevels) || accessLevels.length === 0) {
    return false;
  }

  return accessLevels.every((level) =>
    Object.values(AccessLevel).includes(level)
  );
}

export const checkWalletName = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const walletData = req.body;

  if (!walletData.name) {
    return res.status(400).json({
      errorType: ErrorType.WalletNameNotProvided,
    });
  }

  if (typeof walletData.name !== "string") {
    return res.status(400).json({
      errorType: ErrorType.WalletNameIsInvalid,
    });
  }

  next();
};

export const checkWalletNameForUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const walletData = req.body;

  if (walletData.name === undefined) {
    return next();
  }

  return checkWalletName(req, res, next);
};

export const checkWalletCreator = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const walletData = req.body;

  if (!walletData.creator) {
    return res.status(400).json({
      errorType: ErrorType.CreatorIdNotProvided,
    });
  }

  next();
};

export const checkWalletCreatorForUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const walletData = req.body;

  if (walletData.creator === undefined) {
    return next();
  }

  return checkWalletCreator(req, res, next);
};

export const checkWalletData = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const walletData = req.body;

  if (!walletData) {
    return res.status(400).json({
      success: false,
      errorType: ErrorType.WalletDataNotProvided,
    });
  }

  next();
};

export const checkInvitationToken = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      errorType: ErrorType.InvitationTokenNotProvided,
    });
  }

  next();
};

export const checkParentCategoryId = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { parentCategory } = req.body;

  if (parentCategory && !mongoose.Types.ObjectId.isValid(parentCategory)) {
    return res.status(400).json({
      success: false,
      errorType: ErrorType.ParentCategoryIdIsInvalid,
    });
  }

  next();
};

export const checkUserAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { userId } = req;
  const { walletId } = req.params;

  if (!userId) {
    res.status(400).json({
      success: false,
      errorType: ErrorType.UserIdNotProvided,
    });
  }

  const wallet = (await Wallet.findOne({ _id: walletId })) as IWallet;

  if (
    wallet.creator !== userId &&
    !wallet.allowedUsers.some((user) => user.userId !== userId)
  ) {
    return res.status(403).json({
      success: false,
      errorType: ErrorType.AccessDenied,
    });
  }

  next();
};

export const checkWalletAccess = (requiredAccessLevel: AccessLevel[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req;
      const { walletId } = req.params;

      if (!userId) {
        return res.status(403).json({
          success: false,
          errorType: ErrorType.UserIdNotProvided,
        });
      }

      const wallet = (await Wallet.findById(walletId)) as IWallet;

      if (!wallet) {
        return res.status(404).json({
          success: false,
          errorType: ErrorType.WalletNotFound,
        });
      }

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
        res.status(403).json({
          success: false,
          errorType: ErrorType.AccessDenied,
        });

        return;
      }

      next();
    } catch (error) {
      res.status(403).json({
        success: false,
        errorType: ErrorType.AccessCheckFailed,
        error,
      });
    }
  };
};
