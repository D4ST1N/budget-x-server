import mongoose, { Document, Schema } from "mongoose";

import { AccessLevel } from "../types/AccessLevel";

export interface IInvitation extends Document {
  wallet: mongoose.Schema.Types.ObjectId;
  token: string;
  uses: number;
  maxUses: number;
  expires: Date;
  accessLevels: AccessLevel[];
}

const InvitationSchema = new Schema<IInvitation>({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  token: { type: String, required: true },
  uses: { type: Number, default: 0 },
  maxUses: { type: Number, required: true },
  expires: { type: Date, required: true },
  accessLevels: {
    type: [String],
    enum: Object.values(AccessLevel),
    required: true,
  },
});

const Invitation = mongoose.model<IInvitation>("Invitation", InvitationSchema);

export default Invitation;
