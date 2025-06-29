import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createOrder } from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/create-order", protect, createOrder);

export default orderRouter;
