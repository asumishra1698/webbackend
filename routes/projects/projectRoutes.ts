import express from "express";
import { createProject, deleteProjectMedia, exportAllProjectsCSV, getAllProjects, getProjectById, softDeleteProject, updateProject, updateProjectStatus } from "../../controllers/projects/projectControllers";
import { allAdmin } from "../../config/permission";
import { uploadProjectMedia } from "../../middlewares/uploadMiddleware";
const router = express.Router();

router.post("/", uploadProjectMedia.fields([
    { name: "images" },
    { name: "videos" },
    { name: "documents" },
    { name: "brochure" },
    { name: "workThroughVideo" },
    { name: "floorPlanImg" }
]), allAdmin, createProject);
router.get("/export/", allAdmin, exportAllProjectsCSV);
router.get("/", allAdmin, getAllProjects);
router.get("/:id", allAdmin, getProjectById);
router.put(
    "/:id",
    uploadProjectMedia.fields([
        { name: "images" },
        { name: "videos" },
        { name: "documents" },
        { name: "brochure" },
        { name: "workThroughVideo" },
        { name: "floorPlanImg" }
    ]),
    allAdmin,
    updateProject
);
router.delete("/:id", allAdmin, softDeleteProject);
router.patch("/toggle-status/:id/active", allAdmin, updateProjectStatus);
router.delete("/:id/media/:mediaId", allAdmin, deleteProjectMedia);


export default router;