import User from "../models/userSchema.js";
import OTP from "../models/otpSchema.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { config } from "dotenv";

config();
function generateOTP() {
  // Generate a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000);

  return otp.toString();
}

function configureTransporter() {
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.eu",
    port: 465,
    secure: true, //ssl
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  return transporter;
}

export const LoginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username }).exec();
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }
    bcrypt.compare(password, user.password).then((result) => {
      if (result) {
        return res.status(200).json({ message: "logged in" });
      } else {
        return res.status(401).json({ message: "incorrect credentials" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const RegisterController = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const otp = generateOTP();

    const user = new User({
      username: username,
      email: email,
      password: hashedPassword,
      languages: [],
      totalExp: 0,
      weeklyExp: 0,
      rank: null,
      verified: false,
    });
    const newUser = await user.save();
    const newOtp = new OTP({
      userId: newUser._id,
      otp: otp,
    });
    await newOtp.save();
    const transporter = configureTransporter();
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Hello",
      text: otp,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    return res.status(200).json({ message: "OK" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email }).exec();
    const hasOtp = await OTP.findOne({ userId: user._id }).exec();
    if (hasOtp) {
      console.log("debug");
    } else {
      const otp = generateOTP();
      const otpInstance = new OTP({
        userId: user._id,
        otp: otp,
      });
      await otpInstance.save();
      const transporter = configureTransporter();
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Hello",
        text: otp,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      return res.status(200).json({ message: "Code sent" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyRegistrationController = async (req, res) => {
  try {
    const { userOtp } = req.body;
    console.log(userOtp);
    await OTP.findOne({ otp: userOtp })
      .populate("userId")
      .exec()
      .then(async (otp) => {
        if (otp) {
          const user = await User.findById(otp.userId._id).exec();
          user.verified = true;
          await user.save();
          return res.status(200).json({ message: "OK" });
        } else {
          return res.status(404).json({ message: "user or otp cannot found" });
        }
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
