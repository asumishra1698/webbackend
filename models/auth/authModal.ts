import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  mobile?: string;
  password: string;
  role: string;
  otp?: string;
  otpExpiry?: number;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String }, 
  role: { type: String, enum: ["superadmin", "admin", "customer" , "user"], default: "user" },
  otp: { type: String },
  otpExpiry: { type: Number },
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;