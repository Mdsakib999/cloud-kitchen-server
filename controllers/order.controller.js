import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";
import mongoose from "mongoose";

const createOrder = async (req, res) => {
  try {
    const {
      user,
      name,
      phone,
      country,
      address,
      city,
      couponCode,
      isCouponApplied,
      items,
      totalPrice,
      discountPrice,
      paymentMethod,
    } = req.body;
    console.log("req.body==>", req.body);
    if (
      !user ||
      !name ||
      !phone ||
      !country ||
      !address ||
      !city ||
      !items ||
      !totalPrice
    ) {
      console.log("MISSING FIELDS");
      return res.status(400).json({ error: "Missing required fields" });
    }

    let finalDiscount = discountPrice;
    let finalTotal = totalPrice;

    if (isCouponApplied && couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (!coupon) {
        return res.status(400).json({ error: "Invalid or inactive coupon" });
      }

      if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ error: "Coupon usage limit reached" });
      }

      if (new Date() < coupon.startDate || new Date() > coupon.endDate) {
        return res
          .status(400)
          .json({ error: "Coupon expired or not yet valid" });
      }

      if (totalPrice < coupon.minPurchaseAmount) {
        return res.status(400).json({
          error: `Minimum purchase amount is ${coupon.minPurchaseAmount}`,
        });
      }

      coupon.usedCount += 1;
      if (coupon.usedCount >= coupon.usageLimit) {
        coupon.isActive = false;
      }
      await coupon.save();
    }

    const order = new Order({
      user: mongoose.Types.ObjectId.createFromHexString(user),
      name,
      phone,
      country,
      address,
      city,
      couponCode: couponCode || "",
      isCouponApplied: !!couponCode,
      items: items.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        food: mongoose.Types.ObjectId.createFromHexString(item.food),
        addons: item.addons || [],
      })),
      totalPrice: finalTotal,
      discountPrice: finalDiscount,
      paymentMethod,
      isPaid: paymentMethod === "card",
    });

    await order.save();
    console.log("order==>", order);
    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

export { createOrder };
