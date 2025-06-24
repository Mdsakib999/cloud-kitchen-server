import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  fileBuffer,
  folder,
  resourceType = "image"
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};
export const deleteFromCloudinary = async (imageUrl) => {
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