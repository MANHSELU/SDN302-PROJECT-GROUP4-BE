const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },

    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roles",
      default: null,
    },

    status: {
      type: String,
      default: "active",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deleteAt: Date,

    resetpassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("users", userSchema);
module.exports = User;
