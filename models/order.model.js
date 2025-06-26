import { model, Schema } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        food: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
  },
  { timestamps: true }
);

const Order = model("Order", orderSchema);
export default Order;
