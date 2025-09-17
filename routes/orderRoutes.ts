import express from "express";
import { checkout, getOrders } from "../controllers/orderControllers";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

// Place an order (checkout)
router.post("/checkout", authenticate, checkout);

// Get all orders for a user (pass userId as query param)
router.get("/", authenticate, getOrders);

export default router;