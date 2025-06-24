import express from "express";
import {
  registerUser,
  verifyToken,
  handleEmailVerification,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/verify-token", verifyToken);
authRouter.post("/verify-email", handleEmailVerification);

export default authRouter;
