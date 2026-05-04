const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middlewares/errorMiddleware");
const leadRoutes = require("./routes/leadRoutes");

dotenv.config();
connectDB();

const app = express();

/* ================= SECURITY ================= */
app.use(helmet());

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "http://72.60.233.42:6004"
        : "http://localhost:5173",
    credentials: true,
  })
);

/* ================= RATE LIMIT ================= */
app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later",
  })
);

/* ================= BODY PARSER ================= */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

/* ================= LOGGING ================= */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* ================= API ROUTES ================= */
app.use("/api/leads", leadRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    time: new Date().toISOString(),
  });
});

const frontendPath = path.resolve(__dirname, "./frontend/dist");

// serve static files
app.use(express.static(frontendPath));

// SPA fallback
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 6004;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});