import express from "express";
import authController, { getAllSalesRms } from "../../controllers/auth/authControllers";
import { authenticate } from "../../middlewares/authMiddleware";
import { uploadProfilePic } from "../../middlewares/uploadMiddleware";

const router = express.Router();

router.post(
  "/register",
  uploadProfilePic.single("profilePic"),
  authController.register
);
router.post("/login", authController.login);
router.post("/login/request-email-otp", authController.requestEmailLoginOtp);
router.post("/login/verify-email-otp", authController.verifyEmailLoginOtp);

router.post("/forgot-password", authController.forgotpassword);
router.post("/reset-password", authController.resetpassword);
router.get("/role", authenticate, authController.getRole);
router.get("/all-users", authenticate, authController.getAllUsers);
router.get("/profile", authenticate, authController.getProfile);
router.get("/sales-rms", authenticate, getAllSalesRms);

export default router;