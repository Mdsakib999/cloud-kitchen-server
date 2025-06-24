import { uploadToCloudinary } from "../config/cloudinary.js";
import asyncHandler from "express-async-handler";
import Category from "../models/category.model.js";
import { Product } from "../models/product.model.js";

// @desc    Create a new product
// @route   POST /api/admin/products
// @access  Private/Admin

export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
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

  // Parse JSON fields if sent as strings
  const parsedSizes = sizes ? JSON.parse(sizes) : [];
  const parsedAddons = addons ? JSON.parse(addons) : [];
  const parsedOptions = options ? JSON.parse(options) : [];
  const parsedIngredients = ingredients ? JSON.parse(ingredients) : [];

  const product = await Product.create({
    title,
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
