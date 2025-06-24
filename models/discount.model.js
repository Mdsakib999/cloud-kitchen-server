import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const DiscountSchema = new Schema(
  {
    title: { type: String, required: true },

    // either a % off or a fixed $ off
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },

    // when it starts / ends
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },

    // scope by product or category
    products: [{ type: Types.ObjectId, ref: "Product" }],
    category: { type: Types.ObjectId, ref: "Category" },

    promoCode: { type: String },
  },
  { timestamps: true }
);

export const Discount = model("Discount", DiscountSchema);
