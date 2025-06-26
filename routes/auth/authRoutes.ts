import express from "express";
import authController from "../../controllers/auth/authControllers";
import { authenticate } from "../../middlewares/authMiddleware";

const router = express.Router();

// Registration
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);
router.post("/login/request-email-otp", authController.requestEmailLoginOtp);
router.post("/login/verify-email-otp", authController.verifyEmailLoginOtp);

// Forgot OTP
router.post("/forgot-password", authController.forgotpassword);

// Reset OTP
router.post("/reset-password", authController.resetpassword);

// Get User Role (protected, example)
router.get("/role", authenticate, authController.getRole);

router.get("/all-users", authenticate, authController.getAllUsers);

export default router;
