import mongoose from "mongoose";

const InvitationSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  token: { type: String, required: true },
  uses: { type: Number, default: 0 },
  maxUses: { type: Number, required: true },
  expires: { type: Date, required: true },
});

const Invitation = mongoose.model("Invitation", InvitationSchema);

export default Invitation;
