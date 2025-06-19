import User from "../models/user.model.js";

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    console.error("Error in adminMiddleware:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export { isAdmin };
