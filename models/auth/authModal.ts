import mongoose, { Schema, Document, SchemaTypes } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  mobile?: string;
  password: string;
  role: any;
  role_id?: string;
  dateOfBirth?: Date;
  department?: any;
  department_id?: string;
  gender?: string;
  username?: string;
  profilePic?: string;
  otp?: string;
  otpExpiry?: number;
  token?: string;
  user_id?: string;
  user_guid?: string;
  reporting_head_id?: any;
  location_id?: any;
  is_active?: boolean;
  is_deleted?: boolean;
  created_by?: string;
  created_on_date?: Date;
  status?: string;
  login_policy?: string;
  last_visitor_asigned_on?: Date;
  last_modified_on_date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
  deletedAt?: Date;
  addresses?: Array<{
    line1: string;
    city: string;
    state: string;
    zip: string;
    label?: string;
    isDefault?: boolean;
  }>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    role: { type: SchemaTypes.Mixed, required: true },
    role_id: { type: String, default: "" },
    dateOfBirth: { type: Date },
    department: { type: SchemaTypes.Mixed },
    department_id: { type: String, default: "" },
    gender: { type: String },
    username: { type: String, required: true, unique: true },
    profilePic: { type: String, required: true },
    otp: { type: String },
    otpExpiry: { type: Number },
    token: { type: String },
    user_id: { type: String, default: "" },
    user_guid: { type: String, default: "" },
    reporting_head_id: { type: SchemaTypes.Mixed, default: null },
    location_id: { type: SchemaTypes.Mixed, default: "" },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    created_by: { type: String, default: "" },
    created_on_date: { type: Date },
    status: { type: String, default: "active" },
    login_policy: { type: String, default: "single" },
    last_visitor_asigned_on: { type: Date },
    last_modified_on_date: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    __v: { type: Number, default: 0 },
    deletedAt: { type: Date },
    addresses: [
      {
        line1: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        label: { type: String, default: "Home" },
        isDefault: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;