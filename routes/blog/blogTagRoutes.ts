import express from "express";
import { allAdmin } from "../../config/permission";
import { createBlogTag, getAllBlogTags, updateBlogTag, deleteBlogTag } from "../../controllers/blog/blogTagController";

const router = express.Router();

router.post("/", allAdmin, createBlogTag);
router.get("/", getAllBlogTags);
router.put("/:id", allAdmin, updateBlogTag);
router.delete("/:id", allAdmin, deleteBlogTag);

export default router;