import mongoose, { Schema, Document } from "mongoose";

export interface IProductCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parent?: mongoose.Types.ObjectId;
  bannerImage?: string;
  thumbnailImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted: { type: Boolean; default: false };
  deletedAt: { type: Date };
}

const ProductCategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    parent: { type: Schema.Types.ObjectId, ref: "ProductCategory" },
    bannerImage: { type: String },
    thumbnailImage: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IProductCategory>(
  "ProductCategory",
  ProductCategorySchema
);