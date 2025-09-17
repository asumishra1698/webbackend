import { Request, Response, NextFunction } from "express";
import CartItem from "../models/cartItemModel";
import Order from "../models/orderModel";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export const checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, name, number, address, paymentMethod } = req.body;
        if (!userId || !name || !number || !address || !paymentMethod) {
            res.status(400).json({ message: "userId, name, number, address, and paymentMethod are required." });
            return;
        }
        const cartItems = await CartItem.find({ userId });
        if (!cartItems.length) {
            res.status(400).json({ message: "Cart is empty." });
            return;
        }
        const items = cartItems.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        }));

        const total = items.reduce((sum, item) => sum + item.subtotal, 0);
        if (paymentMethod === "Online") {
            const razorpayOrder = await razorpay.orders.create({
                amount: total * 100,
                currency: "INR",
                receipt: `order_rcptid_${Date.now()}`,
                notes: {
                    userId,
                    name,
                    number,
                    address
                }
            });
            res.status(200).json({
                success: true,
                message: "Razorpay order created.",
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: process.env.RAZORPAY_KEY_ID,
                items,
                customer: { name, number, address }
            });
            return;
        }
        const order = await Order.create({
            userId,
            customer: { name, number, address },
            items,
            total,
            paymentMethod
        });
        await CartItem.deleteMany({ userId });

        res.status(201).json({
            success: true,
            message: "Order placed successfully.",
            order
        });
    } catch (err) {
        next(err);
    }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            res.status(400).json({ message: "userId is required." });
        }
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        next(err);
    }
};
