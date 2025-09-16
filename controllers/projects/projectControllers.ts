import mongoose from "mongoose";
import { Parser } from "json2csv";
import { Request, Response, NextFunction } from "express";
import Project from "../../models/projects/projectModel";
import ReferenceCategory from "../../models/referenceData/referenceModal";
const BASE_URL = process.env.BASE_URL;

async function hydrateProjectType(project_type: any) {
    if (project_type && project_type.key) {
        const category = await ReferenceCategory.findOne({ cate_key: "project_type" });
        return {
            ...project_type,
            category: category?.category,
            cate_key: category?.cate_key
        };
    } else if (typeof project_type === "string" || (project_type && project_type.toString)) {
        const category = await ReferenceCategory.findOne({ cate_key: "project_type" });
        let projectTypeObj = category?.items.find(
            (item: any) =>
                item.key === project_type ||
                (item._id?.toString && item._id.toString() === project_type)
        );
        if (projectTypeObj) {
            return {
                ...projectTypeObj,
                category: category?.category,
                cate_key: category?.cate_key
            };
        }
    }
    return project_type;
}

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
        const radius = Number(radius_meters);
        const active = is_active === "true" || is_active === true;
        const stat = status === "true" || status === true;
        let loc = location;
        if (typeof location === "string") {
            try {
                loc = JSON.parse(location);
            } catch {
                loc = {};
            }
        }
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
                            _id: new mongoose.Types.ObjectId(),
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

        async function generateProjectCode(): Promise<string> {
            const year = new Date().getFullYear();
            const lastProject = await Project.findOne({ project_code: { $regex: `^PRJ-${year}-` } })
                .sort({ createdAt: -1 });
            let serial = 1;
            if (lastProject && lastProject.project_code) {
                const parts = lastProject.project_code.split("-");
                if (parts.length === 3) {
                    const lastSerial = parseInt(parts[2], 10);
                    if (!isNaN(lastSerial)) serial = lastSerial + 1;
                }
            }
            const serialStr = serial.toString().padStart(4, "0");
            return `PRJ-${year}-${serialStr}`;
        }
        const code = project_code && project_code.trim() !== "" ? project_code : await generateProjectCode();

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
        const project_type = req.query.project_type as string;
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
        if (project_type) query["project_type.key"] = project_type;
        const totalItems = await Project.countDocuments(query);

        const projects = await Project.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        for (const project of projects) {
            project.project_type = await hydrateProjectType(project.project_type);
        }


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
        project.project_type = await hydrateProjectType(project.project_type);
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
                            _id: new mongoose.Types.ObjectId(),
                            img_url: `${BASE_URL}/uploads/projects/${file.filename}`,
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

        if (req.body.project_type) {
            const category = await ReferenceCategory.findOne({ cate_key: "project_type" });
            if (category) {
                const projectTypeItem = category.items.find(
                    (item: any) =>
                        item._id.toString() === req.body.project_type &&
                        item.is_active &&
                        !item.is_deleted
                );
                if (projectTypeItem) {
                    updateData.project_type = {
                        ...projectTypeItem,
                        category: category.category,
                        cate_key: category.cate_key,
                    };
                }
            }
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
        project.project_type = await hydrateProjectType(project.project_type);


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


export const exportAllProjectsCSV = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const projects = await Project.find({ is_deleted: false }).lean();
        const exportData = projects.map(project => ({
            _id: project._id,
            developer: project.developer,
            project_name: project.project_name,
            address: project.address,
            city: project.city,
            state: project.state,
            radius_meters: project.radius_meters,
            project_type: project.project_type?.name || "",
            status: project.status,
            is_active: project.is_active,
            is_deleted: project.is_deleted,
            Address: project.address,
            City: project.city,
            contact_person: project.contact_person,
            contact_number: project.contact_number,
            contact_email: project.contact_email,
            project_code: project.project_code,
            project_start_date: project.project_start_date,
            project_completion_date: project.project_completion_date,
            created_by: project.created_by,
            created_on_date: project.created_on_date,
            media: Array.isArray(project.media)
                ? project.media.map(m => m.img_url).join(", ")
                : "",
        }));

        const fields = Object.keys(exportData[0] || {});
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(exportData);

        res.header("Content-Type", "text/csv");
        res.attachment("projects.csv");
        res.send(csv);
    } catch (err) {
        next(err);
    }
};

export const deleteProjectMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id, mediaId } = req.params;
        const project = await Project.findOne({ _id: id, is_deleted: false });
        if (!project) {
            res.status(404).json({ success: false, message: "Project not found" });
            return;
        }
        const updatedMedia = project.media.filter(
            (m: any) => m._id?.toString() !== mediaId
        );

        project.media = updatedMedia;
        await project.save();

        res.status(200).json({
            success: true,
            message: "Project media deleted successfully",
            data: project,
        });
    } catch (err) {
        next(err);
    }
};