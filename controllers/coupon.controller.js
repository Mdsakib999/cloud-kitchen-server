import Coupon from "../models/coupon.model.js";

// Create a new coupon
const createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all coupons
const getCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json(coupons);
};

// Update coupon
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ success: true, coupon });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete coupon
const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Validate coupon during checkout
const CheckCouponValidation = async (req, res) => {
  const { code, cartTotal } = req.body;

  const coupon = await Coupon.findOne({ code });

  if (!coupon) return res.status(404).json({ error: "Invalid coupon code" });

  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate || !coupon.isActive) {
    return res.status(400).json({ error: "Coupon expired or inactive" });
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ error: "Coupon usage limit reached" });
  }

  if (cartTotal < coupon.minPurchaseAmount) {
    return res
      .status(400)
      .json({ error: `Minimum order amount is ${coupon.minPurchaseAmount}` });
  }

  let discount = coupon.discountAmount;
  if (coupon.type === "percentage") {
    discount = (cartTotal * discount) / 100;
  }

  res.status(200).json({ success: true, discount });
};

export {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  CheckCouponValidation,
};
