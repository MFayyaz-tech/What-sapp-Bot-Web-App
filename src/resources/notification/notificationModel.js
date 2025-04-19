const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    type: { type: String, default: null },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    icon: { type: String, default: "images/notification.png" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    is_read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);
