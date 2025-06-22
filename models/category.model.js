import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: [
      {
        url: { type: String, required: false },
        public_id: { type: String, required: false },
      },
    ],
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);
export default Category;
