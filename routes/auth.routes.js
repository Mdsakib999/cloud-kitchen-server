import express from "express";
import {
  registerUser,
  verifyToken,
  handleEmailVerification,
  logout,
  updateUser,
  deleteUser,
  getAllUsers,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { uploadProfilePicture } from "../config/multer.js";

const authRouter = express.Router();

authRouter.get("/all-users", protect, isAdmin, getAllUsers);
authRouter.post("/register", registerUser);
authRouter.post("/verify-token", verifyToken);
authRouter.post("/verify-email", handleEmailVerification);
authRouter.post("/logout", protect, logout);
authRouter.put("/:id", protect, uploadProfilePicture, updateUser);
authRouter.delete("/:id", protect, deleteUser);

export default authRouter;
