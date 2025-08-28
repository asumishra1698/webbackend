import mongoose, { Schema, Document } from "mongoose";

export interface IProductTag extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted: { type: Boolean; default: false };
  deletedAt: { type: Date };
}

const ProductTagSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IProductTag>("ProductTag", ProductTagSchema);
