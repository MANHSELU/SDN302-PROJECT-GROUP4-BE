const mongoose = require("mongoose");
const faouritebookSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const FaouriteBook = mongoose.model("faouritebooks", faouritebookSchema);
module.exports = FaouriteBook;
