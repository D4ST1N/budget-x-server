import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema({
  name: String,
  creator: String,
  allowedUsers: [String],
});

const Wallet = mongoose.model("Wallet", WalletSchema);

export default Wallet;
