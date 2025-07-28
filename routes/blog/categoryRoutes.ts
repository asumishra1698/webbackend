import express from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { createCategory, getAllCategories, updateCategory, deleteCategory } from "../../controllers/blog/categoryController";

const router = express.Router();

router.post("/", authenticate, createCategory);
router.get("/", getAllCategories);
router.put("/:id", authenticate, updateCategory);
router.delete("/:id", authenticate, deleteCategory);

export default router;