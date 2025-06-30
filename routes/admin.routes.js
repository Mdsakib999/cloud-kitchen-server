import express from "express";
import {
  addCategory,
  deleteCategory,
  editCategory,
  getCategories,
} from "../controllers/category.controller.js";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { upload, uploadCategoryImage } from "../config/multer.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import {
  createPromotionalOffer,
  deletePromotionalOffer,
  getPromotionalOffer,
  updatePromotionalOffer,
} from "../controllers/promote.controller.js";
import {
  CheckCouponValidation,
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
} from "../controllers/coupon.controller.js";
import {
  CreateBlog,
  DeleteBlog,
  getAllBlogs,
  getBlogById,
  UpdateBlog,
} from "../controllers/blog.controller.js";

const adminRouter = express.Router();

// category
adminRouter.post(
  "/categories",
  protect,
  isAdmin,
  uploadCategoryImage,
  addCategory
);

adminRouter.put(
  "/categories/:id",
  protect,
  isAdmin,
  uploadCategoryImage,
  editCategory
);
adminRouter.delete("/categories/:id", protect, isAdmin, deleteCategory);
adminRouter.get("/categories", protect, isAdmin, getCategories);

// product
adminRouter.post(
  "/products",
  protect,
  isAdmin,
  upload.array("images"),
  createProduct
);

adminRouter.put(
  "/products/:id",
  protect,
  isAdmin,
  upload.array("images"),
  updateProduct
);
adminRouter.delete("/products/:id", protect, isAdmin, deleteProduct);

// promoteOffer
adminRouter.post(
  "/add-offers",
  protect,
  isAdmin,
  upload.array("images", 4),
  createPromotionalOffer
);

adminRouter.get("/all-offers", getPromotionalOffer);

adminRouter.put(
  "/update-offer/:id",
  protect,
  isAdmin,
  upload.array("images", 4),
  updatePromotionalOffer
);

adminRouter.delete(
  "/delete-offer/:id",
  protect,
  isAdmin,
  deletePromotionalOffer
);

// coupon
adminRouter.post("/apply", protect, CheckCouponValidation);
adminRouter.post("/create", protect, isAdmin, createCoupon);
adminRouter.get("/", protect, isAdmin, getCoupons);
adminRouter.put("/:id", protect, isAdmin, updateCoupon);
adminRouter.delete("/:id", protect, isAdmin, deleteCoupon);

// Blogs
adminRouter.post(
  "/create-blog",
  protect,
  isAdmin,
  upload.single("image"),
  CreateBlog
);
adminRouter.get("/all-blogs", getAllBlogs);
adminRouter.put(
  "/blog/:id",
  protect,
  isAdmin,
  upload.single("image"),
  UpdateBlog
);
adminRouter.get("/blog/:id", getBlogById);
adminRouter.delete("/blog/:id", protect, isAdmin, DeleteBlog);

export default adminRouter;
