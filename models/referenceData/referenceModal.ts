import mongoose, { Schema, Document } from "mongoose";

interface IReferenceItem {
  _id: string;
  key: string;
  name: string;
  category?: string;
  cate_key?: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  is_deleted: boolean;
  metadata: {
    color: string;
    icon: string;
  };
  createdAt: Date;
  updatedAt: Date;
  
}

interface IReferenceCategory extends Document {
  category: string;
  cate_key: string;
  itemTotal: number;
  items: IReferenceItem[];
}

const ReferenceItemSchema = new Schema<IReferenceItem>({
  key: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  sort_order: { type: Number, default: 1 },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  metadata: {
    color: { type: String, required: true },
    icon: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ReferenceCategorySchema = new Schema<IReferenceCategory>({
  category: { type: String, required: true },
  cate_key: { type: String, required: true },
  itemTotal: { type: Number, default: 0 },
  items: [ReferenceItemSchema],
});

export default mongoose.model<IReferenceCategory>("ReferenceCategory", ReferenceCategorySchema);