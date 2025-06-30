import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    createOrder,
    deleteOrder,
    getAllOrders,
    getOrderById,
    getOrdersByUser,
    updateOrder,
} from "../controllers/order.controller.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const orderRouter = express.Router();

orderRouter.post("/create-order", protect, createOrder);
orderRouter.get("/all-orders", protect, isAdmin, getAllOrders);
orderRouter.get("/user/:id", protect, getOrdersByUser);
orderRouter.get("/:orderId", protect, getOrderById);
orderRouter.put("/:id", protect, updateOrder);
orderRouter.delete("/:id", protect, deleteOrder);

export default orderRouter;
