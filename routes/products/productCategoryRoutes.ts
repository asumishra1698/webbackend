import express from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { uploadCategoryImages } from "../../middlewares/uploadMiddleware";

import {
  createProductCategory,
  getAllProductCategories,
  getProductCategoryById,
  updateProductCategory,
  deleteProductCategory,
} from "../../controllers/products/productCategoryControllers";

const router = express.Router();

router.post(
  "/",
  authenticate,
  uploadCategoryImages.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "thumbnailImage", maxCount: 1 },
  ]),
  createProductCategory
);
router.get("/", authenticate, getAllProductCategories);
router.get("/:id", authenticate, getProductCategoryById);
router.put("/:id", authenticate, updateProductCategory);
router.delete("/:id", authenticate, deleteProductCategory);

export default router;
