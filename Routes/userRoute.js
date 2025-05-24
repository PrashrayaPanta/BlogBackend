const express = require("express");
const userCtrl = require("../controller/user");
const isAuthenticated = require("../middleware/isAuth");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "nodejsProfileImage",
    allowedFormat: ["png", "jpeg"],
  },
});

// Configure Multer for image uploads
const upload = multer({
  storage,
  limits: 1024 * 1024 * 5, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image, please upload an image"), false);
    }
  },
});

const userRoute = express.Router();

// Routes
userRoute.post("/register", upload.array("image"), userCtrl.register); // Register with image upload
userRoute.post("/login", userCtrl.login); // Login
userRoute.get("/profile", isAuthenticated, userCtrl.Profile); // Get profile
userRoute.put("/profile/edit", isAuthenticated, userCtrl.EditProfile); // Edit profile
userRoute.put("/profile/password", isAuthenticated, userCtrl.EditPassword); // Update password
userRoute.delete("/profile/:id", isAuthenticated, userCtrl.DeleteAccount); // Delete account

module.exports = userRoute;
