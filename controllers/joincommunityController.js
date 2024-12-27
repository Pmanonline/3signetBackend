const Registration = require("../models/joinCommunityModel");
const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (file, folder = "3SignetPaymentUploads") => {
  try {
    if (!file.tempFilePath) {
      throw new Error("No temp file path found");
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: folder,
      resource_type: "auto",
    });

    fs.unlink(file.tempFilePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    return result.secure_url;
  } catch (error) {
    console.error("Upload to Cloudinary failed:", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return;

    const urlParts = url.split("/");
    const versionIndex = urlParts.findIndex((part) => part.startsWith("v"));
    if (versionIndex === -1) return;

    const publicId = urlParts
      .slice(versionIndex + 1)
      .join("/")
      .replace(/\.[^/.]+$/, "");

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

// Register new community member
const registerJoinCommunity = asyncHandler(async (req, res) => {
  try {
    const { name, email, phone, classInterest, sectionInterest } = req.body;

    // Debug logs
    console.log("Request Files:", req.files);
    console.log("Request Body:", req.body);

    if (!req.files || !req.files.image) {
      console.log("Missing files or image:", req.files);
      return res.status(400).json({
        success: false,
        message: "Please upload proof of payment",
      });
    }

    const existingRegistration = await Registration.findOne({ email });
    if (existingRegistration) {
      console.log("Existing registration found for email:", email);
      return res.status(400).json({
        success: false,
        message: "This email has already been registered",
      });
    }

    console.log("About to upload to Cloudinary");
    const imageUrl = await uploadToCloudinary(req.files.image);
    console.log("Cloudinary upload successful:", imageUrl);

    const registration = await Registration.create({
      name,
      email,
      phone,
      classInterest,
      sectionInterest,
      image: imageUrl,
    });

    console.log("Registration created successfully:", registration);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: registration,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred during registration",
    });
  }
});

// Update registration
const updateRegistration = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await Registration.findById(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    const updateData = { ...req.body };

    if (req.files && req.files.image) {
      // Delete old image from Cloudinary
      await deleteFromCloudinary(registration.image);

      // Upload new image
      const imageUrl = await uploadToCloudinary(req.files.image);
      updateData.image = imageUrl;
    }

    const updatedRegistration = await Registration.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Registration updated successfully",
      data: updatedRegistration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating registration",
    });
  }
});

// Get all registrations with pagination
const getAllRegistrations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalItems = await Registration.countDocuments();
  const registrations = await Registration.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    data: registrations,
  });
});

// Get single registration
const getRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    return res.status(404).json({
      success: false,
      message: "Registration not found",
    });
  }

  res.status(200).json({
    success: true,
    data: registration,
  });
});

// Delete registration
const deleteRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    return res.status(404).json({
      success: false,
      message: "Registration not found",
    });
  }

  // Delete image from Cloudinary
  await deleteFromCloudinary(registration.image);

  // Delete registration from database
  await Registration.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Registration deleted successfully",
  });
});

module.exports = {
  registerJoinCommunity,
  getAllRegistrations,
  getRegistration,
  updateRegistration,
  deleteRegistration,
};
