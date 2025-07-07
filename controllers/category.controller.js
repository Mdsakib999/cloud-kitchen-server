import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../config/cloudinary.js";
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
  if (req.file) {
    try {
      // Fixed: Use the correct variable name
      const result = await uploadToCloudinary(req.file.buffer, "categories");
      imageArray.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500);
      throw new Error("Failed to upload image");
    }
  }

  const category = await Category.create({ name, image: imageArray });
  res.status(201).json(category);
});

// @desc    Edit category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const editCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Update name if provided
  if (name) {
    // Check for duplicates (excluding current category)
    const exists = await Category.findOne({ name, _id: { $ne: id } });
    if (exists) {
      res.status(400);
      throw new Error("Category name already exists");
    }
    category.name = name;
  }

  // Update image if provided
  if (req.file) {
    try {
      // Delete old image from Cloudinary if exists
      if (category.image && category.image.length > 0) {
        // Delete old image
        await deleteFromCloudinary(category.image[0].public_id);
      }

      // Upload new image
      const result = await uploadToCloudinary(req.file.buffer, "categories");
      category.image = [
        {
          url: result.secure_url,
          public_id: result.public_id,
        },
      ];
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500);
      throw new Error("Failed to upload image");
    }
  } else if (req.body.removeImage === "true") {
    // Remove image if requested
    if (category.image && category.image.length > 0) {
      await deleteFromCloudinary(category.image[0].public_id);
      category.image = [];
    }
  }

  const updatedCategory = await category.save();
  res.json(updatedCategory);
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

export { addCategory, editCategory, deleteCategory, getCategories };
