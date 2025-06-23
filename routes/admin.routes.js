import express from "express";
import {
  addCategory,
  deleteCategory,
  editCategory,
  getCategories,
} from "../controllers/admin.controller.js";
import multer from "multer";
const upload = multer();

const adminRouter = express.Router();
// category
adminRouter.post("/categories", upload.single("image"), addCategory);
adminRouter.put("/categories/:id", upload.single("image"), editCategory);
adminRouter.delete("/categories/:id", deleteCategory);
adminRouter.get("/categories", getCategories);

export default adminRouter;
