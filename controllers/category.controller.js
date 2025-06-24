import { uploadToCloudinary } from "../config/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import asyncHandler from "express-async-handler";
import Category from "../models/category.model.js";

// @desc    Add new category
// @route   POST /api/admin/categories
// @access  Private/Admin
const addCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  // Prevent duplicates
  const exists = await Category.findOne({ name });
  if (exists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  // Upload image to Cloudinary if provided
  let imageArray = [];
  if (req.file && req.file.buffer) {
    const result = await uploadToCloudinary(req.file.buffer, "categories");
    imageArray.push({
      url: result.secure_url,
      public_id: result.public_id,
    });
  }
  const category = await Category.create({ name, image: imageArray });
  res.status(201).json(category);
});

// @desc    Update existing category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const editCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Update name
  if (name) category.name = name;

  // Handle image replacement
  if (req.file && req.file.buffer) {
    // Delete existing
    for (const img of category.image) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }
    const result = await uploadToCloudinary(req.file.buffer, "categories");
    category.image = [{ url: result.secure_url, public_id: result.public_id }];
  }

  const updated = await category.save();
  res.json(updated);
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Cleanup images
  try {
    // Cleanup images if they exist
    for (const img of category.image) {
      if (img.public_id) {
        // log what you’re about to delete
        console.log(`Deleting Cloudinary public_id=${img.public_id}`);
        await cloudinary.uploader.destroy(img.public_id);
      }
    }
    await category.deleteOne();
    res.json({ message: "Category removed" });
  } catch (err) {
    console.error("Error in deleteCategory:", err);
    res.status(500);
    throw new Error("Failed to delete category");
  }
});

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json(categories);
});

// @desc    Add promotional offers
// @route   POST /api/admin/categories
// @access  Private/Admin
const PromoteOffers = async () => {};

export {
  addCategory,
  editCategory,
  deleteCategory,
  getCategories,
  PromoteOffers,
};
