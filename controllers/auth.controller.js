import { uploadToCloudinary } from "../config/cloudinary.js";
import admin from "../config/firebase.js";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";

const registerUser = async (req, res) => {
  const { name, email, phone, address, provider, uid, role } = req.body;

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const idToken = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (decodedToken.uid !== uid) {
      return res.status(401).json({ message: "Invalid token" });
    }

    let user = await User.findOne({ $or: [{ email }, { uid }] });

    if (!user) {
      // Register new user
      const userData = {
        name,
        email,
        provider,
        phone: phone || null,
        address: address || null,
        uid,
        role: role || "user",
        isEmailVerified: decodedToken.email_verified || false,
      };

      user = new User(userData);
      await user.save();
    }

    const token = generateToken(user._id);
    res.status(user ? 200 : 201).json({
      token,
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
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const idToken = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const user = await User.findOne({ email: decodedToken?.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified !== decodedToken.email_verified) {
      user.isEmailVerified = decodedToken.email_verified;
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      provider: user.provider,
      uid: user.uid,
      role: user.role,
      createdAt: user.createdAt,
      isEmailVerified: user.isEmailVerified,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Error in verifyToken:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// auth.controller.js
const handleEmailVerification = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "No token provided" });
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("from decodedToken===>", decodedToken);

    const user = await User.findOne({ email: decodedToken.email });
    console.log("from handleEmailVerification===>", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (decodedToken.email_verified && !user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }
    res
      .status(200)
      .json({ message: "Email verified successfully", isEmailVerified: true });
  } catch (error) {
    console.error("Error in handleEmailVerification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const updateUser = async (req, res) => {
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
        profilePictureUrl = await uploadToCloudinary(
          req.file.buffer,
          "profile-pictures", // folder name in cloudinary
          "image"
        );
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

const deleteUser = async (req, res) => {
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

export {
  registerUser,
  verifyToken,
  handleEmailVerification,
  updateUser,
  deleteUser,
  getAllUsers,
};
