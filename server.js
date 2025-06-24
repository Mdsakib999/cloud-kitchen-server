import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    // Check if already connected to avoid multiple connections in serverless
    if (mongoose.connection.readyState === 0) {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(
        `MongoDB Connected! Connection Host: ${conn.connection.host}`
      );
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Don't exit process in serverless environment
    // process.exit(1);
  }
};

// Connect to database
connectDB();

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
