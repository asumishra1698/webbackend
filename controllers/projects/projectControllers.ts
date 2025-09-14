import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import Project from "../../models/projects/projectModel";
import ReferenceCategory from "../../models/referenceData/referenceModal";

export const createProject = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const {
            developer,
            project_name,
            address,
            city,
            state,
            radius_meters,
            project_type,
            location,
            status,
            is_active,
            created_by,
            project_code,
            contact_person,
            contact_number,
            contact_email,
            project_completion_date,
            project_start_date,
            last_modified_by,
            last_modified_on_date,
        } = req.body;

        // Parse numbers and booleans from strings
        const radius = Number(radius_meters);
        const active = is_active === "true" || is_active === true;
        const stat = status === "true" || status === true;

        // Parse location if sent as JSON string
        let loc = location;
        if (typeof location === "string") {
            try {
                loc = JSON.parse(location);
            } catch {
                loc = {};
            }
        }

        // Parse media if sent as JSON string
        let mediaArr: any[] = [];
        if (req.body.media) {
            try {
                mediaArr = typeof req.body.media === "string" ? JSON.parse(req.body.media) : req.body.media;
            } catch {
                mediaArr = [];
            }
        }

        // Handle uploaded files
        if (req.files && typeof req.files === "object") {
            const fileFields = [
                "images",
                "videos",
                "documents",
                "brochure",
                "workThroughVideo",
                "floorPlanImg"
            ];
            fileFields.forEach(field => {
                if (Array.isArray((req.files as any)[field])) {
                    (req.files as any)[field].forEach((file: any) => {
                        mediaArr.push({
                            img_url: `http://localhost:5000/uploads/projects/${file.filename}`,
                            doc_type: field,
                            description: file.originalname,
                            created_by,
                            created_on_date: new Date(),
                        });
                    });
                }
            });
        }

        const category = await ReferenceCategory.findOne({ cate_key: "project_type" });
        if (!category) {
            res.status(400).json({ success: false, message: "Project type category not found" });
            return;
        }
        const projectTypeItem = category.items.find(
            (item: any) =>
                item._id.toString() === project_type &&
                item.is_active &&
                !item.is_deleted
        );

        if (!projectTypeItem) {
            category.items.map((i: any) => i._id.toString());
            res.status(400).json({ success: false, message: "Invalid project type" });
            return;
        }

        function generateProjectCode(): string {
            const year = new Date().getFullYear();
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            return `PRJ-${year}-${randomNum}`;
        }
        const code = project_code && project_code.trim() !== "" ? project_code : generateProjectCode();

        // Create project
        const project = await Project.create({
            developer,
            project_name,
            address,
            city,
            state,
            radius_meters: radius,
            project_type: {
                ...projectTypeItem,
                category: category.category,
                cate_key: category.cate_key,
            },
            location: loc,
            status: true,
            is_active: true,
            media: mediaArr,
            created_by,
            project_code: code,
            contact_person,
            contact_number,
            contact_email,
            project_completion_date,
            project_start_date,
            last_modified_by,
            last_modified_on_date,
        });

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project,
        });
    } catch (err: any) {
        next(err);
    }
};

export const getAllProjects = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const search = (req.query.search as string) || "";
        const city = req.query.city as string;
        const state = req.query.state as string;
        const project_type_key = req.query.project_type_key as string;


        const query: any = { is_deleted: false };

        if (search) {
            query.$or = [
                { project_name: { $regex: search, $options: "i" } },
                { developer: { $regex: search, $options: "i" } },
                { address: { $regex: search, $options: "i" } }
            ];
        }
        if (city) query.city = city;
        if (state) query.state = state;
        if (project_type_key) query["project_type.key"] = project_type_key;
        const totalItems = await Project.countDocuments(query);

        const projects = await Project.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            message: "Projects fetched successfully",
            data: {
                data: projects,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems
            }
        });
    } catch (err) {
        next(err);
    }
};

export const getProjectById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const project = await Project.findOne({ _id: id, is_deleted: false });
        if (!project) {
            res.status(404).json({
                success: false,
                message: "Project not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Project fetched successfully",
            data: project,
        });
    } catch (err) {
        next(err);
    }
};


export const softDeleteProject = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const project = await Project.findOneAndUpdate(
            { _id: id, is_deleted: false },
            { is_deleted: true, deletedAt: new Date() },
            { new: true }
        );
        if (!project) {
            res.status(404).json({ success: false, message: "Project not found" });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Project deleted successfully",
            data: project,
        });
    } catch (err) {
        next(err);
    }
};


export const updateProject = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        let updateData = { ...req.body, updatedAt: new Date() };
        let mediaArr: any[] = [];

        if (req.body.media) {
            try {
                mediaArr = typeof req.body.media === "string" ? JSON.parse(req.body.media) : req.body.media;
            } catch {
                mediaArr = [];
            }
        }

        if (req.files && typeof req.files === "object") {
            const fileFields = [
                "images",
                "videos",
                "documents",
                "brochure",
                "workThroughVideo",
                "floorPlanImg"
            ];
            fileFields.forEach(field => {
                if (Array.isArray((req.files as any)[field])) {
                    (req.files as any)[field].forEach((file: any) => {
                        mediaArr.push({
                            img_url: `http://localhost:5000/uploads/projects/${file.filename}`,
                            doc_type: field,
                            description: file.originalname,
                            created_by: req.body.created_by,
                            created_on_date: new Date(),
                        });
                    });
                }
            });
        }
        if (mediaArr.length > 0) {
            const existingProject = await Project.findById(id);
            const oldMedia = existingProject?.media || [];
            updateData.media = [...oldMedia, ...mediaArr];
        }

        const project = await Project.findOneAndUpdate(
            { _id: id, is_deleted: false },
            updateData,
            { new: true }
        );
        if (!project) {
            res.status(404).json({ success: false, message: "Project not found" });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: project,
        });
    } catch (err) {
        next(err);
    }
};

export const updateProjectStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, is_active } = req.body;

        const updateFields: any = {};
        if (typeof status !== "undefined") updateFields.status = status === "true" || status === true;
        if (typeof is_active !== "undefined") updateFields.is_active = is_active === "true" || is_active === true;

        const project = await Project.findOneAndUpdate(
            { _id: id, is_deleted: false },
            updateFields,
            { new: true }
        );
        if (!project) {
            res.status(404).json({ success: false, message: "Project not found" });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Project status updated successfully",
            data: project,
        });
    } catch (err) {
        next(err);
    }
};