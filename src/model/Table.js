const mongoose = require("mongoose");
const TableSchema = new mongoose.Schema(
  {
    title: String,
    price: Number,
    deleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: "String",
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Table = mongoose.model("tables", TableSchema);
module.exports = Table;
