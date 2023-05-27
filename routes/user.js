import express from "express";
import {
  LoginController,
  RegisterController,
  resendVerificationCode,
  verifyRegistrationController,
} from "../controllers/auth.js";

const router = express.Router();

//Authentication Routes
router.post("/login", LoginController);
router.post("/register", RegisterController);
router.post("/verify-register", verifyRegistrationController);
router.post("/resend-confirmation-code", resendVerificationCode);

export default router;
