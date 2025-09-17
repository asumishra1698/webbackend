import express from "express";
import {
    addToCart,
    getCart,
    removeFromCart,
    clearCart
} from "../controllers/cartControllers";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/add", authenticate, addToCart);
router.get("/", authenticate, getCart);
router.post("/remove", authenticate, removeFromCart);
router.post("/clear", authenticate, clearCart);

export default router;