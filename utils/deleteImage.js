import { v2 as cloudinary } from "cloudinary";

export const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    // Extract Cloudinary public_id from the URL
    const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];

    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok") {
      console.error(`Failed to delete image: ${imageUrl}`);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};
