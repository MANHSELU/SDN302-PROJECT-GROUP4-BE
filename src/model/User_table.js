const mongoose = require("mongoose");
const User_TableSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Types.ObjectId, ref: "users" },
    table_id: { type: mongoose.Types.ObjectId, ref: "tables" },
    time_slot: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "timebooks",
      },
    ],
    time_date: Date,
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

const User_table = mongoose.model("user_tables", User_TableSchema);
module.exports = User_table;
