import { NextFunction, Request, Response } from "express";

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
