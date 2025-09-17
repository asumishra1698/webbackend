import express from "express";
import authController, { getAllSalesRms } from "../../controllers/auth/authControllers";
import { allRoles, allAdmin } from "../../config/permission";
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
router.get("/role", allAdmin, authController.getRole);
router.get("/all-users", allAdmin, authController.getAllUsers);
router.get("/profile", allRoles, authController.getProfile);
router.get("/sales-rms", allAdmin, getAllSalesRms);

export default router;