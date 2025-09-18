import mongoose, { Schema, Document } from "mongoose";

interface IOrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface IOrder extends Document {
    userId: string;
    customer: {
        name: string;
        number: string;
        address: {
            line1: string;
            city: string;
            state: string;
            zip: string;
        };
    };
    items: IOrderItem[];
    total: number;
    paymentMethod: "COD" | "Online";
    paymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
    paymentStatus?: "pending" | "paid" | "failed";
    createdAt: Date;
}

const OrderSchema: Schema = new Schema({
    userId: { type: String, required: true },
    customer: {
        name: { type: String, required: true },
        number: { type: String, required: true },
        address: {
            line1: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zip: { type: String, required: true }
        }
    },
    items: [
        {
            productId: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            subtotal: { type: Number, required: true }
        }
    ],
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["COD", "Online"], required: true },
    paymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpaySignature: { type: String },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOrder>("Order", OrderSchema);