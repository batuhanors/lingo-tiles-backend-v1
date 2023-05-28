import express from "express";
import {
  LoginController,
  RegisterController,
  createSessionController,
  resendVerificationCode,
  verifyRegistrationController,
} from "../controllers/auth.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

//Authentication Routes
router.post("/login", LoginController);
router.post("/register", RegisterController);
router.post("/verify-register", verifyRegistrationController);
router.post("/resend-confirmation-code", resendVerificationCode);
router.post("/establish-session", createSessionController);

router.post("/deneme", verifyToken);
export default router;
