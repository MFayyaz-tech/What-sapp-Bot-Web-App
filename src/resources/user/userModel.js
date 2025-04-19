const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
      default: null,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin"],
    },
    otpExpiry: {
      type: Date,
    },
    image: {
      type: String,
      default: "",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
