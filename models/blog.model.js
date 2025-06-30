import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, default: "" },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const BlogModel = mongoose.model("Blog", BlogSchema);
