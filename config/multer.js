import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;

  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;

  // Check if it's an image file
  if (allowedImageTypes.test(ext) && mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed"));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for images
  fileFilter,
});

// For single profile picture upload
export const uploadProfilePicture = upload.single("profilePicture");
export const uploadCategoryImage = upload.single("image");
