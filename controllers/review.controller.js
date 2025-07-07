import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

async function updateProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);
  if (stats.length) {
    await Product.findByIdAndUpdate(productId, {
      rating: stats[0].avgRating,
      reviews: stats[0].numReviews,
    });
  }
}

/**
 * @desc    Create a review for a product
 * @route   POST /api//user/reviews
 * @access  Private
 */
export const createReview = asyncHandler(async (req, res) => {
  const {
    product: productId,
    order: orderId,
    rating,
    title,
    comment,
  } = req.body;
  const userId = req.user._id;
  console.log(req.body);

  const order = await Order.findById(orderId);
  if (!order || order.user.toString() !== userId.toString()) {
    res.status(403);
    throw new Error("Not authorized to review this order");
  }

  const bought = order.items.some((item) => item.food.toString() === productId);
  if (!bought) {
    res.status(400);
    throw new Error("Cannot review a product you did not purchase");
  }

  let review;

  try {
    // review = await Review.create({
    //   user: userId,
    //   product: productId,
    //   order: orderId,
    //   rating,
    //   title,
    //   comment,
    // });
    review = await Review.findOneAndUpdate(
      { user: userId, product: productId, order: orderId },
      { rating, title, comment },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this item for this order.",
      });
    }
    throw err;
  }

  await updateProductRating(productId);

  res.status(201).json(review);
});

/**
 * @desc    Get paged reviews for a product
 * @route   GET /api/user/:productId/reviews
 * @access  Public
 */
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // fetch total count
  const total = await Review.countDocuments({ product: productId });

  // fetch page of reviews, most recent first
  const reviews = await Review.find({ product: productId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "name profilePicture")
    .lean();

  res.json({
    reviews,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});
