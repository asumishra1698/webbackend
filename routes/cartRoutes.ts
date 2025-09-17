import express from "express";
import {
    addToCart,
    getCart,
    removeFromCart,
    clearCart
} from "../controllers/cartControllers";
import { customerOnly } from "../config/permission";

const router = express.Router();

router.post("/add", customerOnly, addToCart);
router.get("/", customerOnly, getCart);
router.post("/remove", customerOnly, removeFromCart);
router.post("/clear", customerOnly, clearCart);

export default router;