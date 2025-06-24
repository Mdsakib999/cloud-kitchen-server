import express from "express";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import adminRouter from "./routes/admin.routes.js";
import { protect } from "./middleware/auth.middleware.js";
import { isAdmin } from "./middleware/admin.middleware.js";

const app = express();

app.use(express.json());

// Enhanced CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://cloudkitchen-846fb.web.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cache-Control",
    ],
    optionsSuccessStatus: 200, // For legacy browser support
  })
);

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control"
    );
    return res.sendStatus(200);
  }

  next();
});

app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);
app.use("/api/admin", protect, isAdmin, adminRouter);

app.get("/", (req, res) => {
  res.json({ message: "Cloud Kitchen API is running..." });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

export default app;
