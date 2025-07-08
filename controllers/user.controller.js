import { uploadToCloudinary } from "../config/cloudinary.js";
import admin from "../config/firebase.js";
import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateUser = async (req, res) => {
  const { name, phone, address } = req.body;
  const userId = req.params?.id || req.user?._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle profile picture upload if file is provided
    let profilePictureUrl = user.profilePicture;
    if (req.file) {
      try {
        const cloudinaryResult = await uploadToCloudinary(
          req.file.buffer,
          "profile-pictures",
          "image"
        );
        profilePictureUrl = cloudinaryResult.secure_url;
      } catch (uploadError) {
        console.error("Error uploading to Cloudinary:", uploadError);
        return res
          .status(500)
          .json({ message: "Failed to upload profile picture" });
      }
    }

    // Update user fields
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.profilePicture = profilePictureUrl;

    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      provider: user.provider,
      uid: user.uid,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.params?.id || req.user?._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await admin.auth().deleteUser(user.uid);
    await user.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
export const makeAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: "admin" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User promoted to admin successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const removeAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: "user" }, // Set back to regular user
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Admin role removed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error removing admin role:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
