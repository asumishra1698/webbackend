import express from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { createTag, getAllTags, updateTag, deleteTag } from "../../controllers/blog/tagController";

const router = express.Router();

router.post("/", authenticate, createTag);
router.get("/", getAllTags);
router.put("/:id", authenticate, updateTag);
router.delete("/:id", authenticate, deleteTag);

export default router;