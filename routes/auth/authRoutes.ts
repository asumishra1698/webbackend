import express from "express";
import authController from "../../controllers/auth/authControllers";
import { authenticate } from "../../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/login/request-email-otp", authController.requestEmailLoginOtp);
router.post("/login/verify-email-otp", authController.verifyEmailLoginOtp);

router.post("/forgot-password", authController.forgotpassword);
router.post("/reset-password", authController.resetpassword);
router.get("/role", authenticate, authController.getRole);
router.get("/all-users", authenticate, authController.getAllUsers);

export default router;