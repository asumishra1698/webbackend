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
        address: string;
    };
    items: IOrderItem[];
    total: number;
    paymentMethod: "COD" | "Online";
    createdAt: Date;
}

const OrderSchema: Schema = new Schema({
    userId: { type: String, required: true },
    customer: {
        name: { type: String, required: true },
        number: { type: String, required: true },
        address: { type: String, required: true },
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
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOrder>("Order", OrderSchema);