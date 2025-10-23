const mongoose = require("mongoose");
const userSchemauserao = new mongoose.Schema(
  {
    fullname: String,
    email: String,
    phone: String,
    status: {
      type: String,
      default: "active",
    },
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
const userao = mongoose.model("usersaos", userSchemauserao);
module.exports = userao;
