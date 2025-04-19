const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const errorLogSchema = new Schema({
  errorType: { type: String, required: true },
  severity: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  message: { type: String, required: true },
});

module.exports = mongoose.model("ErrorLog", errorLogSchema);
