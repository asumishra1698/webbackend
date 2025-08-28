import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: { type: String; required: true; unique: true };
  description: string;
  price: number;
  salePrice?: number;
  productcategory: mongoose.Types.ObjectId[];
  brand?: mongoose.Types.ObjectId;
  sku?: string;
  barcode?: string;
  variants?: {
    color?: string;
    size?: string;
    material?: string;
    style?: string;
  }[];
  stock: number;
  images: string[];
  thumbnail?: string;
  producttags?: mongoose.Types.ObjectId[];
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  isFeatured?: boolean;
  isActive?: boolean;
  rating?: number;
  reviews?: mongoose.Types.ObjectId[];
  discount?: number;
  tax?: number;
  shippingClass?: string;
  warranty?: string;
  returnPolicy?: string;
  vendor?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted: { type: Boolean; default: false };
  deletedAt: { type: Date };
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    price: { type: Number, required: true },
    salePrice: Number,
    productcategory: [{ type: Schema.Types.ObjectId, ref: "ProductCategory" }],
    brand: { type: Schema.Types.ObjectId, ref: "ProductBrand" },
    sku: String,
    barcode: String,
    variants: [
      { color: String, size: String, material: String, style: String },
    ],
    stock: { type: Number, default: 0 },
    images: [{ type: String }],
    thumbnail: String,
    producttags: [{ type: Schema.Types.ObjectId, ref: "ProductTag" }],
    weight: Number,
    dimensions: { length: Number, width: Number, height: Number },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: Number,
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    discount: Number,
    tax: Number,
    shippingClass: String,
    warranty: String,
    returnPolicy: String,
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
