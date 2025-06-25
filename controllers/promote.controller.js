import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../config/cloudinary.js";
import Promotion from "../models/promotion.model.js";

// @desc    Add promotional offers
// @route   POST /api/admin/add-offers
// @access  Private/Admin
const createPromotionalOffer = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    if (req.files.length > 4) {
      return res.status(400).json({ message: "Maximum 4 images allowed" });
    }

    // Delete all existing offers + images
    const existingOffers = await Promotion.find();
    for (const offer of existingOffers) {
      for (const img of offer.images) {
        await deleteFromCloudinary(img.url);
      }
      await offer.deleteOne();
    }

    // Upload new images
    const images = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, "promote-offers");
      images.push({ url: result.secure_url, public_id: result.public_id });
    }

    const newOffer = await Promotion.create({ images });

    res.status(201).json({
      message: "New promotional offer created",
      success: true,
      data: newOffer,
    });
  } catch (error) {
    console.error("Create Offer Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// @desc    get promotional offers
// @route   POST /api/admin/all-offers
// @access  public
const getPromotionalOffer = async (req, res) => {
  try {
    const offer = await Promotion.find();

    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    console.error("Get Offer Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// @desc    get promotional offers
// @route   PUT /api/admin/update-offer/:id
// @access  Private/Admin
const updatePromotionalOffer = async (req, res) => {
  try {
    const offer = await Promotion.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No new images uploaded" });
    }

    if (req.files.length > 4) {
      return res.status(400).json({ message: "Maximum 4 images allowed" });
    }

    // Delete old images from Cloudinary
    for (const img of offer.images) {
      await deleteFromCloudinary(img.url);
    }

    // Upload new images
    const newImages = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, "promote-offers");
      newImages.push({ url: result.secure_url, public_id: result.public_id });
    }

    offer.images = newImages;
    await offer.save();

    res.status(200).json({
      message: "Promotional offer updated",
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error("Update Offer Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// @desc    get promotional offers
// @route   DELETE /api/admin/delete-offer/:id
// @access  Private/Admin
const deletePromotionalOffer = async (req, res) => {
  try {
    const offer = await Promotion.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    for (const img of offer.images) {
      await deleteFromCloudinary(img.url);
    }

    await offer.deleteOne();

    res.status(200).json({ message: "Offer deleted", success: true });
  } catch (error) {
    console.error("Delete Offer Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export {
  createPromotionalOffer,
  getPromotionalOffer,
  updatePromotionalOffer,
  deletePromotionalOffer,
};
