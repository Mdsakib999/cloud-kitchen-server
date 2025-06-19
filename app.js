import express from "express";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());

// middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send({ message: "Cloud Kitchen API is running..." });
});

app.use(notFound);
app.use(errorHandler);

export default app;
