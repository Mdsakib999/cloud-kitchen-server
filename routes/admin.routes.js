import express from "express";
import {
  addCategory,
  deleteCategory,
  editCategory,
  getCategories,
} from "../controllers/admin.controller.js";
import { uploadCategoryImage } from "../config/multer.js";

const adminRouter = express.Router();
// category
adminRouter.post("/categories", uploadCategoryImage, addCategory);
adminRouter.put("/categories/:id", uploadCategoryImage, editCategory);
adminRouter.delete("/categories/:id", deleteCategory);
adminRouter.get("/categories", getCategories);

export default adminRouter;
