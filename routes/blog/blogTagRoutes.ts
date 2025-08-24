import express from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { createBlogTag, getAllBlogTags, updateBlogTag, deleteBlogTag } from "../../controllers/blog/blogTagController";

const router = express.Router();

router.post("/", authenticate, createBlogTag);
router.get("/", getAllBlogTags);
router.put("/:id", authenticate, updateBlogTag);
router.delete("/:id", authenticate, deleteBlogTag);

export default router;