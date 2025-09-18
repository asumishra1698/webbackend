import express from "express";
import { checkout, getOrders, verifyPayment } from "../controllers/orderControllers";
import { allAdmin } from "../config/permission";

const router = express.Router();

// Place an order (checkout)
router.post("/checkout", checkout);

// Get all orders for a user (pass userId as query param)
router.get("/", allAdmin, getOrders);

router.post("/verify-payment", verifyPayment);

export default router;