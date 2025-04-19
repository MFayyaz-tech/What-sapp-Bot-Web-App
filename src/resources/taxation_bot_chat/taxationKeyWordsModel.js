// models/Chat.js
const mongoose = require("mongoose");
const taxationKeyWordSchema = new mongoose.Schema({
  keywords: String,
});

taxationKeyWordSchema.index({ keywords: "text" });
module.exports = mongoose.model("TaxationKeyWord", taxationKeyWordSchema);
