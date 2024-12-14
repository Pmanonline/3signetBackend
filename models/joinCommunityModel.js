// models/Registration.js
const mongoose = require("mongoose");
const crypto = require("crypto");

const registrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [2, "Name must be at least 2 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\d{10,}$/, "Please enter a valid phone number"],
    },
    classInterest: {
      type: String,
      enum: ["SQL master class", "Python master class"],
      required: [true, "Please specify the class of interest"],
    },
    sectionInterest: {
      type: String,
      enum: ["Morning Class", "Evening Class", "Only Weekend"],
      required: [true, "Please specify the Interested Section (time)"],
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    accessToken: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique access token before saving
registrationSchema.pre("save", async function (next) {
  if (!this.accessToken) {
    this.accessToken = crypto.randomBytes(32).toString("hex");
  }
  next();
});

const Registration = mongoose.model("JoinCommunity", registrationSchema);
module.exports = Registration;
