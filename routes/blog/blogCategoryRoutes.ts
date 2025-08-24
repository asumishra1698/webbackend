import express from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import {
  createBlogCategory,
  getAllBlogCategories,
  updateBlogCategory,
  deleteBlogCategory,
} from "../../controllers/blog/blogCategoryController";

const router = express.Router();

router.post("/", authenticate, createBlogCategory);
router.get("/", getAllBlogCategories);
router.put("/:id", authenticate, updateBlogCategory);
router.delete("/:id", authenticate, deleteBlogCategory);

export default router;
