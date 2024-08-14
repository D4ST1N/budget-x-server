import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  key: String,
  name: String,
  userId: mongoose.Types.ObjectId,
  icon: String,
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
