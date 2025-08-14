import express from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { uploadBlogImages } from "../../middlewares/uploadMiddleware";
import {
  createPost,
  getAllPosts,
  getPostBySlug,
  updatePost,
  deletePost,
} from "../../controllers/blog/blogPostController";

const router = express.Router();

router.post(
  "/",
  authenticate,
  uploadBlogImages.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  createPost
);

router.put(
  "/:id",
  authenticate,
  uploadBlogImages.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  updatePost
);
router.get("/", getAllPosts);
router.get("/:slug", getPostBySlug);
router.delete("/:id", authenticate, deletePost);

export default router;
