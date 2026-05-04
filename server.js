const express = require("express");
const cors = require("cors");
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

// Disable trust proxy to prevent HTTPS redirect
app.set('trust proxy', false);

/* ================= CORS - MOST PERMISSIVE ================= */
app.use(
  cors({
    origin: "*",
    credentials: false,
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
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - Protocol: ${req.protocol}`);
  next();
});

/* ================= API ROUTES ================= */
app.use("/api/leads", leadRoutes);

/* ================= HEALTH CHECK ================= */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running on HTTP",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT,
    protocol: req.protocol,
    host: req.get('host'),
  });
});

/* ================= FRONTEND SERVING ================= */
const frontendPath = path.resolve(__dirname, "./frontend/dist");

console.log("📁 Frontend path:", frontendPath);

if (fs.existsSync(frontendPath)) {
  console.log("✅ Frontend build found!");

  // Serve static files with headers that prevent HTTPS upgrade
  app.use(express.static(frontendPath, {
    setHeaders: (res, filePath) => {
      // Prevent browser from upgrading to HTTPS
      res.setHeader('Strict-Transport-Security', 'max-age=0');
      res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
      
      // Set proper MIME types
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html');
      } else if (filePath.endsWith('.ico')) {
        res.setHeader('Content-Type', 'image/x-icon');
      }
    },
  }));

  // SPA fallback
  app.get(/^\/(?!api|health).*/, (req, res) => {
    const indexPath = path.join(frontendPath, "index.html");
    
    if (fs.existsSync(indexPath)) {
      console.log("🏠 Serving index.html for:", req.url);
      
      // Send the file with explicit HTTP headers
      res.setHeader('Strict-Transport-Security', 'max-age=0');
      res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
      res.sendFile(indexPath);
    } else {
      console.error("❌ index.html not found at:", indexPath);
      res.status(500).json({
        success: false,
        message: "Frontend build files not found",
      });
    }
  });

  // Specific route for favicon
  app.get('/favicon.svg', (req, res) => {
    const faviconPath = path.join(frontendPath, 'favicon.svg');
    if (fs.existsSync(faviconPath)) {
      res.sendFile(faviconPath);
    } else {
      res.status(404).send('Not found');
    }
  });
} else {
  console.error("❌ Frontend build directory not found at:", frontendPath);
}

/* ================= ERROR HANDLERS ================= */
app.use(notFound);
app.use(errorHandler);

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 6004;

app.listen(PORT, '0.0.0.0', () => {
  console.log("=".repeat(50));
  console.log(`🚀 Server running on HTTP port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Access via HTTP ONLY: http://72.60.233.42:${PORT}`);
  console.log(`📝 Form: http://72.60.233.42:${PORT}/form`);
  console.log(`📊 Dashboard: http://72.60.233.42:${PORT}/dashboard`);
  console.log(`💚 Health: http://72.60.233.42:${PORT}/health`);
  console.log("=".repeat(50));
});