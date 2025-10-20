const mongoose = require("mongoose");

const rolesSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    permissions: [],
    deleted: {
      type: Boolean,
      default: false,
    },
    deleteAt: Date,
  },
  {
    timestamps: true,
  }
);
const role = mongoose.model("roles", rolesSchema);
module.exports = role;
