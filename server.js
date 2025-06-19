import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // Connect to MongoDB
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
