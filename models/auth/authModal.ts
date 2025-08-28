import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  mobile?: string;
  password: string;
  role: string;
  username?: string;
  profilePic?: string;
  otp?: string;
  otpExpiry?: number;
  token?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted: { type: Boolean; default: false };
  deletedAt: { type: Date };
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["superadmin", "admin", "customer", "user"],
      default: "user",
      required: true,
    },
    username: { type: String, required: true, unique: true },
    profilePic: { type: String, required: true },
    otp: { type: String },
    otpExpiry: { type: Number },
    token: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
