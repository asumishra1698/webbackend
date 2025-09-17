import express from "express";
import {
    addToCart,
    getCart,
    removeFromCart,
    clearCart
} from "../controllers/cartControllers";
import { allAdmin } from "../config/permission";

const router = express.Router();

router.post("/add", allAdmin, addToCart);
router.get("/", allAdmin, getCart);
router.post("/remove", allAdmin, removeFromCart);
router.post("/clear", allAdmin, clearCart);

export default router;