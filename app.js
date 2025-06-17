import express from "express";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRouter from './routes/auth.routes.js'

const app = express();

app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send({ message: "Cloud Kitchen API is running..." });
});

app.use(notFound);
app.use(errorHandler);

export default app;
