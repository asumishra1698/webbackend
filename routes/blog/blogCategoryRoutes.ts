import express from "express";
import { allAdmin } from "../../config/permission";
import {
  createBlogCategory,
  getAllBlogCategories,
  updateBlogCategory,
  deleteBlogCategory,
} from "../../controllers/blog/blogCategoryController";

const router = express.Router();

router.post("/", allAdmin, createBlogCategory);
router.get("/", getAllBlogCategories);
router.put("/:id", allAdmin, updateBlogCategory);
router.delete("/:id", allAdmin, deleteBlogCategory);

export default router;