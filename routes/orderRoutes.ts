import express from "express";
import { checkout, getOrders, verifyPayment, getOrderById } from "../controllers/orderControllers";
import { allAdmin, customerOnly } from "../config/permission";

const router = express.Router();

router.post("/checkout", customerOnly, checkout);
router.get("/", customerOnly, getOrders);
router.post("/verify-payment", customerOnly, verifyPayment);
router.get("/:orderId", customerOnly, getOrderById);

export default router;