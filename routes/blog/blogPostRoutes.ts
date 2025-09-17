import express from "express";
import { allAdmin } from "../../config/permission";
import { uploadBlogImages } from "../../middlewares/uploadMiddleware";
import {
  createPost,
  getAllPosts,
  getPostBySlug,
  updatePost,
  deletePost,
  updatePostStatus,
} from "../../controllers/blog/blogPostController";

const router = express.Router();

router.post(
  "/",
  allAdmin,
  uploadBlogImages.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  createPost
);
router.get("/", getAllPosts);
router.get("/:slug", getPostBySlug);
router.delete("/:id", allAdmin, deletePost);
router.put(
  "/:id",
  allAdmin,
  uploadBlogImages.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  updatePost
);
router.patch("/:id/status", allAdmin, updatePostStatus);
export default router;