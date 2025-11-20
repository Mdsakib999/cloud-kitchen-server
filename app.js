import express from "express";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";
import userRouter from "./routes/user.route.js";
import orderRouter from "./routes/order.routes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Cloud Kitchen API is running..." });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/order", orderRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
