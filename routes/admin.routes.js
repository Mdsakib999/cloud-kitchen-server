import express from "express";
import { createProduct } from "../controllers/product.controller.js";
import {
  addCategory,
  deleteCategory,
  editCategory,
  getCategories,
} from "../controllers/category.controller.js";
import { upload, uploadCategoryImage } from "../config/multer.js";

const adminRouter = express.Router();
// category
adminRouter.post("/categories", uploadCategoryImage, addCategory);
adminRouter.put("/categories/:id", uploadCategoryImage, editCategory);
adminRouter.delete("/categories/:id", deleteCategory);
adminRouter.get("/categories", getCategories);
// product
adminRouter.post("/products", upload.array("images"), createProduct);

export default adminRouter;
