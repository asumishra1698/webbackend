import express from "express";
import { checkout, getOrders } from "../controllers/orderControllers";
import { allAdmin } from "../config/permission";

const router = express.Router();

// Place an order (checkout)
router.post("/checkout", allAdmin, checkout);

// Get all orders for a user (pass userId as query param)
router.get("/", allAdmin, getOrders);

export default router;