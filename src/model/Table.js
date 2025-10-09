const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, default: 0 },
    deleted: { type: Boolean, default: false },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
    },
  },
  { timestamps: true }
);

const Table = mongoose.model("tables", TableSchema);
module.exports = Table;
