import express from "express";
import { createProject, getAllProjects, getProjectById, softDeleteProject, updateProject, updateProjectStatus } from "../../controllers/projects/projectControllers";
import { authenticate } from "../../middlewares/authMiddleware";
import { uploadProjectMedia } from "../../middlewares/uploadMiddleware";
const router = express.Router();

router.post("/", uploadProjectMedia.fields([
    { name: "images" },
    { name: "videos" },
    { name: "documents" },
    { name: "brochure" },
    { name: "workThroughVideo" },
    { name: "floorPlanImg" }
]), authenticate, createProject);
router.get("/", authenticate, getAllProjects);
router.get("/:id", authenticate, getProjectById);
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
    authenticate,
    updateProject
);
router.delete("/:id", authenticate, softDeleteProject);
router.patch("/:id/active", authenticate, updateProjectStatus);

export default router;