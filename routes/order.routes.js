import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    createOrder,
    deleteOrder,
    getAllOrders,
    getOrdersByUser,
    updateOrder,
} from "../controllers/order.controller.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const orderRouter = express.Router();

orderRouter.post("/create-order", protect, createOrder);
orderRouter.get("/all-orders", protect, isAdmin, getAllOrders);
orderRouter.get("/:id", protect, getOrdersByUser);
orderRouter.put("/:id", protect, updateOrder);
orderRouter.delete("/:id", protect, deleteOrder);

export default orderRouter;
