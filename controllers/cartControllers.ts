import { Request, Response, NextFunction } from "express";
import CartItem, { ICartItem } from "../models/cartItemModel";
import Product from "../models/products/productModel";
import User from "../models/auth/authModal";



export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, productId, quantity } = req.body;
        if (!userId || !productId || !quantity) {
            res.status(400).json({ message: "userId, productId, and quantity are required." });
            return;
        }
        const user = await User.findById(userId);
        if (!user || user.role?.key !== "customer") {
            res.status(403).json({ message: "Only customers can use the cart." });
            return;
        }
        const product = await Product.findById(productId);
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        let cartItem = await CartItem.findOne({ userId, productId });
        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({
                userId,
                productId,
                name: product.name,
                price: product.salePrice,
                quantity
            });
        }

        res.json({ success: true, cartItem });
    } catch (err) {
        next(err);
    }
};

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            res.status(400).json({ message: "userId is required." });
            return;
        }
        const user = await User.findById(userId);
        if (!user || user.role?.key !== "customer") {
            res.status(403).json({ message: "Only customers can use the cart." });
            return;
        }

        const cart = await CartItem.find({ userId }).lean();
        const cartWithProduct = await Promise.all(
            cart.map(async item => {
                const product = await Product.findById(item.productId).lean();
                let latestPrice = product?.salePrice ?? item.price;
                if (product && item.price !== latestPrice) {
                    await CartItem.updateOne(
                        { _id: item._id },
                        { $set: { price: latestPrice } }
                    );
                }
                return {
                    ...item,
                    price: latestPrice,
                    subtotal: latestPrice * item.quantity,
                    imageUrl: product?.thumbnail
                        ? `${process.env.BASE_URL || ""}/uploads/products/${product.thumbnail}`
                        : ""
                };
            })
        );
        res.json({ success: true, cart: cartWithProduct });
    } catch (err) {
        next(err);
    }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, productId } = req.body;
        if (!userId || !productId) {
            res.status(400).json({ message: "userId and productId are required." });
            return;
        }
        await CartItem.findOneAndDelete({ userId, productId });
        res.json({ success: true, message: "Item removed from cart." });
        return;
    } catch (err) {
        next(err);
    }
};

export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({ message: "userId is required." });
        }
        await CartItem.deleteMany({ userId });
        res.json({ success: true, message: "Cart cleared." });
        return;
    } catch (err) {
        next(err);
    }
};


