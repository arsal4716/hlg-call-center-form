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

app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/leads", leadRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ================= FRONTEND ================= */
const frontendPath = path.join(__dirname, "frontend/dist");

app.use(express.static(frontendPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(frontendPath, "index.html"));
});
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 6004;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});