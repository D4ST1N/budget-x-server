import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  walletId: mongoose.Types.ObjectId;
  parentCategory?: mongoose.Types.ObjectId;
}

export interface CreateCategoryDTO {
  name: string;
  parentCategory?: string;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
});

const Category = mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
