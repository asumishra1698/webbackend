import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem extends Document {
    userId: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

const CartItemSchema: Schema = new Schema({
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
});

export default mongoose.model<ICartItem>("CartItem", CartItemSchema);