import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  name: string;
  number: string;
  email: string;
  message: string;
}

const contactSchema: Schema = new Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true }
});

export default mongoose.model<IContact>("Contact", contactSchema);