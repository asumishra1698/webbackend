import mongoose, { Schema, Document } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  description: string;
  author: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId[];
  tags: mongoose.Types.ObjectId[];
  featuredImage: string;
  galleryImages?: string[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  status: "draft" | "published" | "archived";
}

const BlogPostSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: [
      { type: Schema.Types.ObjectId, ref: "Category", required: true },
    ],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    featuredImage: { type: String, required: true },
    galleryImages: [{ type: String }],
    metaTitle: { type: String },
    metaDescription: { type: String },
    canonicalUrl: { type: String },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
