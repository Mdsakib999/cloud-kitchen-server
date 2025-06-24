// @desc    Add promotional offers
// @route   POST /api/admin/categories
// @access  Private/Admin

// !!! TODO: CREATE MODEL FOR PROMOTIONAL OFFERS INCLUDING GET + POST API
import { uploadToCloudinary } from "../config/cloudinary.js";

const PromoteOffers = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    if (req.files.length > 4) {
      return res.status(400).json({ message: "Maximum 4 images allowed" });
    }

    const images = [];

    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, "promote-offers");
      images.push({ url: result.secure_url, public_id: result.public_id });
    }

    return res.status(200).json({
      message: "Images uploaded successfully",
      success: true,
      images,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export { PromoteOffers };
