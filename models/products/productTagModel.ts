import mongoose, { Schema, Document } from "mongoose";

export interface IProductTag extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductTagSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model<IProductTag>("ProductTag", ProductTagSchema);
