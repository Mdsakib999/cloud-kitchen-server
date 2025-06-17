import bcrypt from "bcryptjs";
import User from '../models/user.model.js'
import generateToken from "../utils/generateToken.js";

const registerUser = async (req, res) => {
  const { name, email, password, phone, address, provider, uid, role } = req.body;

  try {
    // Check if user already exists by email or uid
    const existingUser = await User.findOne({ $or: [{ email }, { uid }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Prepare user data
    const userData = {
      name,
      email,
      provider,
      password: password || null,
      phone: phone || null,
      address: address || null,
      uid,
      role: role || "user",
    };

    // If provider is "password", include and hash password, phone, and address
    if (provider === "password") {
      if (!password || !phone || !address) {
        return res.status(400).json({ message: "Password, phone, and address are required for email/password registration" });
      }
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(password, salt);
      userData.phone = phone;
      userData.address = address;
    }

    // Create and save new user
    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data and token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      provider: user.provider,
      uid: user.uid,
      role: user.role,
      profilePicture: user.profilePicture,
      token,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Login User Controller
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No user found with this email" });
    }

    // For Google provider, deny email/password login
    if (user.provider === "google") {
      return res.status(400).json({ message: "Please use Google Sign-In for this account" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data and token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      provider: user.provider,
      uid: user.uid,
      role: user.role,
      profilePicture: user.profilePicture,
      token,
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export {
  registerUser,
  loginUser
}