import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";
import asyncHandler from "express-async-handler";
import Category from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import Order from "../models/order.model.js";

// @desc    Create a new product
// @route   POST /api/admin/products
// @access  Private/Admin

export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category: categoryId,
    sizes,
    addons,
    options,
    ingredients,
    cookTime,
    servings,
  } = req.body;

  // Basic validation
  if (!title || !categoryId) {
    res.status(400);
    throw new Error("Title and category are required");
  }

  // Verify category
  const category = await Category.findById(categoryId);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  let images = [];
  if (req.files && req.files.length) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, "products");
      images.push({ url: result.secure_url, public_id: result.public_id });
    }
  }

  const parsedSizes = sizes ? JSON.parse(sizes) : [];
  const parsedAddons = addons ? JSON.parse(addons) : [];
  const parsedOptions = options ? JSON.parse(options) : [];
  const parsedIngredients = ingredients ? JSON.parse(ingredients) : [];

  const product = await Product.create({
    title,
    description,
    category: category._id,
    images,
    sizes: parsedSizes,
    addons: parsedAddons,
    options: parsedOptions,
    ingredients: parsedIngredients,
    cookTime,
    servings,
  });

  res.status(201).json(product);
});

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category: categoryId,
    sizes,
    addons,
    options,
    ingredients,
    cookTime,
    servings,
  } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // If category is updated, verify it
  if (categoryId && categoryId !== product.category.toString()) {
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }
    product.category = category._id;
  }
  // image uploads
  if (req.files && req.files.length) {
    for (const img of product.images) {
      await deleteFromCloudinary(img.public_id);
    }
    product.images = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, "products");
      product.images.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
  }

  // Update other fields
  if (title) product.title = title;
  if (description) product.description = description;
  product.sizes = sizes ? JSON.parse(sizes) : product.sizes;
  product.addons = addons ? JSON.parse(addons) : product.addons;
  product.options = options ? JSON.parse(options) : product.options;
  product.ingredients = ingredients
    ? JSON.parse(ingredients)
    : product.ingredients;
  if (cookTime) product.cookTime = cookTime;
  if (servings) product.servings = servings;

  const updated = await product.save();
  const populated = await updated.populate("category", "name image");
  res.json(populated);
});

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Remove images from Cloudinary
  for (const img of product.images) {
    await deleteFromCloudinary(img.public_id);
  }

  await product.deleteOne();
  res.json({ message: "Product deleted successfully" });
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate("category", "name image")
    .exec();
  res.json(products);
});

// @desc    Get single product
// @route   GET /api/users/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name image")
    .exec();

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

// @desc    Get trending products
// @route   GET /api/admin/products/trending
// @access  Public

export const getTrendingProducts = asyncHandler(async (req, res) => {
  const { period = "weekly" } = req.query;

  const now = new Date();
  let fromDate = new Date();
  let previousFromDate = new Date();

  if (period === "daily") {
    fromDate.setDate(now.getDate() - 1);
    previousFromDate.setDate(fromDate.getDate() - 1);
  } else if (period === "monthly") {
    fromDate.setMonth(now.getMonth() - 1);
    previousFromDate.setMonth(fromDate.getMonth() - 1);
  } else {
    fromDate.setDate(now.getDate() - 7);
    previousFromDate.setDate(fromDate.getDate() - 7);
  }

  // Current period sales
  const currentSales = await Order.aggregate([
    { $match: { createdAt: { $gte: fromDate } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.food",
        totalSold: { $sum: "$items.qty" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } }
      },
    },
  ]);

  // Previous period sales
  const previousSales = await Order.aggregate([
    { $match: { createdAt: { $gte: previousFromDate, $lt: fromDate } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.food",
        totalSold: { $sum: "$items.qty" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } }
      },
    },
  ]);




  // Convert previous period sales to a quick-lookup map
  const prevSalesMap = {};
  for (const item of previousSales) {
    prevSalesMap[item._id.toString()] = item.totalSold;
  }

  // Sort and limit to TOP 6 instead of 10
  currentSales.sort((a, b) => b.totalSold - a.totalSold);
  const topSales = currentSales.slice(0, 6); // CHANGED: Show only top 6

  // Fetch product details and calculate trend
  const trending = await Promise.all(
    topSales.map(async (item, index) => {
      const product = await Product.findById(item._id).populate(
        "category",
        "name"
      );

      if (!product) {
        return null;
      }

      const prevSales = prevSalesMap[item._id.toString()] || 0;
      const change =
        prevSales === 0 ? 100 : ((item.totalSold - prevSales) / prevSales) * 100;
      const trend = change >= 0 ? "up" : "down";

      return {
        id: product._id,
        rank: index + 1,
        name: product.title,
        unitPrice: product.price,
        totalRevenue: item.totalRevenue,
        category: product.category?.name || "Unknown",
        image: product.images?.[0]?.url || "",
        sales: item.totalSold,
        percentage: Math.abs(Math.round(change)),
        trend,
      };


    })
  );

  // Filter out null values from deleted products
  const validTrending = trending.filter(item => item !== null);

  res.json(validTrending);
});
