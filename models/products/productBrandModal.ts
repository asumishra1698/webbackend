import mongoose, { Schema, Document } from "mongoose";

export interface IProductBrand extends Document {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted: { type: Boolean; default: false };
  deletedAt: { type: Date };
}

const ProductBrandSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    logo: String,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model<IProductBrand>("ProductBrand", ProductBrandSchema);