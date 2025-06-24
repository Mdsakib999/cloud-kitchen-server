import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { uploadProfilePicture } from "../config/multer.js";
import {
    getAllUsers,
    updateUser,
    deleteUser,
    makeAdmin,
    removeAdmin
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/all-users", protect, isAdmin, getAllUsers);
userRouter.put("/:id", protect, uploadProfilePicture, updateUser);
userRouter.delete("/:id", protect, deleteUser);
userRouter.put("/make-admin/:id", makeAdmin);
userRouter.put("/remove-admin/:id", removeAdmin);


export default userRouter;