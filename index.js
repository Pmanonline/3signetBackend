const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const connectDB = require("./config/db.config");
const { errorHandlingMiddleware } = require("./middlewares/errorHandling.js");
const helmet = require("helmet"); // Add this for security headers

// Import routes
const Routes = require("./routes/route.js");
const UserRoutes = require("./routes/userRoutes.js");
const PostsRoutes = require("./routes/postRoutes.js");
const authorRoutes = require("./routes/authorRoutes.js");
const commentRoutes = require("./routes/commentRoutes.js");
const speakerRoutes = require("./routes/speakerRoutes.js");
const eventsRoutes = require("./routes/eventsRoutes.js");
const solutionRoutes = require("./routes/solutionRoutes.js");
const joinCommunityRoutes = require("./routes/joinCommunityroutes.js");

// Initialize configurations
dotenv.config();
connectDB();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  credentials: false, // Do not allow credentials
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Use CORS middleware
app.use(cors(corsOptions));

// File upload middleware configuration
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  })
);

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Enable if needed
    crossOriginEmbedderPolicy: false, // Enable if needed
  })
);
app.use(cors(corsOptions));

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Standard Middleware
app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(errorHandlingMiddleware);

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/insertImage", express.static(path.join(__dirname, "insertImage")));
app.use(express.static(path.join(__dirname, "public")));

// Logging Middleware
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use("/api", Routes);
app.use("/api", UserRoutes);
app.use("/api", PostsRoutes);
app.use("/api", authorRoutes);
app.use("/api", commentRoutes);
app.use("/api", speakerRoutes);
app.use("/api", eventsRoutes);
app.use("/api", solutionRoutes);
app.use("/api", joinCommunityRoutes);

// Base routes
app.get("/", (req, res) => {
  res.json("This is a test to confirm if this API is working for 3signets");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
