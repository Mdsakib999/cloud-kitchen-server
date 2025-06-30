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
    const existingUrls = JSON.parse(req.body.existingUrls || "[]");
    const imageOrder = JSON.parse(req.body.imageOrder || "[]");

    // Validate total image count (old + new)
    const totalImages = imageOrder.length;
    if (totalImages > 4) {
      return res.status(400).json({ message: "Maximum 4 images allowed" });
    }

    // Find existing promotion (only one should exist)
    const existing = await Promotion.findOne();

    // Delete images not in existingUrls (old removed by admin)
    if (existing) {
      for (const img of existing.images) {
        if (!existingUrls.includes(img.url)) {
          await deleteFromCloudinary(img.url);
        }
      }
      await existing.deleteOne();
    }

    // Upload new files to Cloudinary and map by original name
    const newUploadedMap = {};
    if (req.files && req.files.length) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "promote-offers");
        newUploadedMap[file.originalname] = {
          url: result.secure_url,
          public_id: result.public_id,
        };
      }
    }

    // Reconstruct existing image objects (url + public_id) and map by url
    const keptImages =
      existing?.images?.filter((img) => existingUrls.includes(img.url)) || [];
    const keptImagesMap = {};
    for (const img of keptImages) {
      keptImagesMap[img.url] = img;
    }

    // Build final images array in the correct order
    const finalImages = [];
    for (const item of imageOrder) {
      if (item.type === "existing" && keptImagesMap[item.url]) {
        finalImages.push(keptImagesMap[item.url]);
      } else if (item.type === "new" && newUploadedMap[item.name]) {
        finalImages.push(newUploadedMap[item.name]);
      }
    }

    // Save new Promotion with ordered images
    const newPromotion = await Promotion.create({
      images: finalImages,
    });

    res.status(201).json({
      message: "Promotion updated successfully",
      success: true,
      data: newPromotion,
    });
  } catch (error) {
    console.error("Promotion upload error:", error);
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
