const mongoose = require("mongoose");
const categotySchema = new mongoose.Schema(
  {
    title: String,
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

const Category = mongoose.model("categorys", categotySchema);
module.exports = Category;
