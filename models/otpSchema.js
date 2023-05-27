import mongoose from "mongoose";
const { Schema } = mongoose;

const otpSchema = Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "15m" },
});

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
