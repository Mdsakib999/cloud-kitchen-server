import express from "express";
import {
  addCategory,
  deleteCategory,
  editCategory,
  getCategories,
} from "../controllers/category.controller.js";
import multer from "multer";
import { createProduct } from "../controllers/product.controller.js";
import { PromoteOffers } from "../controllers/promote.controller.js";
const upload = multer();

const adminRouter = express.Router();
// category
adminRouter.post("/categories", upload.single("image"), addCategory);
adminRouter.put("/categories/:id", upload.single("image"), editCategory);
adminRouter.delete("/categories/:id", deleteCategory);
adminRouter.get("/categories", getCategories);
// product
adminRouter.post("/products", upload.array("images"), createProduct);
// promoteOffer
adminRouter.post("/promote-offers", upload.array("images", 4), PromoteOffers);

export default adminRouter;
