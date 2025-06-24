import express from "express";
import {
  addCategory,
  deleteCategory,
  editCategory,
  getCategories,
} from "../controllers/category.controller.js";
import multer from "multer";
import { createProduct } from "../controllers/product.controller.js";
const upload = multer();

const adminRouter = express.Router();
// category
adminRouter.post("/categories", upload.single("image"), addCategory);
adminRouter.put("/categories/:id", upload.single("image"), editCategory);
adminRouter.delete("/categories/:id", deleteCategory);
adminRouter.get("/categories", getCategories);
// product
adminRouter.post("/products", upload.array("images"), createProduct);

export default adminRouter;
