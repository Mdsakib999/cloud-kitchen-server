import { v2 as cloudinary } from "cloudinary";

export const deleteFile = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    // Extract public_id from URL same way as deleteImage
    const publicId = fileUrl.split("/").slice(-2).join("/").split(".")[0];

    // Delete raw file from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });

    if (result.result !== "ok") {
      console.error(`Failed to delete file: ${fileUrl}`);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};
