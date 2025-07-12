import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const ChoiceSchema = new Schema(
  {
    label: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number },
  },
  { _id: false }
);

const OptionGroupSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["single", "multiple"], required: true },
    required: { type: Boolean, default: false },
    choices: { type: [ChoiceSchema], required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    longDescription: { type: String },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    // ADD BASE PRICE FIELD
    // price: { type: Number, required: true, min: 0 },
    sizes: { type: [ChoiceSchema], default: [], required: true },
    addons: { type: [ChoiceSchema], default: [] },
    options: { type: [OptionGroupSchema], default: [] },
    ingredients: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
    cookTime: { type: String },
    servings: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

export const Product = model("Product", ProductSchema);
