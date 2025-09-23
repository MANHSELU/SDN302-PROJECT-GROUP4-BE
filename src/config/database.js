const mongoose = require("mongoose");
module.exports.connect = () => {
  try {
    mongoose
      .connect(process.env.MONGODB_URL)
      .then(() => console.log("Connected!")); // đã kết nối thành công
    console.log("mongobd là : ", process.env.MONGODB_URL);
  } catch (error) {
    console.log("error:", error);
  }
};
