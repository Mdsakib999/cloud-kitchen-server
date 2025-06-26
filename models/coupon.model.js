import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discountAmount: { type: Number, required: true },
    type: { type: String, enum: ["flat", "percentage"], default: "flat" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    minPurchaseAmount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
