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

    const existingUser = await User.findOne({ $or: [{ email }, { uid }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

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

    const user = new User(userData);
    await user.save();

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
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
    if (error.code === "auth/id-token-expired") {
      return res
        .status(401)
        .json({ message: "Token expired. Please sign in again." });
    }
    if (error.code === "auth/id-token-revoked") {
      return res
        .status(401)
        .json({ message: "Token revoked. Please sign in again." });
    }
    if (error.code === "auth/invalid-id-token") {
      return res
        .status(401)
        .json({ message: "Invalid token. Please sign in again." });
    }

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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      provider: user.provider,
      uid: user.uid,
      role: user.role,
      isEmailVerified: decodedToken.email_verified || user.isEmailVerified,
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

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export { registerUser, verifyToken, handleEmailVerification, logout };
