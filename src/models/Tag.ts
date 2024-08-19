import mongoose, { Document, Schema } from "mongoose";

export interface ITag extends Document {
  name: string;
  walletId: mongoose.Types.ObjectId;
}

export interface CreateTagDTO {
  name: string;
  parentCategory?: string;
}

const TagSchema = new Schema<ITag>({
  name: { type: String, required: true },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
});

const Tag = mongoose.model<ITag>("Tag", TagSchema);

export default Tag;
