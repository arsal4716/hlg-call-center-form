const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middlewares/errorMiddleware");
const leadRoutes = require("./routes/leadRoutes");

dotenv.config();
connectDB();

const app = express();

/* ================= SECURITY - RELAXED FOR HTTP ================= */
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "http:", "https:", "data:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "http:", "https:"],
        imgSrc: ["'self'", "data:", "http:", "https:", "blob:"],
        fontSrc: ["'self'", "data:", "http:", "https:"],
        connectSrc: ["'self'", "http:", "https:", "ws:", "wss:"],
      },
    },
  })
);

/* ================= CORS ================= */
app.use(
  cors({
    origin: "*", // Allow all origins for production HTTP
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
} else {
  // Simple production logging
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });
}

/* ================= API ROUTES ================= */
app.use("/api/leads", leadRoutes);

/* ================= HEALTH CHECK ================= */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT,
  });
});

/* ================= FRONTEND SERVING ================= */
// Find frontend build directory
const frontendPath = path.resolve(__dirname, "./frontend/dist");

console.log("📁 Looking for frontend build at:", frontendPath);

if (fs.existsSync(frontendPath)) {
  console.log("✅ Frontend build found!");
  
  // Serve static files with proper MIME types
  app.use(express.static(frontendPath, {
    setHeaders: (res, filePath) => {
      console.log("📄 Serving:", filePath);
      
      // Set proper MIME types
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      }
      
      // Remove problematic headers for HTTP
      res.removeHeader('Cross-Origin-Opener-Policy');
      res.removeHeader('Cross-Origin-Embedder-Policy');
      res.removeHeader('Origin-Agent-Cluster');
    },
  }));

  // SPA fallback - serve index.html for all non-API routes
  app.get(/^\/(?!api|health).*/, (req, res) => {
    const indexPath = path.join(frontendPath, "index.html");
    
    if (fs.existsSync(indexPath)) {
      console.log("🏠 Serving index.html for:", req.url);
      res.sendFile(indexPath);
    } else {
      console.error("❌ index.html not found at:", indexPath);
      res.status(500).json({
        success: false,
        message: "Frontend build files not found",
      });
    }
  });
} else {
  console.error("❌ Frontend build directory not found at:", frontendPath);
  console.log("Please build the frontend first: cd frontend && npm run build");
}

/* ================= ERROR HANDLERS ================= */
app.use(notFound);
app.use(errorHandler);

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 6004;

app.listen(PORT, '0.0.0.0', () => {
});