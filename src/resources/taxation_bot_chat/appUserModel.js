const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userId: { type: String, required: true },
  username: { type: String },
  engagement: {
    newUser: { type: Boolean, default: false },
    oldUser: { type: Boolean, default: false },
  },
  status: {
    type: String,
    default: "active",
    enum: ["active", "blocked"],
  },
});

module.exports = mongoose.model("AppUser", userSchema);
