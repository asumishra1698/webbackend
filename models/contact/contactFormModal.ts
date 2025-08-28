import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  name: string;
  number: string;
  email: string;
  message: string;
  city?: string;
  isDeleted: { type: Boolean; default: false };
  deletedAt: { type: Date };
}

const contactSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    number: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    city: { type: String, required: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IContact>("Contact", contactSchema);
