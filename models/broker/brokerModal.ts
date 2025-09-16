import mongoose, { Schema, Document, SchemaTypes } from "mongoose";

// Define the document interface
export interface IBrokerDocument {
    type: string;
    url: string;
    name: string;
    size: number;
    _id?: string; // MongoDB will auto-generate this
}

export interface IBroker extends Document {
    user_id: string;
    company_name: string;
    broker_name: string;
    owner_name: string;
    mobile_number: string;
    email_address: string;
    alt_mobile_number?: string;
    alt_email_address?: string;
    website_url?: string;
    rera_number: string;
    broker_code: string;
    counter: number;
    company_type: any;
    office_address: {
        line1: string;
        city: string;
        state: string;
        zip: string;
    };
    documents?: IBrokerDocument[];
    status: string;
    sales_rm_id: any;
    commission_structure: any[];
    createdAt?: Date;
    updatedAt?: Date;
    total_visits?: number;
    visitor_count?: number;
}

const BrokerDocumentSchema = new Schema(
    {
        type: { type: String, required: true },
        url: { type: String, required: true },
        name: { type: String, required: true },
        size: { type: Number, required: true },
    },
    { _id: true }
);

const BrokerSchema: Schema = new Schema(
    {
        user_id: { type: String, required: true },
        company_name: { type: String, required: true },
        broker_name: { type: String, required: true },
        owner_name: { type: String, required: true },
        mobile_number: { type: String, required: true },
        email_address: { type: String, required: true },
        alt_mobile_number: { type: String, default: "" },
        alt_email_address: { type: String, default: "" },
        website_url: { type: String, default: "" },
        rera_number: { type: String, required: true },
        broker_code: { type: String, required: true },
        counter: { type: Number, default: 0 },
        company_type: { type: SchemaTypes.Mixed, required: true },
        office_address: {
            line1: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zip: { type: String, required: true },
        },
        documents: { type: [BrokerDocumentSchema], default: [] },
        status: { type: String, default: "pending" },
        sales_rm_id: { type: SchemaTypes.Mixed, required: true },
        commission_structure: { type: [SchemaTypes.Mixed], default: [] },
        total_visits: { type: Number, default: 0 },
        visitor_count: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Broker = mongoose.model<IBroker>("Broker", BrokerSchema);

export default Broker;