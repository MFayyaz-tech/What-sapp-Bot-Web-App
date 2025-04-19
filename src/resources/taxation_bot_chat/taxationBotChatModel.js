const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "AppUser",
    },
    request: String,
    response: String,
    correctAnswer: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now },
    response_time: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
