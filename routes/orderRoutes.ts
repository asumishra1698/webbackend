import express from "express";
import { checkout, getOrders, verifyPayment, getOrderById } from "../controllers/orderControllers";
import { allAdmin } from "../config/permission";

const router = express.Router();

router.post("/checkout", checkout);
router.get("/", allAdmin, getOrders);
router.post("/verify-payment", verifyPayment);
router.get("/:orderId", getOrderById);

export default router;