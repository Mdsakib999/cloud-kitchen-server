import express from "express";
import {
  registerUser,
  verifyToken,
  handleEmailVerification,
  logout,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/verify-token", verifyToken);
authRouter.post("/verify-email", handleEmailVerification);
authRouter.post("/logout", protect, logout);

export default authRouter;
