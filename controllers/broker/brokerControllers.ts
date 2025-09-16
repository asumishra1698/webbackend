import { Request, Response, NextFunction } from "express";
import Broker from "../../models/broker/brokerModal";
import User from "../../models/auth/authModal";
import ReferenceCategory from "../../models/referenceData/referenceModal";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

export const createBroker = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const {
            company_name,
            broker_name,
            owner_name,
            mobile_number,
            email_address,
            alt_mobile_number,
            alt_email_address,
            website_url,
            rera_number,
            company_type,
            sales_rm_id,
            password,
        } = req.body;

        const existingUser = await User.findOne({
            $or: [
                { email: email_address },
                { mobile: mobile_number }
            ]
        });
        if (existingUser) {
            res.status(400).json({
                message: "Email address or mobile number already exists in users."
            });
            return;
        }

        const existingBroker = await Broker.findOne({
            $or: [
                { email_address: email_address },
                { mobile_number: mobile_number }
            ]
        });
        if (existingBroker) {
            res.status(400).json({
                message: "Email address or mobile number already exists in brokers."
            });
            return;
        }

        let officeAddressObj = req.body.office_address;
        if (typeof officeAddressObj === "string") {
            try {
                officeAddressObj = JSON.parse(officeAddressObj);
            } catch {
                res.status(400).json({ message: "Invalid office_address format" });
                return;
            }
        }

        const documentTypes = [
            "owner_photo",
            "aadhar_card",
            "pan_card",
            "gst_certificate",
            "office_photo",
            "rera_certificate",
            "letter_head",
            "cancelled_cheque",
            "agent_mou"
        ];

        let documents: Array<{ type: string; url: string; name: string; size: number }> = [];

        if (req.files && typeof req.files === "object") {
            documentTypes.forEach(type => {
                const fileArr = (req.files as Record<string, Express.Multer.File[]>)[type];
                if (fileArr && fileArr.length > 0) {
                    const file = fileArr[0];
                    documents.push({
                        type,
                        url: `/uploads/brokers/${file.filename}`,
                        name: file.originalname,
                        size: file.size
                    });
                }
            });
        }
        const companyTypeCategory = await ReferenceCategory.findOne({ cate_key: "company_type" });
        const companyTypeObj = companyTypeCategory?.items.find(
            (item: any) => item.key === company_type && item.is_active && !item.is_deleted
        );
        if (!companyTypeObj) {
            res.status(400).json({ message: "Invalid company_type" });
            return;
        }
        const salesRM = await User.findById(sales_rm_id).lean();
        if (!salesRM) {
            res.status(400).json({ message: "Invalid sales_rm_id" });
            return;
        }
        const salesRMObj = {
            _id: salesRM._id,
            user_name: salesRM.username,
            full_name: salesRM.name,
            mobile_number: salesRM.mobile,
            email_address: salesRM.email,
        };

        function generateRandomPassword(length = 8) {
            const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$";
            let pass = "";
            for (let i = 0; i < length; i++) {
                pass += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return pass;
        }

        let brokerUser = await User.findOne({ email: email_address });
        let generatedPassword = password;
        if (!brokerUser) {
            if (!generatedPassword) {
                generatedPassword = generateRandomPassword(10);
            }
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);
            brokerUser = await User.create({
                name: broker_name,
                email: email_address,
                mobile: mobile_number,
                password: hashedPassword,
                role: { key: "broker", name: "Broker" },
                username: email_address.split("@")[0],
                profilePic: "default-profile.png",
            });
            try {
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email_address,
                    subject: "Your Broker Account Credentials",
                    html: `
                        <h2>Welcome, ${broker_name}!</h2>
                        <p>Your broker account has been created.</p>
                        <p><b>Username:</b> ${email_address.split("@")[0]}</p>
                        <p><b>Password:</b> ${generatedPassword}</p>
                        <p>Please change your password after first login.</p>
                    `,
                };

                await transporter.sendMail(mailOptions);
            } catch (emailErr) {
                console.error("Error sending broker password email:", emailErr);
            }
        }

        const currentYear = new Date().getFullYear();
        const lastBroker = await Broker.findOne({}).sort({ createdAt: -1 }).lean();
        let nextNumber = 1;
        if (lastBroker && lastBroker.broker_code) {
            const match = lastBroker.broker_code.match(/BRO-(\d{4})-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[2], 10) + 1;
            }
        }
        const broker_code = `BRO-${currentYear}-${String(nextNumber).padStart(4, "0")}`;
        const broker = await Broker.create({
            user_id: brokerUser._id,
            company_name,
            broker_name,
            owner_name,
            mobile_number,
            email_address,
            alt_mobile_number,
            alt_email_address,
            website_url,
            rera_number,
            broker_code,
            counter: 0,
            company_type: companyTypeObj,
            office_address: officeAddressObj,
            documents,
            status: "approved",
            sales_rm_id: salesRMObj,
            commission_structure: [],
        });

        res.status(201).json({
            success: true,
            message: "Broker created successfully",
            data: broker,
        });
    } catch (err) {
        next(err);
    }
};

export const getAllBrokers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const filter: any = {};
        if (status && ["pending", "approved", "rejected"].includes(status as string)) {
            filter.status = status;
        }

        const totalBrokers = await Broker.countDocuments(filter);
        const brokers = await Broker.find(filter)
            .skip(skip)
            .limit(limitNum)
            .lean();

        res.status(200).json({
            success: true,
            message: "Broker list fetched successfully",
            data: {
                total: totalBrokers,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalBrokers / limitNum),
                data: brokers,
            },
            statusCode: 200,
        });
    } catch (err) {
        next(err);
    }
};