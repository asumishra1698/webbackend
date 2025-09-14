import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
    developer: string;
    project_name: string;
    address: string;
    city: string;
    state: string;
    radius_meters: number;
    project_type: any;
    location: any;
    status: boolean;
    is_active: boolean;
    is_deleted: boolean;
    media: any[];
    created_by: string;
    created_on_date: Date;
    project_code: string;
    contact_person: string;
    contact_number: string;
    contact_email: string;
    project_completion_date: Date;
    project_start_date: Date;
    last_modified_by?: string;
    last_modified_on_date?: Date;
}

const ProjectSchema = new Schema<IProject>({
    developer: { type: String, required: true },
    project_name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    radius_meters: { type: Number, default: 0 },
    project_type: { type: Object, required: true },
    location: { type: Object },
    status: { type: Boolean, default: true },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    media: {
        type: [Object],
        default: [],
    },
    created_by: { type: String, required: true },
    created_on_date: { type: Date, default: Date.now },
    project_code: { type: String, required: true },
    contact_person: { type: String },
    contact_number: { type: String },
    contact_email: { type: String },
    project_completion_date: { type: Date },
    project_start_date: { type: Date },
    last_modified_by: { type: String },
    last_modified_on_date: { type: Date },
}, { timestamps: true });

export default mongoose.model<IProject>("Project", ProjectSchema);