import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
