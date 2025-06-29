import { model, Schema } from "mongoose";

const addonSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const itemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    food: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    addons: [addonSchema],
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    couponCode: {
      type: String,
      default: "",
    },
    isCouponApplied: {
      type: Boolean,
      default: false,
    },
    items: [itemSchema],
    totalPrice: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
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
