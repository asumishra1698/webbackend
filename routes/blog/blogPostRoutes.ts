import express from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import {
  createPost,
  getAllPosts,
  getPostBySlug,
  updatePost,
  deletePost,
} from "../../controllers/blog/blogPostController";

const router = express.Router();

router.post("/", authenticate, createPost);
router.get("/", getAllPosts);
router.get("/:slug", getPostBySlug);
router.put("/:id", authenticate, updatePost);
router.delete("/:id", authenticate, deletePost);

export default router;
