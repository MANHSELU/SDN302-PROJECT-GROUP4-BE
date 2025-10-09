const mongoose = require("mongoose");
const giochoisanSchema = new mongoose.Schema({
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("timebooks", giochoisanSchema);
