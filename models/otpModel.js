const mongoose = require("mongoose");
const Objectid = mongoose.Schema.Types.ObjectId;
const otpSchema = new mongoose.Schema({
  userId: {
    type: Objectid,
  },
  otp: {
    type: Number,
  },
  created: {
    type: Date,
  },
});

const otpModal = mongoose.model("Otp", otpSchema);
module.exports = otpModal;